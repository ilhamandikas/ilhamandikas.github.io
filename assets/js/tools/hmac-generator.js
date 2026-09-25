// HMAC generator — WebCrypto HMAC with a selectable digest.
const { tk } = window;

const text = document.querySelector('#hmac-text');
const key = document.querySelector('#hmac-key');
const algo = document.querySelector('#hmac-algo');
const output = document.querySelector('#hmac-output');
const status = document.querySelector('#hmac-status');

async function compute() {
  if (text.value === '') {
    output.value = '';
    tk.setStatus(status, '');
    return;
  }
  try {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key.value), { name: 'HMAC', hash: algo.value }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(text.value));
    output.value = [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
    tk.setStatus(status, 'Signed', 'ok');
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message, 'err');
  }
}

const debounced = tk.debounce(compute, 120);
[text, key].forEach((el) => el.addEventListener('input', debounced));
algo.addEventListener('change', compute);
compute();
