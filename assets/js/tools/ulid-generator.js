// ULID generator — 48-bit timestamp + 80-bit randomness, Crockford base32.
const { tk } = window;

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeTime(ms, length) {
  let out = '';
  let value = ms;
  for (let i = length - 1; i >= 0; i -= 1) {
    const mod = value % 32;
    out = ENCODING[mod] + out;
    value = (value - mod) / 32;
  }
  return out;
}

function encodeRandom(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => ENCODING[b % 32]).join('');
}

const ulid = () => encodeTime(Date.now(), 10) + encodeRandom(16);

const count = document.querySelector('#ulid-count');
const output = document.querySelector('#ulid-output');

function generate() {
  const n = Math.max(1, Math.min(1000, Number(count.value) || 1));
  output.value = Array.from({ length: n }, ulid).join('\n');
}

document.querySelector('#ulid-generate').addEventListener('click', generate);
count.addEventListener('change', generate);
generate();
