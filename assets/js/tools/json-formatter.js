// JSON formatter / minifier — native JSON parser, wrapped in tk.transform.
const { tk } = window;

const input = document.querySelector('#jf-input');
const sortButton = document.querySelector('#jf-sort');
const indent = document.querySelector('#jf-indent');
const getSort = tk.sortControl('jf-sort');

let mode = 'format';

const run = tk.transform({
  watch: [input, sortButton, indent],
  output: document.querySelector('#jf-output'),
  status: document.querySelector('#jf-status'),
  ok: 'Valid JSON',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const value = tk.sortDeep(JSON.parse(raw), getSort());
    if (mode === 'minify') return JSON.stringify(value);
    return JSON.stringify(value, null, Math.max(0, Math.min(10, Number(indent.value) || 0)));
  },
});

document.querySelector('#jf-format').addEventListener('click', () => { mode = 'format'; run(); });
document.querySelector('#jf-minify').addEventListener('click', () => { mode = 'minify'; run(); });
