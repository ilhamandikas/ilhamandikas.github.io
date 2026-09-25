// Convert a JSON array of objects to CSV.
const { tk } = window;

const input = document.querySelector('#jcsv-input');
const delimiter = document.querySelector('#jcsv-delim');

function cell(value, sep) {
  const text = value === null || value === undefined ? '' : (typeof value === 'object' ? JSON.stringify(value) : String(value));
  if (text.includes(sep) || text.includes('"') || /[\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

tk.transform({
  watch: [input, delimiter],
  output: document.querySelector('#jcsv-output'),
  status: document.querySelector('#jcsv-status'),
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Expected a JSON array');
    if (data.length === 0) return '';
    const sep = delimiter.value === '\\t' ? '\t' : delimiter.value;
    const keys = [...new Set(data.flatMap((row) => Object.keys(row)))];
    const lines = [keys.map((key) => cell(key, sep)).join(sep)];
    for (const row of data) lines.push(keys.map((key) => cell(row[key], sep)).join(sep));
    return lines.join('\n');
  },
});
