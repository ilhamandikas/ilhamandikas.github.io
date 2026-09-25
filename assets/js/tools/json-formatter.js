// JSON formatter / minifier — native JSON parser, wrapped in tk.transform.
const { tk } = window;

const input = document.querySelector('#jf-input');
const sortKeys = document.querySelector('#jf-sort');
const indent = document.querySelector('#jf-indent');

let mode = 'format';

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortDeep(value[key]);
        return acc;
      }, {});
  }
  return value;
}

const run = tk.transform({
  watch: [input, sortKeys, indent],
  output: document.querySelector('#jf-output'),
  status: document.querySelector('#jf-status'),
  ok: 'Valid JSON',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    let value = JSON.parse(raw);
    if (sortKeys.checked) value = sortDeep(value);
    if (mode === 'minify') return JSON.stringify(value);
    return JSON.stringify(value, null, Math.max(0, Math.min(10, Number(indent.value) || 0)));
  },
});

document.querySelector('#jf-format').addEventListener('click', () => { mode = 'format'; run(); });
document.querySelector('#jf-minify').addEventListener('click', () => { mode = 'minify'; run(); });
