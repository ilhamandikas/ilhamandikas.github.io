// SNAP BI asymmetric signature (SHA256withRSA).
// The string to sign is:
//   HTTPMethod + ":" + EndpointUrl + ":" + lowercase(hex(SHA256(minify(body)))) + ":" + X-TIMESTAMP
// Signing uses the private key, verification uses the public key. Both run in
// the browser through the Web Crypto API; no key ever leaves the page.
const { tk } = window;

const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };

const els = {
  mode: document.querySelector('#snap-mode'),
  method: document.querySelector('#snap-method'),
  endpoint: document.querySelector('#snap-endpoint'),
  timestamp: document.querySelector('#snap-timestamp'),
  body: document.querySelector('#snap-body'),
  privateKey: document.querySelector('#snap-private'),
  publicKey: document.querySelector('#snap-public'),
  signature: document.querySelector('#snap-signature'),
  signatureField: document.querySelector('#snap-signature-field'),
  keyHint: document.querySelector('#snap-key-hint'),
  run: document.querySelector('#snap-run'),
  now: document.querySelector('#snap-now'),
  keygen: document.querySelector('#snap-keygen'),
  sample: document.querySelector('#snap-sample'),
  minified: document.querySelector('#snap-minified'),
  hash: document.querySelector('#snap-hash'),
  string: document.querySelector('#snap-string'),
  out: document.querySelector('#snap-out'),
  status: document.querySelector('#snap-status'),
};

// Known-good sample: a generic SNAP BI notification and a matching signature, so
// Verify returns true before the user touches anything. "Load sample" restores it.
const INITIAL = {
  method: els.method.value,
  endpoint: els.endpoint.value,
  timestamp: els.timestamp.value,
  body: els.body.value,
  publicKey: els.publicKey.value,
  signature: els.signature.value,
};

function pemToBuffer(pem) {
  const body = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  if (!body) throw new Error('The key is empty.');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToPem(buffer, label) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  const lines = (btoa(binary).match(/.{1,64}/g) || []).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBuffer(value) {
  const binary = atob(value.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

const importPrivate = (pem) => crypto.subtle.importKey('pkcs8', pemToBuffer(pem), ALG, false, ['sign']);
const importPublic = (pem) => crypto.subtle.importKey('spki', pemToBuffer(pem), ALG, false, ['verify']);

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function minify(body) {
  const trimmed = body.trim();
  if (!trimmed) return '';
  try {
    return JSON.stringify(JSON.parse(trimmed));
  } catch {
    return trimmed;
  }
}

function stringToSign(method, endpoint, hash, timestamp) {
  return `${method.toUpperCase()}:${endpoint}:${hash}:${timestamp}`;
}

let token = 0;

// Recompute the minified body, its hash and the string to sign as the user
// types. No crypto here, so it is safe to run on every keystroke.
async function preview() {
  const minified = minify(els.body.value);
  const hash = await sha256Hex(minified);
  els.minified.value = minified;
  els.hash.value = hash;
  els.string.value = stringToSign(els.method.value, els.endpoint.value, hash, els.timestamp.value);
}

function syncMode() {
  const generate = els.mode.value === 'generate';
  els.signatureField.hidden = generate;
  els.run.textContent = generate ? 'Sign' : 'Verify';
  els.keyHint.textContent = generate
    ? 'The private key signs. Keep it secret and never paste a production key into a public tool.'
    : 'The public key verifies. This is the key of whoever sent the notification, not yours.';
}

async function run() {
  const mine = ++token;
  syncMode();
  await preview();
  if (mine !== token) return;
  const data = new TextEncoder().encode(els.string.value);
  try {
    if (els.mode.value === 'generate') {
      const key = await importPrivate(els.privateKey.value);
      const signature = bufferToBase64(await crypto.subtle.sign(ALG, key, data));
      if (mine !== token) return;
      els.out.value = signature;
      tk.setStatus(els.status, 'Signed with SHA256withRSA.', 'ok');
    } else {
      const key = await importPublic(els.publicKey.value);
      const ok = await crypto.subtle.verify(ALG, key, base64ToBuffer(els.signature.value), data);
      if (mine !== token) return;
      els.out.value = ok ? 'true' : 'false';
      tk.setStatus(els.status, ok ? 'Signature is valid.' : 'Signature does not match.', ok ? 'ok' : 'err');
    }
  } catch (error) {
    if (mine !== token) return;
    els.out.value = '';
    tk.setStatus(els.status, `Failed: ${error.message}`, 'err');
  }
}

async function keygen() {
  tk.setStatus(els.status, 'Generating a 2048-bit RSA key pair…');
  try {
    const pair = await crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify'],
    );
    els.privateKey.value = bufferToPem(await crypto.subtle.exportKey('pkcs8', pair.privateKey), 'PRIVATE KEY');
    els.publicKey.value = bufferToPem(await crypto.subtle.exportKey('spki', pair.publicKey), 'PUBLIC KEY');
    tk.setStatus(els.status, 'Key pair generated. Sign, then switch to Verify to check it.', 'ok');
  } catch (error) {
    tk.setStatus(els.status, `Failed to generate a key: ${error.message}`, 'err');
  }
}

function loadSample() {
  Object.entries(INITIAL).forEach(([key, value]) => { els[key].value = value; });
  preview();
  tk.setStatus(els.status, 'Loaded the sample request. Press Verify.', 'ok');
}

els.mode.addEventListener('change', syncMode);
els.run.addEventListener('click', run);
els.keygen.addEventListener('click', keygen);
els.sample.addEventListener('click', loadSample);
els.now.addEventListener('click', () => {
  els.timestamp.value = new Date().toISOString();
  preview();
});
tk.live([els.method, els.endpoint, els.timestamp, els.body], preview);

els.mode.value = 'verify';
syncMode();
preview();
