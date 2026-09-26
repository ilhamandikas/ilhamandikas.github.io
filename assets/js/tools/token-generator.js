// Random token / password generator using a chosen charset.
const { tk } = window;

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/',
};

const controls = {
  count: document.querySelector('#token-count'),
  length: document.querySelector('#token-length'),
  lower: document.querySelector('#token-lower'),
  upper: document.querySelector('#token-upper'),
  digits: document.querySelector('#token-digits'),
  symbols: document.querySelector('#token-symbols'),
};
const output = document.querySelector('#token-output');

// Uniform random index without modulo bias.
function randomIndex(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

function generate() {
  let charset = '';
  if (controls.lower.checked) charset += SETS.lower;
  if (controls.upper.checked) charset += SETS.upper;
  if (controls.digits.checked) charset += SETS.digits;
  if (controls.symbols.checked) charset += SETS.symbols;
  if (!charset) charset = SETS.lower;

  const count = Math.max(1, Math.min(500, Number(controls.count.value) || 1));
  const length = Math.max(4, Math.min(256, Number(controls.length.value) || 32));

  output.value = Array.from({ length: count }, () =>
    Array.from({ length }, () => charset[randomIndex(charset.length)]).join(''),
  ).join('\n');
}

document.querySelector('#token-generate').addEventListener('click', generate);
Object.values(controls).forEach((el) => el.addEventListener('change', generate));
generate();
