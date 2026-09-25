// Random TCP/UDP port generator.
const { tk } = window;

const count = document.querySelector('#port-count');
const min = document.querySelector('#port-min');
const max = document.querySelector('#port-max');
const unique = document.querySelector('#port-unique');
const output = document.querySelector('#port-output');
const status = document.querySelector('#port-status');

function randomInt(lo, hi) {
  const range = hi - lo + 1;
  const limit = Math.floor(0x100000000 / range) * range;
  const buf = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return lo + (value % range);
}

function generate() {
  const lo = Math.max(0, Math.min(65535, Number(min.value) || 0));
  const hi = Math.max(0, Math.min(65535, Number(max.value) || 65535));
  if (lo > hi) {
    output.value = '';
    tk.setStatus(status, 'Min must not exceed max', 'err');
    return;
  }
  const n = Math.max(1, Math.min(1000, Number(count.value) || 1));
  const range = hi - lo + 1;
  const usedUnique = unique.checked && n <= range;

  const values = [];
  const seen = new Set();
  while (values.length < n) {
    const value = randomInt(lo, hi);
    if (usedUnique) {
      if (seen.has(value)) continue;
      seen.add(value);
    }
    values.push(value);
  }
  output.value = values.join('\n');
  tk.setStatus(status, usedUnique ? 'Unique ports' : '');
}

document.querySelector('#port-generate').addEventListener('click', generate);
[count, min, max, unique].forEach((el) => el.addEventListener('change', generate));
generate();
