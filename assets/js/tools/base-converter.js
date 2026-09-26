// Number base converter (2–36) using BigInt so long values stay exact.
const { tk } = window;

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const input = document.querySelector('#bc-input');
const from = document.querySelector('#bc-from');
const to = document.querySelector('#bc-to');

function parse(value, base) {
  let text = value.trim().toLowerCase().replace(/\s+/g, '');
  if (text === '') return null;
  let sign = 1n;
  if (text[0] === '-') { sign = -1n; text = text.slice(1); }
  if (base === 16 && text.startsWith('0x')) text = text.slice(2);
  if (base === 2 && text.startsWith('0b')) text = text.slice(2);
  if (base === 8 && text.startsWith('0o')) text = text.slice(2);

  let n = 0n;
  for (const ch of text) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) throw new Error(`"${ch}" is not a valid base-${base} digit`);
    n = n * BigInt(base) + BigInt(d);
  }
  return n * sign;
}

function stringify(n, base) {
  if (n === 0n) return '0';
  let sign = '';
  let value = n;
  if (value < 0n) { sign = '-'; value = -value; }
  const b = BigInt(base);
  let out = '';
  while (value > 0n) {
    out = DIGITS[Number(value % b)] + out;
    value /= b;
  }
  return sign + out;
}

tk.transform({
  watch: [input, from, to],
  output: document.querySelector('#bc-output'),
  status: document.querySelector('#bc-status'),
  fn: () => {
    const base = Number(from.value);
    const target = Number(to.value);
    if (base < 2 || base > 36 || target < 2 || target > 36) throw new Error('Bases must be between 2 and 36');
    const n = parse(input.value, base);
    return n === null ? '' : stringify(n, target);
  },
});

document.querySelector('#bc-swap').addEventListener('click', () => {
  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;
  input.dispatchEvent(new Event('input'));
});
