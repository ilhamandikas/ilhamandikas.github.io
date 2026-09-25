// MAC address generator with an optional fixed prefix.
const { tk } = window;

const count = document.querySelector('#mac-count');
const prefixInput = document.querySelector('#mac-prefix');
const separator = document.querySelector('#mac-sep');
const upper = document.querySelector('#mac-upper');
const output = document.querySelector('#mac-output');
const status = document.querySelector('#mac-status');

function randomByte() {
  return crypto.getRandomValues(new Uint8Array(1))[0];
}

function parsePrefix(raw) {
  const value = raw.trim();
  if (value === '') return [];
  const bytes = value.split(/[^0-9a-fA-F]+/).filter(Boolean).map((part) => parseInt(part, 16));
  if (bytes.length > 6 || bytes.some((b) => Number.isNaN(b) || b < 0 || b > 255)) {
    throw new Error('Prefix must be up to 6 hex octets');
  }
  return bytes;
}

function generate() {
  try {
    const prefix = parsePrefix(prefixInput.value);
    const n = Math.max(1, Math.min(500, Number(count.value) || 1));
    const lines = Array.from({ length: n }, () => {
      const bytes = Array.from({ length: 6 }, (_, i) => (i < prefix.length ? prefix[i] : randomByte()));
      const mac = bytes.map((b) => b.toString(16).padStart(2, '0')).join(separator.value);
      return upper.checked ? mac.toUpperCase() : mac;
    });
    output.value = lines.join('\n');
    tk.setStatus(status, '');
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message, 'err');
  }
}

document.querySelector('#mac-generate').addEventListener('click', generate);
[count, prefixInput, separator, upper].forEach((el) => el.addEventListener('change', generate));
generate();
