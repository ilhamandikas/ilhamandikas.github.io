// SSH key generator — a key pair made in the page, never sent anywhere.
//
// A private key is the one thing on this site that must not travel. Generating it
// in the browser is not a limitation to work around; it is the reason the tool can
// exist at all.
//
// The private key is written in OpenSSH's own format (`openssh-key-v1`), not PKCS#8.
// PKCS#8 looks like the portable choice and is not: measured against OpenSSH 9.6,
// `ssh-keygen -y` refuses a PKCS#8 Ed25519 key — including one OpenSSL itself had
// just produced — with "invalid format". It accepts PKCS#8 for RSA and ECDSA only.
// Handing someone a key their own `ssh` will not load is not a portability win, so
// the OpenSSH container is what the main field holds; the PKCS#8 form is offered
// beside it for the tools that want it.
//
// The container is not encrypted (ciphername "none"), which is why the page says to
// add a passphrase with `ssh-keygen -p` rather than pretending one is already there.
import { md5 as md5Hex } from '../hash.js';
import { fromBase64, toPem } from '../pem.js';

const { tk } = window;

const els = {
  type: document.querySelector('#ssh-type'),
  comment: document.querySelector('#ssh-comment'),
  generate: document.querySelector('#ssh-generate'),
  status: document.querySelector('#ssh-status'),
  private: document.querySelector('#ssh-private'),
  pkcs8: document.querySelector('#ssh-pkcs8'),
  public: document.querySelector('#ssh-public'),
  fingerprint: document.querySelector('#ssh-fingerprint'),
  md5: document.querySelector('#ssh-md5'),
  note: document.querySelector('#ssh-note'),
};

let fileName = 'id_key';

/* ---------- SSH wire format ---------- */

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

const be32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);

// Every field in the wire format is a length-prefixed byte string, including the
// algorithm name and, for ECDSA, the curve name.
const sshString = (value) => {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return concat(be32(bytes.length), bytes);
};

// An SSH mpint is the wire format's own name for a length-prefixed big-endian
// two's-complement integer. The length prefix is part of the field: emitting the
// bare bytes produces a key file that reads as "incomplete message", so this
// helper returns the whole field and call sites never wrap it in sshString.
const mpint = (value) => {
  let at = 0;
  while (at < value.length - 1 && value[at] === 0) at += 1;
  const trimmed = value.subarray(at);
  return sshString(trimmed[0] & 0x80 ? concat(new Uint8Array([0]), trimmed) : trimmed);
};

const b64 = (bytes) => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const base64urlToBytes = (value) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(padded + '='.repeat((4 - (padded.length % 4)) % 4));
};

const hexToBytes = (hex) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
};

const toBigInt = (bytes) => BigInt(`0x${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join('') || '0'}`);

const fromBigInt = (value) => hexToBytes(value.toString(16).padStart(2, '0'));

// OpenSSH writes the RSA CRT coefficient as q^-1 mod p. WebCrypto usually hands it
// over as `qi`, but it is derivable, and a wrong value here produces a key that
// loads and then fails to sign — the worst possible failure mode.
function inverse(value, modulus) {
  let [r0, r1] = [((value % modulus) + modulus) % modulus, modulus];
  let [s0, s1] = [1n, 0n];
  while (r1 !== 0n) {
    const quotient = r0 / r1;
    [r0, r1] = [r1, r0 - quotient * r1];
    [s0, s1] = [s1, s0 - quotient * s1];
  }
  if (r0 !== 1n) throw new Error('the two RSA primes are not coprime, so this key cannot be written in the SSH format');
  return ((s0 % modulus) + modulus) % modulus;
}

/* ---------- algorithms ---------- */

