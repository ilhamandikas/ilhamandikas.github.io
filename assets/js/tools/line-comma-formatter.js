const { tk } = window;

const input = document.querySelector('#lcf-input');
const mode = document.querySelector('#lcf-mode');
const trim = document.querySelector('#lcf-trim');
const skipEmpty = document.querySelector('#lcf-skip-empty');
const output = document.querySelector('#lcf-output');
const status = document.querySelector('#lcf-status');

function lines() {
  let list = input.value.split(/\r?\n/);
  if (trim.checked) list = list.map((x) => x.trim());
  if (skipEmpty.checked) list = list.filter((x) => x !== '');
  return list;
}

function quote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function jsQuote(value) {
  return JSON.stringify(value);
}

function render() {
  const list = lines();
  switch (mode.value) {
    case 'csv-line':
      output.value = list.join(', ');
      break;
    case 'quoted-line-comma':
      output.value = list.map((x) => `${quote(x)},`).join('\n');
      break;
    case 'quoted-csv':
      output.value = list.map(quote).join(', ');
      break;
    case 'js-array':
      output.value = `[\n  ${list.map(jsQuote).join(',\n  ')}\n]`;
      break;
    case 'sql-in':
      output.value = `(${list.map(quote).join(', ')})`;
      break;
    default:
      output.value = list.map((x) => `${x},`).join('\n');
  }
  tk.setStatus(status, list.length ? `${list.length} line${list.length === 1 ? '' : 's'}` : '');
}

tk.live([input, mode, trim, skipEmpty], render);
render();
