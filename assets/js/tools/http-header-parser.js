// HTTP header parser: turn a pasted header block into a clean table.
const { tk } = window;

const els = {
  input: document.querySelector('#hhp-input'),
  status: document.querySelector('#hhp-status'),
  summary: document.querySelector('#hhp-summary'),
  out: document.querySelector('#hhp-out'),
};

function parseBlock(text) {
  const lines = text.split(/\r?\n/);
  const headers = [];
  let statusLine = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^HTTP\/\d/.test(line.trim())) {
      statusLine = line.trim();
      continue;
    }
    if (/^[ \t]/.test(line) && headers.length) {
      headers[headers.length - 1].value += ` ${line.trim()}`;
      continue;
    }
    const at = line.indexOf(':');
    if (at === -1) {
      headers.push({ name: '(unrecognised)', value: line.trim(), invalid: true });
      continue;
    }
    headers.push({ name: line.slice(0, at).trim(), value: line.slice(at + 1).trim() });
  }
  return { statusLine, headers };
}

function render() {
  const text = els.input.value;
  els.out.replaceChildren();
  els.summary.replaceChildren();
  if (!text.trim()) {
    tk.setStatus(els.status, '');
    return;
  }
  const { statusLine, headers } = parseBlock(text);
  const table = document.createElement('table');
  table.className = 'tool-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Header</th><th>Value</th></tr>';
  const tbody = document.createElement('tbody');
  const seen = new Set();
  headers.forEach((header) => {
    const tr = document.createElement('tr');
    if (header.invalid) tr.className = 'is-invalid';
    const name = document.createElement('th');
    name.scope = 'row';
    name.textContent = header.name;
    if (seen.has(header.name.toLowerCase())) name.textContent += ' (repeated)';
    seen.add(header.name.toLowerCase());
    const value = document.createElement('td');
    value.textContent = header.value;
    tr.append(name, value);
    tbody.appendChild(tr);
  });
  table.append(thead, tbody);
  els.out.appendChild(table);

  const pairs = [
    ['Status line', statusLine || '—'],
    ['Headers', String(headers.length)],
    ['Unrecognised lines', String(headers.filter((h) => h.invalid).length)],
  ];
  pairs.forEach(([key, value]) => {
    const wrap = document.createElement('div');
    wrap.className = 'tool-result-row';
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = key;
    dd.textContent = value;
    wrap.append(dt, dd);
    els.summary.appendChild(wrap);
  });
  tk.setStatus(els.status, `Parsed ${headers.length} header${headers.length === 1 ? '' : 's'} locally.`, 'ok');
}

tk.live(els.input, render);