const TYPES = {
  ed25519: { label: 'Ed25519', sshName: 'ssh-ed25519', file: 'id_ed25519', params: { name: 'Ed25519' } },
  'rsa-2048': { label: 'RSA 2048', sshName: 'ssh-rsa', file: 'id_rsa', rsa: 2048 },
  'rsa-3072': { label: 'RSA 3072', sshName: 'ssh-rsa', file: 'id_rsa', rsa: 3072 },
  'rsa-4096': { label: 'RSA 4096', sshName: 'ssh-rsa', file: 'id_rsa', rsa: 4096 },
  'ecdsa-p256': { label: 'ECDSA P-256', sshName: 'ecdsa-sha2-nistp256', sshCurve: 'nistp256', file: 'id_ecdsa', curve: 'P-256' },
  'ecdsa-p384': { label: 'ECDSA P-384', sshName: 'ecdsa-sha2-nistp384', sshCurve: 'nistp384', file: 'id_ecdsa', curve: 'P-384' },
  'ecdsa-p521': { label: 'ECDSA P-521', sshName: 'ecdsa-sha2-nistp521', sshCurve: 'nistp521', file: 'id_ecdsa', curve: 'P-521' },
};

// The algorithm table is data from the page, but a key name arriving from anywhere
// else must not be able to reach into Object.prototype.
const spec = (name) => (Object.prototype.hasOwnProperty.call(TYPES, name) ? TYPES[name] : null);

const paramsFor = (found) =>
  found.rsa
    ? { name: 'RSASSA-PKCS1-v1_5', modulusLength: found.rsa, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }
    : found.curve
      ? { name: 'ECDSA', namedCurve: found.curve }
      : found.params;

// An uncompressed EC point is 0x04 followed by the two coordinates, each padded to
// the field size. Getting that padding wrong is the classic way to produce a key
// that looks fine and is rejected by the server.
function ecPoint(jwk) {
  const x = base64urlToBytes(jwk.x);
  const y = base64urlToBytes(jwk.y);
  const size = Math.max(x.length, y.length);
  const point = new Uint8Array(1 + size * 2);
  point[0] = 0x04;
  point.set(x, 1 + size - x.length);
  point.set(y, 1 + size + size - y.length);
  return point;
}

// One export of the private key as a JWK carries both halves of the pair, and for
// Ed25519 it is the only route to the 32-byte seed the SSH format stores.
async function keyParts(found, pair) {
  let jwk;
  try {
    jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  } catch {
    throw new Error('this browser will not export the private key in a form the SSH format is built from — try another key type');
  }
  if (!jwk || !jwk.d) throw new Error('this browser exported the private key without its secret half');

  if (found.sshName === 'ssh-ed25519') {
    const seed = base64urlToBytes(jwk.d);
    const public32 = base64urlToBytes(jwk.x);
    return {
      blob: concat(sshString(found.sshName), sshString(public32)),
      // Ed25519 stores the private half as a plain string of seed || public, not an mpint.
      material: [sshString(public32), sshString(concat(seed, public32))],
    };
  }

  if (found.rsa) {
    const n = base64urlToBytes(jwk.n);
    const e = base64urlToBytes(jwk.e);
    const d = base64urlToBytes(jwk.d);
    const p = base64urlToBytes(jwk.p);
    const q = base64urlToBytes(jwk.q);
    const coefficient = jwk.qi ? base64urlToBytes(jwk.qi) : fromBigInt(inverse(toBigInt(q), toBigInt(p)));
    return {
      blob: concat(sshString(found.sshName), mpint(e), mpint(n)),
      // OpenSSH's order: n, e, d, iqmp, p, q.
      material: [mpint(n), mpint(e), mpint(d), mpint(coefficient), mpint(p), mpint(q)],
    };
  }

  const point = ecPoint(jwk);
  return {
    blob: concat(sshString(found.sshName), sshString(found.sshCurve), sshString(point)),
    material: [sshString(found.sshCurve), sshString(point), mpint(base64urlToBytes(jwk.d))],
  };
}

// OpenSSH pads the private blob with 1, 2, 3… up to the cipher block size, which is
// 8 even when nothing is encrypted. Matching the writer exactly keeps `ssh-keygen`
// happy rather than relying on it being forgiving.
const padTo = (length, block) => {
  const count = (block - (length % block)) % block;
  const out = new Uint8Array(count);
  for (let i = 0; i < count; i += 1) out[i] = i + 1;
  return out;
};

