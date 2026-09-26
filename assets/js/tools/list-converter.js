// List converter — one item per line in, a chosen list format out.
const { tk } = window;

const input = document.querySelector('#list-input');
const format = document.querySelector('#list-format');
const trim = document.querySelector('#list-trim');
const dropEmpty = document.querySelector('#list-dropempty');

const quote = (value) => `"${String(value).replace(/"/g, '""')}"`;

const formats = {
  json: (items) => JSON.stringify(items, null, 2),
  csv: (items) => items.map(quote).join(','),
  quoted: (items) => items.map((i) => `'${String(i).replace(/'/g, "\\'")}'`).join(', '),
  lines: (items) => items.join('\n'),
  numbered: (items) => items.map((item, i) => `${i + 1}. ${item}`).join('\n'),
  sql: (items) => `(${items.map((i) => `'${String(i).replace(/'/g, "''")}'`).join(', ')})`,
};

tk.transform({
  watch: [input, format, trim, dropEmpty],
  output: document.querySelector('#list-output'),
  status: document.querySelector('#list-status'),
  fn: () => {
    let items = input.value.split(/\r?\n/);
    if (trim.checked) items = items.map((item) => item.trim());
    if (dropEmpty.checked) items = items.filter((item) => item !== '');
    return formats[format.value](items);
  },
});
