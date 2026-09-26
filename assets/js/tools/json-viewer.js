// Inspect a JSON document as a collapsible tree, or as a table of the records it
// holds — the grid an API response is often easier to read in.
const { tk } = window;

const els = {
  input: document.querySelector('#jv-input'),
  view: document.querySelector('#jv-view'),
  sort: document.querySelector('#jv-sort'),
  tree: document.querySelector('#jv-tree'),
  treePanel: document.querySelector('#jv-tree-panel'),
  tablePanel: document.querySelector('#jv-table-panel'),
  table: document.querySelector('#jv-table'),
  tableNote: document.querySelector('#jv-table-note'),
  status: document.querySelector('#jv-status'),
  expand: document.querySelector('#jv-expand'),
  collapse: document.querySelector('#jv-collapse'),
};

const getSort = tk.sortControl('jv-sort');
const MAX_ROWS = 300;
const MAX_CELL = 120;
const NO_TABLE = 'A table needs an object or an array of objects.';

let view = 'tree';

function count(value) {
  if (value === null || typeof value !== 'object') return 0;
  return Object.values(value).reduce((total, child) => total + 1 + count(child), 0);
}

function isRow(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// One column per key, in the order the keys first appear. A column for plain
// values is added when the list is not made of objects, so an array of numbers
// still reads as a table.
function columnsFor(rows) {
  if (!rows.length) return ['Value'];
  const keys = [];
  const seen = new Set();
  let plain = false;
  rows.forEach((row) => {
    if (isRow(row)) {
      Object.keys(row).forEach((key) => {
        if (seen.has(key)) return;
        seen.add(key);
        keys.push(key);
      });
    } else {
      plain = true;
    }
  });
  if (plain) keys.push('Value');
  return keys;
}

function text(value) {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (typeof value !== 'object') return String(value);
  return JSON.stringify(value);
}

// A nested object or array is shown as far as it fits, with the rest kept in the
// cell's tooltip so nothing is hidden for good.
function write(td, value) {
  const full = text(value);
  if (full.length > MAX_CELL) {
    td.textContent = `${full.slice(0, MAX_CELL)}…`;
    td.title = full;
  } else {
    td.textContent = full;
  }
}

function renderTable(data) {
  const rows = Array.isArray(data) ? data : [data];
  const columns = columnsFor(rows);
  const numbered = Array.isArray(data);

  const head = document.createElement('tr');
  if (numbered) {
    const corner = document.createElement('th');
    corner.textContent = '#';
    head.append(corner);
  }
  columns.forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;
    head.append(th);
  });
  const thead = document.createElement('thead');
  thead.append(head);

  const body = document.createElement('tbody');
  rows.slice(0, MAX_ROWS).forEach((row, index) => {
    const tr = document.createElement('tr');
    if (numbered) {
      const number = document.createElement('td');
      number.textContent = String(index + 1);
      tr.append(number);
    }
    columns.forEach((key) => {
      const td = document.createElement('td');
      const value = isRow(row) ? row[key] : key === 'Value' ? row : undefined;
      write(td, value);
      tr.append(td);
    });
    body.append(tr);
  });

  if (rows.length > MAX_ROWS) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length + (numbered ? 1 : 0);
    td.textContent = `…and ${rows.length - MAX_ROWS} more`;
    tr.append(td);
    body.append(tr);
  }

  els.table.replaceChildren(thead, body);
  const shape = `${rows.length} row${rows.length === 1 ? '' : 's'} · ${columns.length} column${columns.length === 1 ? '' : 's'}`;
  els.tableNote.textContent = numbered ? shape : `${shape} · one object`;
}

function showView() {
  const table = view === 'table';
  els.treePanel.hidden = table;
  els.tablePanel.hidden = !table;
  els.expand.hidden = table;
  els.collapse.hidden = table;
  els.sort.hidden = table;
}

function render() {
  const raw = els.input.value.trim();
  if (raw === '') {
    els.tree.replaceChildren();
    els.table.replaceChildren();
    els.tableNote.textContent = '—';
    tk.setStatus(els.status, '');
    return;
  }

  let data;
  try {
    data = tk.sortDeep(JSON.parse(raw), getSort());
  } catch (error) {
    els.tree.replaceChildren();
    els.table.replaceChildren();
    els.tableNote.textContent = '—';
    tk.setStatus(els.status, error.message, 'err');
    return;
  }

  tk.tree(els.tree, data, { openDepth: 1 });
  if (data === null || typeof data !== 'object') {
    els.table.replaceChildren();
    els.tableNote.textContent = NO_TABLE;
  } else {
    renderTable(data);
  }

  const nodes = count(data);
  tk.setStatus(els.status, `Valid JSON — ${nodes} nested value${nodes === 1 ? '' : 's'}`, 'ok');
}

els.view.addEventListener('click', (event) => {
  const button = event.target.closest('[data-jv-view]');
  if (!button) return;
  view = button.getAttribute('data-jv-view');
  [...els.view.querySelectorAll('[data-jv-view]')].forEach((other) => {
    other.setAttribute('aria-pressed', String(other === button));
  });
  showView();
});

els.expand.addEventListener('click', () => tk.treeOpenAll(els.tree, true));
els.collapse.addEventListener('click', () => tk.treeOpenAll(els.tree, false));

showView();
tk.live([els.input, els.sort], render);
