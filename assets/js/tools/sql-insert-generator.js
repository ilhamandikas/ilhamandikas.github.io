const { tk } = window;

const tableField = document.querySelector('#sql-table');
const dialectField = document.querySelector('#sql-dialect');
const multiField = document.querySelector('#sql-multi');
const inputField = document.querySelector('#sql-input');
const output = document.querySelector('#sql-output');
const status = document.querySelector('#sql-status');

function parseRows(text) {
  const value = text.trim();
  if (!value) return [];
  if (value[0] === '[' || value[0] === '{') {
    const data = JSON.parse(value);
    const rows = Array.isArray(data) ? data : [data];
    if (!rows.every((r) => r && typeof r === 'object' && !Array.isArray(r))) throw new Error('Every row has to be a JSON object');
    return rows;
  }
  const lines = value.split(/\r?\n/).filter((l) => l.trim() !== '');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });
}

function quoteId(name, dialect) {
  if (dialect === 'mysql') return `\`${name.replace(/`/g, '``')}\``;
  if (dialect === 'mssql') return `[${name.replace(/]/g, ']]')}]`;
  return `"${name.replace(/"/g, '""')}"`;
}

function literal(value, dialect) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return dialect === 'sqlite' ? (value ? '1' : '0') : value ? 'TRUE' : 'FALSE';
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function build() {
  const rows = parseRows(inputField.value);
  if (!rows.length) return '';
  const table = tableField.value.trim();
  if (!table) throw new Error('Enter a table name');
  const dialect = dialectField.value;
  const columns = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const head = `INSERT INTO ${quoteId(table, dialect)} (${columns.map((c) => quoteId(c, dialect)).join(', ')}) VALUES`;
  if (multiField.checked) {
    return rows.map((row) => `${head} (${columns.map((c) => literal(row[c], dialect)).join(', ')});`).join('\n');
  }
  const tuples = rows.map((row) => `  (${columns.map((c) => literal(row[c], dialect)).join(', ')})`);
  return `${head}\n${tuples.join(',\n')};`;
}

function run() {
  try {
    output.value = build();
    const rows = parseRows(inputField.value);
    tk.setStatus(status, rows.length ? `${rows.length} row${rows.length === 1 ? '' : 's'}` : 'Paste some rows', rows.length ? 'ok' : '');
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live([tableField, dialectField, multiField, inputField], run);
