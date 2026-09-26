// Build a zip in the page with fflate. The files are read once and kept in
// memory, so the archive can be rebuilt when the level or the name changes.
import { zipSync } from '../vendor/fflate.js';

const { tk } = window;

const els = {
  file: document.querySelector('#zip-file'),
  name: document.querySelector('#zip-name'),
  level: document.querySelector('#zip-level'),
  download: document.querySelector('#zip-download'),
  clear: document.querySelector('#zip-clear'),
  status: document.querySelector('#zip-status'),
  preview: document.querySelector('#zip-preview'),
  count: document.querySelector('#zip-count'),
  size: document.querySelector('#zip-size'),
  list: document.querySelector('#zip-list'),
};

const MAX_ROWS = 200;
let entries = [];
let seen = new Set();
let zipBlob = null;

// Keep every name distinct so nothing inside the archive is lost.
function uniqueName(name, taken) {
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : '';
  let index = 1;
  let candidate = `${stem}-${index}${extension}`;
  while (taken.has(candidate)) {
    index += 1;
    candidate = `${stem}-${index}${extension}`;
  }
  return candidate;
}

function fileList() {
  const rows = entries.slice(0, MAX_ROWS).map((entry, index) => {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = entry.name;
    const size = document.createElement('td');
    size.textContent = tk.formatBytes(entry.size);
    const actions = document.createElement('td');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn';
    remove.textContent = 'Remove';
    remove.setAttribute('data-zip-remove', String(index));
    remove.setAttribute('aria-label', `Remove ${entry.name}`);
    actions.append(remove);
    row.append(name, size, actions);
    return row;
  });
  if (entries.length > MAX_ROWS) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = `…and ${entries.length - MAX_ROWS} more`;
    row.append(cell);
    rows.push(row);
  }
  els.list.replaceChildren(...rows);
}

function build() {
  if (!entries.length) {
    zipBlob = null;
    els.preview.hidden = true;
    els.download.disabled = true;
    els.clear.disabled = true;
    els.count.textContent = '—';
    els.size.textContent = '—';
    els.list.replaceChildren();
    tk.setStatus(els.status, '');
    return;
  }

  const payload = {};
  entries.forEach((entry) => {
    payload[entry.name] = entry.data;
  });

  let bytes;
  try {
    bytes = zipSync(payload, { level: Number(els.level.value) });
  } catch {
    zipBlob = null;
    els.download.disabled = true;
    tk.setStatus(els.status, 'Could not build the archive.', 'err');
    return;
  }

  zipBlob = new Blob([bytes], { type: 'application/zip' });
  els.preview.hidden = false;
  els.download.disabled = false;
  els.clear.disabled = false;
  els.count.textContent = `${entries.length} file${entries.length === 1 ? '' : 's'}`;
  els.size.textContent = tk.formatBytes(zipBlob.size);
  fileList();
  tk.setStatus(els.status, `Ready — ${entries.length} file${entries.length === 1 ? '' : 's'}, ${tk.formatBytes(zipBlob.size)}.`, 'ok');
}

// Files are read once and kept in memory, so a second visit to the picker adds
// to the archive instead of replacing what is already there.
async function onFiles() {
  const files = tk.claimFiles(els.file, seen);
  if (!files.length) return;

  const taken = new Set(entries.map((entry) => entry.name));
  for (const file of files) {
    const data = new Uint8Array(await file.arrayBuffer());
    const name = uniqueName(file.name || `file-${entries.length + 1}`, taken);
    taken.add(name);
    entries.push({ name, size: data.length, data, key: tk.fileKey(file) });
  }
  build();
}

els.file.addEventListener('change', onFiles);
tk.live([els.level], build);

els.list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-zip-remove]');
  if (!button) return;
  const [dropped] = entries.splice(Number(button.getAttribute('data-zip-remove')), 1);
  // The file can be picked again once it is no longer in the archive.
  if (dropped) seen.delete(dropped.key);
  build();
});

els.name.addEventListener('change', () => {
  if (els.name.value.trim() && !/\.zip$/i.test(els.name.value.trim())) els.name.value = `${els.name.value.trim()}.zip`;
});

els.clear.addEventListener('click', () => {
  entries = [];
  seen = new Set();
  els.file.value = '';
  build();
});

els.download.addEventListener('click', () => {
  if (!entries.length) {
    tk.setStatus(els.status, 'Choose at least one file first.', 'err');
    return;
  }
  if (!zipBlob) {
    tk.setStatus(els.status, 'The archive is not ready yet.', '');
    return;
  }
  const name = (els.name.value.trim() || 'archive').replace(/\.zip$/i, '') + '.zip';
  tk.download(name, zipBlob, 'application/zip');
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
