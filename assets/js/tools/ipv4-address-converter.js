// IPv4 address converter — accepts dotted, decimal, hex or 32-bit binary.
const { tk } = window;

const input = document.querySelector('#ip-input');

function parse(input_) {
  const value = input_.trim();
  if (value === '') return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    const parts = value.split('.').map(Number);
    if (parts.some((p) => p > 255)) throw new Error('Each octet must be 0–255');
    return ((parts[0] * 2 ** 24) + (parts[1] * 2 ** 16) + (parts[2] * 2 ** 8) + parts[3]) >>> 0;
  }
  if (/^0x[0-9a-f]+$/i.test(value)) return parseInt(value, 16) >>> 0;
  if (/^[01]{32}$/.test(value)) return parseInt(value, 2) >>> 0;
  if (/^\d+$/.test(value)) {
    const n = Number(value);
    if (n > 0xffffffff) throw new Error('Decimal value is out of range');
    return n >>> 0;
  }
  throw new Error('Unrecognised IPv4 format');
}

function format(n) {
  const value = n >>> 0;
  const dotted = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
  return [
    `Dotted:  ${dotted}`,
    `Decimal: ${value}`,
    `Hex:     0x${value.toString(16).toUpperCase().padStart(8, '0')}`,
    `Binary:  ${value.toString(2).padStart(32, '0')}`,
  ].join('\n');
}

tk.transform({
  watch: input,
  output: document.querySelector('#ip-output'),
  status: document.querySelector('#ip-status'),
  ok: 'Valid IPv4',
  fn: () => {
    const n = parse(input.value);
    return n === null ? '' : format(n);
  },
});
