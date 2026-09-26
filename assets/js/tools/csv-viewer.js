const { tk } = window;

const file = document.querySelector('#csv-file');
const input = document.querySelector('#csv-input');
const headerRow = document.querySelector('#csv-header');
const filter = document.querySelector('#csv-filter');
const wrap = document.querySelector('#csv-table-wrap');
const status = document.querySelector('#csv-status');
const clear = document.querySelector('#csv-clear');
const sortClear = document.querySelector('#csv-sort-clear');

const MAX_ROWS = 500;
const state = { rows: [], sortIndex: -1, sortDir: 1 };

function cell(row, index) {
  return row[index] ?? '';
}

function renderTable() {
  wrap.innerHTML = '';
  if (!state.rows.length) return;

  const header = headerRow.checked
    ? state.rows[0]
    : state.rows[0].map((_, index) => `Column ${index + 1}`);
  const bodyRaw = headerRow.checked ? state.rows.slice(1) : state.rows;
  const needle = filter.value.trim().toLowerCase();
  let body = needle
    ? bodyRaw.filter((row) => row.some((value) => value.toLowerCase().includes(needle)))
    : bodyRaw;

  if (state.sortIndex >= 0) {
    body = [...body].sort((a, b) => {
      const left = cell(a, state.sortIndex);
      const right = cell(b, state.sortIndex);
      const numbers = left !== '' && right !== '' && Number.isFinite(Number(left)) && Number.isFinite(Number(right));
      const compare = numbers ? Number(left) - Number(right) : left.localeCompare(right);
      return compare * state.sortDir;
    });
  }

  const table = document.createElement('table');
  table.className = 'tool-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  header.forEach((name, index) => {
    const th = document.createElement('th');
    th.className = 'sortable';
    const arrow = state.sortIndex === index ? (state.sortDir === 1 ? ' ↑' : ' ↓') : '';
    th.textContent = `${name}${arrow}`;
    th.addEventListener('click', () => {
      if (state.sortIndex === index) state.sortDir *= -1;
      else {
        state.sortIndex = index;
        state.sortDir = 1;
      }
      renderTable();
    });
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  body.slice(0, MAX_ROWS).forEach((row) => {
    const tr = document.createElement('tr');
    header.forEach((_, index) => {
      const td = document.createElement('td');
      td.textContent = cell(row, index);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);

  const note = [
    `${body.length} row${body.length === 1 ? '' : 's'}`,
    `${header.length} column${header.length === 1 ? '' : 's'}`,
  ];
  if (body.length > MAX_ROWS) note.push(`showing the first ${MAX_ROWS}`);
  tk.setStatus(status, `${note.join(', ')}.`);
}

function render() {
  if (!input.value.trim()) {
    state.rows = [];
    wrap.innerHTML = '';
    tk.setStatus(status, '');
    return;
  }
  state.rows = tk.parseDelimited(input.value, tk.detectDelimiter(input.value));
  if (state.sortIndex >= state.rows[0].length) {
    state.sortIndex = -1;
    state.sortDir = 1;
  }
  renderTable();
}

file.addEventListener('change', () => {
  const chosen = file.files && file.files[0];
  if (!chosen) return;
  const reader = new FileReader();
  reader.onload = () => {
    input.value = String(reader.result || '');
    render();
  };
  reader.readAsText(chosen);
});

clear.addEventListener('click', () => {
  input.value = '';
  file.value = '';
  filter.value = '';
  state.sortIndex = -1;
  render();
});

sortClear.addEventListener('click', () => {
  state.sortIndex = -1;
  state.sortDir = 1;
  renderTable();
});

tk.live([input, headerRow, filter], render);
