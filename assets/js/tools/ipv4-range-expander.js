// Expand an IPv4 range into the minimal set of CIDR blocks.
const { tk } = window;

const input = document.querySelector('#range-input');

function ipToInt(ip) {
  const parts = ip.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip.trim()}`);
  }
  return ((parts[0] * 2 ** 24) + (parts[1] * 2 ** 16) + (parts[2] * 2 ** 8) + parts[3]) >>> 0;
}

function intToIp(n) {
  const value = n >>> 0;
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

function rangeToCidr(start, end) {
  const blocks = [];
  let current = start;
  while (current <= end) {
    // Start from the smallest block (/32) and grow while it stays aligned and fits.
    let prefix = 32;
    while (prefix > 0) {
      const size = 2 ** (32 - (prefix - 1));
      if (current % size === 0 && current + size - 1 <= end) prefix -= 1;
      else break;
    }
    blocks.push(`${intToIp(current)}/${prefix}`);
    current += 2 ** (32 - prefix);
  }
  return blocks;
}

tk.transform({
  watch: input,
  output: document.querySelector('#range-output'),
  status: document.querySelector('#range-status'),
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const match = raw.match(/^\s*([\d.]+)\s*-\s*([\d.]+)\s*$/);
    if (!match) throw new Error('Use the form start-end, e.g. 10.0.0.0-10.0.0.255');
    const start = ipToInt(match[1]);
    const end = ipToInt(match[2]);
    if (start > end) throw new Error('Start must not be greater than end');
    return rangeToCidr(start, end).join('\n');
  },
});
