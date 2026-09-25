// AES-GCM encryption with a PBKDF2-derived key. Runs entirely in the browser.
const { tk } = window;

const mode = document.querySelector('#aes-mode');
const password = document.querySelector('#aes-pass');
const input = document.querySelector('#aes-input');
const output = document.querySelector('#aes-output');
const status = document.querySelector('#aes-status');

const ITERATIONS = 250000;

const bytesToB64 = (bytes) => btoa(String.fromCharCode(...bytes));
const b64ToBytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

async function deriveKey(secret, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encrypt() {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password.value, salt);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(input.value)));
  const payload = new Uint8Array(salt.length + iv.length + cipher.length);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(cipher, salt.length + iv.length);
  return bytesToB64(payload);
}

async function decrypt() {
  const payload = b64ToBytes(input.value.trim());
  const salt = payload.slice(0, 16);
  const iv = payload.slice(16, 28);
  const cipher = payload.slice(28);
  const key = await deriveKey(password.value, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

document.querySelector('#aes-run').addEventListener('click', async () => {
  try {
    if (password.value === '') throw new Error('Enter a password');
    if (input.value === '') throw new Error('Enter some input');
    output.value = mode.value === 'encrypt' ? await encrypt() : await decrypt();
    tk.setStatus(status, mode.value === 'encrypt' ? 'Encrypted' : 'Decrypted', 'ok');
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message || 'Operation failed', 'err');
  }
});
