// Roman numeral converter (1–3999).
const { tk } = window;

const TABLE = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];
const VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function toRoman(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error('Enter a whole number from 1 to 3999');
  let rest = n;
  let out = '';
  for (const [amount, symbol] of TABLE) {
    while (rest >= amount) { out += symbol; rest -= amount; }
  }
  return out;
}

function fromRoman(text) {
  const clean = text.toUpperCase().replace(/[^IVXLCDM]/g, '');
  if (!clean) throw new Error('Not a Roman numeral');
  let total = 0;
  for (let i = 0; i < clean.length; i += 1) {
    const value = VALUES[clean[i]];
    const next = VALUES[clean[i + 1]] || 0;
    total += value < next ? -value : value;
  }
  if (toRoman(total) !== clean) throw new Error('Not a valid Roman numeral');
  return String(total);
}

const input = document.querySelector('#roman-input');
const direction = document.querySelector('#roman-dir');

tk.transform({
  watch: [input, direction],
  output: document.querySelector('#roman-output'),
  status: document.querySelector('#roman-status'),
  fn: () => (direction.value === 'encode' ? toRoman(input.value) : fromRoman(input.value)),
});