function opensshPrivate(keyType, blob, material, comment) {
  const check = new Uint8Array(4);
  crypto.getRandomValues(check);
  const body = concat(check, check, sshString(keyType), ...material, sshString(comment));
  return concat(
    new TextEncoder().encode('openssh-key-v1\0'),
    sshString('none'), // ciphername — unencrypted
    sshString('none'), // kdfname
    sshString(new Uint8Array(0)), // kdfoptions
    be32(1), // one key in the file
    sshString(blob),
    sshString(concat(body, padTo(body.length, 8))),
  );
}

async function generate() {
  const found = spec(els.type.value);
  if (!found) {
    tk.setStatus(els.status, 'Unknown key type', 'err');
    return;
  }

  els.generate.disabled = true;
  tk.setStatus(els.status, `Generating a ${found.label} key… RSA takes a moment at 4096 bits.`, '');
  for (const field of [els.private, els.pkcs8, els.public, els.fingerprint, els.md5]) field.value = '';
  els.note.textContent = '';

  // The message has to be painted before the main thread is handed to the key
  // generator, or a 4096-bit RSA key looks like a frozen page.
  await new Promise((resolve) => setTimeout(resolve, 0));

  try {
    const pair = await crypto.subtle.generateKey(paramsFor(found), true, ['sign', 'verify']);
    const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
    const { blob, material } = await keyParts(found, pair);

    const comment = els.comment.value.trim();
    const container = opensshPrivate(found.sshName, blob, material, comment);
    els.private.value = `${toPem(container, 'OPENSSH PRIVATE KEY', 70)}\n`;
    els.pkcs8.value = `${toPem(pkcs8, 'PRIVATE KEY')}\n`;
    els.public.value = `${found.sshName} ${b64(blob)}${comment ? ` ${comment}` : ''}\n`;

    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', blob));
    els.fingerprint.value = `SHA256:${b64(digest).replace(/=+$/, '')}`;
    // MD5 is not in WebCrypto, so the legacy fingerprint comes from the shared
    // module. It is here only because older consoles still print that form.
    els.md5.value = `MD5:${md5Hex(blob).replace(/(..)(?=..)/g, '$1:')}`;

    fileName = found.file;
    els.note.textContent = `${found.label} · public key ${blob.length} bytes`;
    tk.setStatus(els.status, 'Key pair ready. Save the private key before you leave this page — it exists only here.', 'ok');
  } catch (error) {
    const unsupported = /not supported|Unrecognized|OperationError|NotSupported/i.test(String(error));
    tk.setStatus(
      els.status,
      unsupported
        ? `This browser cannot generate ${found.label} keys.${found.sshName === 'ssh-ed25519' ? ' Ed25519 arrived in Chrome 113, Firefox 130 and Safari 17 — pick an RSA or ECDSA key instead.' : ' Try another key type.'}`
        : `Generating the key failed: ${error.message}`,
      'err',
    );
  } finally {
    els.generate.disabled = false;
  }
}

/* ---------- wiring ---------- */

els.type.addEventListener('change', () => {
  els.note.textContent = '';
  tk.setStatus(els.status, '');
});
els.generate.addEventListener('click', generate);

document.querySelector('#ssh-copy-private').addEventListener('click', async () => {
  await navigator.clipboard?.writeText(els.private.value);
  tk.flash(els.status, 'Private key copied — paste it into a file, then clear the clipboard', 'ok');
});
document.querySelector('#ssh-copy-pkcs8').addEventListener('click', async () => {
  await navigator.clipboard?.writeText(els.pkcs8.value);
  tk.flash(els.status, 'PKCS#8 key copied — paste it into a file, then clear the clipboard', 'ok');
});
document.querySelector('#ssh-copy-public').addEventListener('click', async () => {
  await navigator.clipboard?.writeText(els.public.value);
  tk.flash(els.status, 'Public key copied', 'ok');
});
document.querySelector('#ssh-download-private').addEventListener('click', () => {
  tk.download(fileName, els.private.value, 'application/x-pem-file');
});
document.querySelector('#ssh-download-pkcs8').addEventListener('click', () => {
  tk.download(`${fileName}.pkcs8.pem`, els.pkcs8.value, 'application/x-pem-file');
});
document.querySelector('#ssh-download-public').addEventListener('click', () => {
  tk.download(`${fileName}.pub`, els.public.value, 'text/plain');
});
