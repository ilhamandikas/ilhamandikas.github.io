// Join several PDFs into one. Each file is parsed once, and its pages are
// copied into a new document in the order the list shows.
import { PDFDocument } from '../vendor/pdf-lib.js';

const { tk } = window;

const els = {
  file: document.querySelector('#pdm-file'),
  name: document.querySelector('#pdm-name'),
  download: document.querySelector('#pdm-download'),
  clear: document.querySelector('#pdm-clear'),
  status: document.querySelector('#pdm-status'),
  panel: document.querySelector('#pdm-list-panel'),
  count: document.querySelector('#pdm-count'),
  pages: document.querySelector('#pdm-pages'),
  list: document.querySelector('#pdm-list'),
};

let items = [];
let outputBlob = null;
let runId = 0;

function button(label, action, index) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'btn';
  element.textContent = label;
  element.setAttribute('data-merge-action', action);
  element.setAttribute('data-index', String(index));
  return element;
}

function renderList() {
  const rows = items.map((item, index) => {
    const row = document.createElement('tr');
    const order = document.createElement('td');
    order.textContent = String(index + 1);
    const name = document.createElement('td');
    name.textContent = item.name;
    const pages = document.createElement('td');
    pages.textContent = String(item.count);
    const actions = document.createElement('td');
    const up = button('Up', 'up', index);
    const down = button('Down', 'down', index);
    const remove = button('Remove', 'remove', index);
    up.disabled = index === 0;
    down.disabled = index === items.length - 1;
    actions.append(up, ' ', down, ' ', remove);
    row.append(order, name, pages, actions);
    return row;
  });
  els.list.replaceChildren(...rows);
}

function reset() {
  outputBlob = null;
  els.panel.hidden = true;
  els.download.disabled = true;
  els.clear.disabled = true;
  els.count.textContent = '—';
  els.pages.textContent = '—';
  els.list.replaceChildren();
}

async function build() {
  if (!items.length) {
    reset();
    tk.setStatus(els.status, '');
    return;
  }

  const id = ++runId;
  try {
    const out = await PDFDocument.create();
    for (const item of items) {
      const copied = await out.copyPages(item.doc, item.doc.getPageIndices());
      copied.forEach((page) => out.addPage(page));
    }
    const bytes = await out.save();
    if (id !== runId) return;

    outputBlob = new Blob([bytes], { type: 'application/pdf' });
    const total = items.reduce((sum, item) => sum + item.count, 0);
    els.panel.hidden = false;
    els.download.disabled = false;
    els.clear.disabled = false;
    els.count.textContent = `${items.length} document${items.length === 1 ? '' : 's'}`;
    els.pages.textContent = `${total} page${total === 1 ? '' : 's'}`;
    renderList();
    tk.setStatus(els.status, `Ready — ${items.length} document${items.length === 1 ? '' : 's'}, ${total} page${total === 1 ? '' : 's'}, ${tk.formatBytes(outputBlob.size)}.`, 'ok');
  } catch {
    reset();
    tk.setStatus(els.status, 'Could not merge those files.', 'err');
  }
}

async function onFiles() {
  const files = [...(els.file.files || [])];
  if (!files.length) return;

  items = [];
  runId += 1;
  reset();
  const failed = [];

  for (const file of files) {
    try {
      const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
      items.push({ name: file.name || 'document.pdf', doc, count: doc.getPageCount() });
    } catch {
      failed.push(file.name || 'a file');
    }
  }

  if (!items.length) {
    tk.setStatus(els.status, 'None of those files could be read as a PDF.', 'err');
    return;
  }
  await build();
  if (failed.length) tk.setStatus(els.status, `Skipped ${failed.join(', ')}, which could not be read.`, 'err');
}

els.list.addEventListener('click', (event) => {
  const target = event.target.closest('[data-merge-action]');
  if (!target) return;
  const index = Number(target.getAttribute('data-index'));
  const action = target.getAttribute('data-merge-action');
  if (action === 'up' && index > 0) [items[index - 1], items[index]] = [items[index], items[index - 1]];
  else if (action === 'down' && index < items.length - 1) [items[index + 1], items[index]] = [items[index], items[index + 1]];
  else if (action === 'remove') items.splice(index, 1);
  else return;
  renderList();
  build();
});

els.file.addEventListener('change', onFiles);

els.clear.addEventListener('click', () => {
  items = [];
  els.file.value = '';
  build();
});

els.download.addEventListener('click', () => {
  if (!outputBlob) {
    tk.setStatus(els.status, 'Choose at least two PDFs first.', 'err');
    return;
  }
  const name = (els.name.value.trim() || 'merged').replace(/\.pdf$/i, '') + '.pdf';
  tk.download(name, outputBlob, 'application/pdf');
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
