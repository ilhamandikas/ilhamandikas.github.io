// SNAP BI asymmetric signature (SHA256withRSA), matching the Midtrans demo.
// The string to sign is:
//   HTTPMethod + ":" + EndpointUrl + ":" + lowercase(hex(SHA256(minify(body)))) + ":" + X-TIMESTAMP
// Signing uses the private key, verification uses the public key. Both run in
// the browser through the Web Crypto API; no key ever leaves the page.
const { tk } = window;

const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
const SAMPLE = {
  method: 'POST',
  endpoint: '/v1.0/debit/notify',
  timestamp: '2024-05-02T14:43:08+07:00',
  body: '{"originalPartnerReferenceNo":"GP24043015193402809","originalReferenceNo":"A120240430081940S9vu8gSjaRID","merchantId":"G099333790","amount":{"value":"102800.00","currency":"IDR"},"latestTransactionStatus":"00","transactionStatusDesc":"SUCCESS","additionalInfo":{"refundHistory":[]}}',
  publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlWbtlh3eM+bW3n5AFj42
wddC4L7tQqbLiCFbTv8K67yng9iwK5mEn+UMXiRhvB2JVWFafCPPxFamsiVG3Mjn
eGjC0BYgmpmw4qXnAnyO3nCdCuPtmZ3ljhKvSTPdWZxrcLi1Xa9V/+Pzb8hrjb5i
wMn6SZFNeMmZYgFKiSeueo6TPln2PoTqXCzs1HtsM8eUVe8GAsjJe/3dYl992nyX
OpG21GgNu8o5T3WOptPg6GdDTWkTWUu483yRbVVy04Pz4L8DDZTDv+WcsAViDn1r
A/jB1Auj/UGKx2ovGcBH/a/hor5TbABbODU6cPTHT54K3sSZtvZNV4eFDB1f/4wd
fwIDAQAB
-----END PUBLIC KEY-----`,
  signature: 'RoJnP2tH/YiOhHM/lMVBMSAuzRmS8VrWdIy04Qqyb56daV7oWFMFoMMzqnjQ+q0MIUalYgU094GWQnCx2c29xb1kkqHhv2+iJ9xl6NjGmFGYqyvcKvUDAV83Y1Mw9JnsEcjcupdGw9/MRv/mm2GMrQ+BCZGfc4a46JDyPZbcY294vDGqs5rFBN6iYer5ro4cAQGo9hET2G82Y+j50vCyO/79GFE4vB1rvtu6PK2Bxi+vTYV8k7P7PS8tOPWM2O+kjiVWjwvLR99Botou+a8sxlQqZaihfWMKcByzV+Lgkr9cptpjys+1NIRWT1ad/sJBSLHyldzC3q2oRn5z5oZmyg==',
};

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
  els.method.value = SAMPLE.method;
  els.endpoint.value = SAMPLE.endpoint;
  els.timestamp.value = SAMPLE.timestamp;
  els.body.value = SAMPLE.body;
  els.publicKey.value = SAMPLE.publicKey;
  els.signature.value = SAMPLE.signature;
  preview();
  tk.setStatus(els.status, 'Loaded the Midtrans sample. Press Verify.', 'ok');
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
