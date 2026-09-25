// UUID v4 generator — native crypto.randomUUID with a manual fallback.
const { tk } = window;

const count = document.querySelector('#uuid-count');
const upper = document.querySelector('#uuid-upper');
const braces = document.querySelector('#uuid-braces');
const output = document.querySelector('#uuid-output');

function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function generate() {
  const n = Math.max(1, Math.min(1000, Number(count.value) || 1));
  const list = Array.from({ length: n }, () => {
    let id = uuidv4();
    if (upper.checked) id = id.toUpperCase();
    if (braces.checked) id = `{${id}}`;
    return id;
  });
  output.value = list.join('\n');
}

document.querySelector('#uuid-generate').addEventListener('click', generate);
count.addEventListener('change', generate);
upper.addEventListener('change', generate);
braces.addEventListener('change', generate);

generate();
