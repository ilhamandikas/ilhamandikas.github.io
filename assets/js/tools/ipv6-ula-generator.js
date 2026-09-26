// IPv6 Unique Local Address (/48) generator — fd00::/8 + 40 random bits.
const { tk } = window;

const count = document.querySelector('#ula-count');
const output = document.querySelector('#ula-output');

function ulaPrefix() {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `fd${hex.slice(0, 2)}:${hex.slice(2, 6)}:${hex.slice(6, 10)}::/48`;
}

function generate() {
  const n = Math.max(1, Math.min(100, Number(count.value) || 1));
  output.value = Array.from({ length: n }, ulaPrefix).join('\n');
}

document.querySelector('#ula-generate').addEventListener('click', generate);
count.addEventListener('change', generate);
generate();
