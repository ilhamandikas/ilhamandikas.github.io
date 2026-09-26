// TOTP generator (RFC 6238) built on WebCrypto HMAC.
const { tk } = window;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const secret = document.querySelector('#otp-secret');
const digits = document.querySelector('#otp-digits');
const period = document.querySelector('#otp-period');
const algo = document.querySelector('#otp-algo');
const codeEl = document.querySelector('#otp-code');
const status = document.querySelector('#otp-status');

function base32Decode(value) {
  const clean = value.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  for (const ch of clean) {
    const index = ALPHABET.indexOf(ch);
    if (index < 0) throw new Error(`Invalid Base32 character "${ch}"`);
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return new Uint8Array(bytes);
}

async function totp() {
  const key = base32Decode(secret.value);
  if (key.length === 0) throw new Error('Secret is empty');
  const step = Math.max(10, Math.min(120, Number(period.value) || 30));
  const length = Number(digits.value);
  const counter = Math.floor(Date.now() / 1000 / step);

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);

  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: algo.value }, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buffer));
  const offset = signature[signature.length - 1] & 0x0f;
  const binary = ((signature[offset] & 0x7f) << 24)
    | ((signature[offset + 1] & 0xff) << 16)
    | ((signature[offset + 2] & 0xff) << 8)
    | (signature[offset + 3] & 0xff);
  const code = (binary % 10 ** length).toString().padStart(length, '0');
  const remaining = step - (Math.floor(Date.now() / 1000) % step);
  return { code, remaining, step };
}

async function update() {
  try {
    const { code, remaining } = await totp();
    codeEl.textContent = code.replace(/(\d{3})(?=\d)/g, '$1 ');
    tk.setStatus(status, `Valid for ${remaining}s`, 'ok');
  } catch (error) {
    codeEl.textContent = '------';
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live([secret, digits, period, algo], update);
setInterval(update, 1000);
