// Decode a JWT, and check its signature with WebCrypto.
import { ecdsaToRaw, fromBase64, pemBytes, spkiFromPkcs1 } from '../pem.js';

const { tk } = window;

const input = document.querySelector('#jwt-input');
const header = document.querySelector('#jwt-header');
const payload = document.querySelector('#jwt-payload');
const signature = document.querySelector('#jwt-signature');
const status = document.querySelector('#jwt-status');

const keyInput = document.querySelector('#jwt-key');
const verifyStatus = document.querySelector('#jwt-verify-status');

// JWS algorithm names, mapped onto what WebCrypto needs. HS* take the shared
// secret as raw UTF-8 bytes; everything else takes a PEM public key.
const ALGORITHMS = {
  HS256: { kind: 'hmac', hash: 'SHA-256' },
  HS384: { kind: 'hmac', hash: 'SHA-384' },
  HS512: { kind: 'hmac', hash: 'SHA-512' },
  RS256: { kind: 'rsa', name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  RS384: { kind: 'rsa', name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' },
  RS512: { kind: 'rsa', name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' },
  PS256: { kind: 'rsa', name: 'RSA-PSS', hash: 'SHA-256', saltLength: 32 },
  PS384: { kind: 'rsa', name: 'RSA-PSS', hash: 'SHA-384', saltLength: 48 },
  PS512: { kind: 'rsa', name: 'RSA-PSS', hash: 'SHA-512', saltLength: 64 },
  ES256: { kind: 'ec', namedCurve: 'P-256', hash: 'SHA-256', size: 32 },
  ES384: { kind: 'ec', namedCurve: 'P-384', hash: 'SHA-384', size: 48 },
  ES512: { kind: 'ec', namedCurve: 'P-521', hash: 'SHA-512', size: 66 },
};

// JWS base64url, not plain base64, and usually unpadded.
const b64url = (value) => {
  const v = value.replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(v + '='.repeat((4 - (v.length % 4)) % 4));
};

function decodePart(part) {
  return JSON.parse(tk.b64decode(part, { urlSafe: true }));
}

function withDates(claims) {
  const clone = { ...claims };
  for (const key of ['exp', 'iat', 'nbf']) {
    if (typeof clone[key] === 'number') {
      clone[`${key} (readable)`] = new Date(clone[key] * 1000).toISOString();
    }
  }
  return clone;
}

tk.transform({
  watch: input,
  status,
  fn: () => {
    const token = input.value.trim();
    if (token === '') {
      header.textContent = '';
      payload.textContent = '';
      signature.textContent = '';
      return '';
    }
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('A JWT needs at least two dot-separated parts');
    header.textContent = JSON.stringify(decodePart(parts[0]), null, 2);
    const claims = withDates(decodePart(parts[1]));
    payload.textContent = JSON.stringify(claims, null, 2);
    signature.textContent = parts[2] || '(none)';

    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.exp === 'number') {
      return claims.exp < now ? 'Token is expired' : `Expires ${new Date(claims.exp * 1000).toLocaleString()}`;
    }
    return 'Decoded — the signature has not been checked';
  },
});

document.querySelector('#jwt-verify').addEventListener('click', async () => {
  const token = input.value.trim();
  if (token === '') {
    tk.setStatus(verifyStatus, 'Paste a token first');
    return;
  }

  const parts = token.split('.');

  let alg;
  try {
    alg = decodePart(parts[0]).alg;
  } catch {
    tk.setStatus(verifyStatus, 'The header is not readable JSON', 'err');
    return;
  }

  // Asked before anything else: an unsigned token is the one answer worth
  // shouting about, and "alg: none" tokens usually carry no signature at all.
  if (alg === undefined || alg === null || String(alg).toLowerCase() === 'none') {
    tk.setStatus(verifyStatus, 'alg is "none" — the token is unsigned, so anyone could have written it', 'err');
    return;
  }

  if (parts.length !== 3 || parts[2] === '') {
    tk.setStatus(verifyStatus, 'This token has no signature to check', 'err');
    return;
  }

  // hasOwn, not a bare lookup: `alg` comes from the token, so "toString" would
  // otherwise reach up the prototype chain and find something truthy.
  const spec = Object.prototype.hasOwnProperty.call(ALGORITHMS, alg) ? ALGORITHMS[alg] : null;
  if (!spec) {
    tk.setStatus(verifyStatus, `This page cannot check ${alg} — it handles HS, RS, PS and ES`, 'err');
    return;
  }

  const wanted = spec.kind === 'hmac' ? 'secret' : 'public key';
  if (keyInput.value.trim() === '') {
    tk.setStatus(verifyStatus, `Paste the ${wanted} to check ${alg}`);
    return;
  }

  // The classic algorithm-confusion attack: an attacker takes a public key, signs
  // an HS256 token with it as if it were a shared secret, and a verifier that
  // trusts the token's own alg happily agrees. There is no legitimate HMAC secret
  // that looks like a PEM file, so this is always worth stopping for.
  if (spec.kind === 'hmac' && /-----BEGIN [A-Z ]+-----/.test(keyInput.value)) {
    tk.setStatus(
      verifyStatus,
      `${alg} uses a shared secret, but that is a PEM key. This is the shape of the algorithm-confusion attack — check the algorithm you expect before pasting anything.`,
      'err',
    );
    return;
  }

  tk.setStatus(verifyStatus, 'Checking…');
  try {
    // The signature covers the header and payload exactly as they arrived, so
    // they are signed as text rather than re-encoded from the parsed objects.
    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const sig = b64url(parts[2]);
    let ok;

    if (spec.kind === 'hmac') {
      const secret = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(keyInput.value),
        { name: 'HMAC', hash: spec.hash },
        false,
        ['verify'],
      );
      ok = await crypto.subtle.verify('HMAC', secret, sig, signed);
    } else if (spec.kind === 'rsa') {
      const { kind, bytes } = pemBytes(keyInput.value, 'PUBLIC KEY');
      const publicKey = await crypto.subtle.importKey(
        'spki',
        kind === 'RSA PUBLIC KEY' ? spkiFromPkcs1(bytes) : bytes,
        { name: spec.name, hash: spec.hash },
        false,
        ['verify'],
      );
      const params = spec.name === 'RSA-PSS' ? { name: 'RSA-PSS', saltLength: spec.saltLength } : spec.name;
      ok = await crypto.subtle.verify(params, publicKey, sig, signed);
    } else {
      const { bytes } = pemBytes(keyInput.value, 'PUBLIC KEY');
      const publicKey = await crypto.subtle.importKey(
        'spki',
        bytes,
        { name: 'ECDSA', namedCurve: spec.namedCurve },
        false,
        ['verify'],
      );
      ok = await crypto.subtle.verify(
        { name: 'ECDSA', hash: spec.hash },
        publicKey,
        ecdsaToRaw(sig, spec.size),
        signed,
      );
    }

    tk.setStatus(
      verifyStatus,
      ok
        ? `${alg} signature is valid — this token was signed by the holder of that ${wanted}`
        : `${alg} signature does not match that ${wanted}`,
      ok ? 'ok' : 'err',
    );
  } catch (error) {
    tk.setStatus(verifyStatus, error.message, 'err');
  }
});
