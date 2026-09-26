const { tk } = window;

const direction = document.querySelector('#cxj-direction');
const delimiterSel = document.querySelector('#cxj-delimiter');
const header = document.querySelector('#cxj-header');
const pretty = document.querySelector('#cxj-pretty');
const input = document.querySelector('#cxj-input');
const output = document.querySelector('#cxj-output');
const status = document.querySelector('#cxj-status');
const downloadBtn = document.querySelector('[data-download="#cxj-output"]');

const DELIMITERS = { commas: ',', semicolons: ';', tabs: '\t', pipes: '|' };
const SAMPLES = {
  csv2json: 'name,city,total\nAda,Jakarta,120\nBudi,Surabaya,95',
  json2csv: '[\n  { "name": "Ada", "city": "Jakarta", "total": 120 },\n  { "name": "Budi", "city": "Surabaya", "total": 95 }\n]',
};

function currentDelimiter() {
  return DELIMITERS[delimiterSel.value] || null;
}

function csvToJson(text) {
  const rows = tk.parseDelimited(text, currentDelimiter() || tk.detectDelimiter(text));
  if (!rows.length) return '';
  if (!header.checked) return JSON.stringify(rows, null, pretty.checked ? 2 : 0);
  const keys = rows[0];
  const objects = rows.slice(1).map((row) => {
    const object = {};
    keys.forEach((key, index) => {
      object[key || `column${index + 1}`] = row[index] ?? '';
    });
    return object;
  });
  return JSON.stringify(objects, null, pretty.checked ? 2 : 0);
}

function jsonToCsv(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('The JSON has to be an array of rows or objects.');
  if (!data.length) return '';
  const delimiter = currentDelimiter() || ',';
  const objects = data.every((entry) => entry && typeof entry === 'object' && !Array.isArray(entry));
  if (objects) {
    const keys = [...new Set(data.flatMap((entry) => Object.keys(entry)))];
    const lines = [keys.map((key) => tk.quoteCell(key, delimiter)).join(delimiter)];
    data.forEach((entry) => {
      lines.push(keys.map((key) => tk.quoteCell(entry[key] ?? '', delimiter)).join(delimiter));
    });
    return lines.join('\n');
  }
  return data
    .map((row) => (Array.isArray(row) ? row : [row]).map((value) => tk.quoteCell(value, delimiter)).join(delimiter))
    .join('\n');
}

function render() {
  const toCsv = direction.value === 'json2csv';
  header.disabled = toCsv;
  if (downloadBtn) {
    downloadBtn.setAttribute('data-filename', toCsv ? 'converted.csv' : 'converted.json');
    downloadBtn.setAttribute('data-mime', toCsv ? 'text/csv' : 'application/json');
  }

  if (!input.value.trim()) {
    output.value = '';
    tk.setStatus(status, '');
    return;
  }

  try {
    const result = toCsv ? jsonToCsv(input.value) : csvToJson(input.value);
    output.value = result;
    if (!result) {
      tk.setStatus(status, 'Nothing to convert.');
      return;
    }
    const lines = result.split('\n').length;
    tk.setStatus(status, `${lines} line${lines === 1 ? '' : 's'}.`);
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message || 'That input could not be parsed.', 'err');
  }
}

direction.addEventListener('change', () => {
  const current = direction.value === 'json2csv' ? 'csv2json' : 'json2csv';
  if (!input.value.trim() || input.value === SAMPLES[current]) input.value = SAMPLES[direction.value];
  render();
});

tk.live([direction, delimiterSel, header, pretty, input], render);
