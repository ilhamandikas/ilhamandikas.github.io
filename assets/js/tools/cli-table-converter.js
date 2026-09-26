const { tk } = window;

const input = document.querySelector('#clt-input');
const modeSel = document.querySelector('#clt-mode');
const format = document.querySelector('#clt-format');
const header = document.querySelector('#clt-header');
const trim = document.querySelector('#clt-trim');
const output = document.querySelector('#clt-output');
const status = document.querySelector('#clt-status');

const GAP = /\s{2,}/;

function detectMode(text) {
  const sample = text.split('\n').filter((line) => line.trim()).slice(0, 20);
  if (sample.some((line) => line.includes('|'))) return 'pipe';
  if (sample.some((line) => line.includes('\t'))) return 'tsv';
  return sample.filter((line) => GAP.test(line)).length >= sample.length / 2 ? 'spaces2' : 'spaces';
}

function splitLine(line, mode) {
  if (mode === 'csv') return tk.parseDelimited(line, ',')[0] || [];
  if (mode === 'tsv') return line.split('\t');
  if (mode === 'pipe') {
    const cells = line.split('|');
    if (cells.length && cells[0].trim() === '') cells.shift();
    if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
    return cells;
  }
  if (mode === 'spaces2') return line.trim().split(GAP);
  return line.trim().split(/\s+/);
}

function parse(text, mode) {
  const rows = text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const cells = splitLine(line, mode);
      return trim.checked ? cells.map((value) => value.trim()) : cells;
    });
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  rows.forEach((row) => {
    while (row.length < width) row.push('');
  });
  return rows;
}

function toMarkdown(rows, hasHeader) {
  const head = hasHeader ? rows[0] : rows[0].map((_, index) => `Column ${index + 1}`);
  const body = hasHeader ? rows.slice(1) : rows;
  const escape = (value) => String(value).replace(/\|/g, '\\|');
  const lines = [`| ${head.map(escape).join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`];
  body.forEach((row) => lines.push(`| ${row.map(escape).join(' | ')} |`));
  return lines.join('\n');
}

function toSeparated(rows, delimiter) {
  return rows.map((row) => row.map((value) => tk.quoteCell(value, delimiter)).join(delimiter)).join('\n');
}

function render() {
  if (!input.value.trim()) {
    output.value = '';
    tk.setStatus(status, '');
    return;
  }
  const mode = modeSel.value === 'auto' ? detectMode(input.value) : modeSel.value;
  const rows = parse(input.value, mode);
  if (!rows.length) {
    output.value = '';
    tk.setStatus(status, 'No rows found.');
    return;
  }
  output.value = format.value === 'markdown' ? toMarkdown(rows, header.checked) : toSeparated(rows, format.value === 'tsv' ? '\t' : ',');
  const width = rows[0].length;
  tk.setStatus(status, `${rows.length} row${rows.length === 1 ? '' : 's'}, ${width} column${width === 1 ? '' : 's'}.`);
}

tk.live([input, modeSel, format, header, trim], render);
