// Decode a JWT, and check its signature with WebCrypto.
import { ALGORITHMS, decodePart, unb64url, verify } from '../jws.js';

const { tk } = window;

const input = document.querySelector('#jwt-input');
const header = document.querySelector('#jwt-header');
const payload = document.querySelector('#jwt-payload');
const signature = document.querySelector('#jwt-signature');
const status = document.querySelector('#jwt-status');

const keyInput = document.querySelector('#jwt-key');
const verifyStatus = document.querySelector('#jwt-verify-status');

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
    const ok = await verify(spec, keyInput.value, unb64url(parts[2]), signed);
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
