// HMAC generator and verifier — WebCrypto HMAC with a selectable digest.
const { tk } = window;

const text = document.querySelector('#hmac-text');
const key = document.querySelector('#hmac-key');
const algo = document.querySelector('#hmac-algo');
const format = document.querySelector('#hmac-format');
const output = document.querySelector('#hmac-output');
const outputLabel = document.querySelector('#hmac-output-label');
const expected = document.querySelector('#hmac-expected');
const status = document.querySelector('#hmac-status');
const verifyStatus = document.querySelector('#hmac-verify-status');

let bytes = null;

function encode(value, encoding) {
  if (encoding === 'base64') {
    let binary = '';
    value.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function verify() {
  if (!bytes || !expected.value.trim()) {
    tk.setStatus(verifyStatus, '');
    return;
  }
  const wanted = expected.value.replace(/\s+/g, '');
  // Accept either encoding, whichever the pasted value looks like.
  const isHex = /^[0-9a-fA-F]+$/.test(wanted);
  const actual = isHex ? encode(bytes, 'hex') : encode(bytes, 'base64');
  const ok = isHex ? wanted.toLowerCase() === actual : wanted === actual;
  tk.setStatus(verifyStatus, ok ? 'Signature matches.' : 'Signature does not match.', ok ? 'ok' : 'err');
}

async function compute() {
  if (text.value === '') {
    bytes = null;
    output.value = '';
    tk.setStatus(status, '');
    tk.setStatus(verifyStatus, '');
    return;
  }
  try {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key.value), { name: 'HMAC', hash: algo.value }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(text.value));
    bytes = new Uint8Array(signature);
    output.value = encode(bytes, format.value);
    tk.setStatus(status, 'Signed', 'ok');
    verify();
  } catch (error) {
    bytes = null;
    output.value = '';
    tk.setStatus(status, error.message, 'err');
  }
}

function syncFormat() {
  outputLabel.textContent = `HMAC (${format.value})`;
  if (bytes) output.value = encode(bytes, format.value);
  verify();
}

const debounced = tk.debounce(compute, 120);
[text, key].forEach((el) => el.addEventListener('input', debounced));
algo.addEventListener('change', compute);
format.addEventListener('change', syncFormat);
expected.addEventListener('input', verify);
compute();
