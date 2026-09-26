// Read the structure of a PDF with pdf-lib: how many pages, how big each one
// is, and whatever document information the producer left behind.
// updateMetadata is off so loading the file does not stamp a producer and a
// modification date of its own over what the file actually says.
import { PDFDocument, PDFName } from '../vendor/pdf-lib.js';

const { tk } = window;

const els = {
  file: document.querySelector('#pdi-file'),
  status: document.querySelector('#pdi-status'),
  report: document.querySelector('#pdi-report'),
  pages: document.querySelector('#pdi-pages'),
  size: document.querySelector('#pdi-size'),
  version: document.querySelector('#pdi-version'),
  meta: document.querySelector('#pdi-meta'),
  pageList: document.querySelector('#pdi-page-list'),
};

const POINTS_PER_MM = 25.4 / 72;
const MAX_ROWS = 300;

function pdfVersion(bytes) {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 1024));
  const match = head.match(/%PDF-(\d\.\d)/);
  return match ? match[1] : 'unknown';
}

function clean(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

// Read a string straight out of the Info dictionary, so the report keeps to
// what the file actually says.
function textEntry(dict, name) {
  try {
    const value = dict.get(PDFName.of(name));
    return value && typeof value.decodeText === 'function' ? clean(value.decodeText()) : '';
  } catch {
    return '';
  }
}

// A PDF date looks like D:20240115090000+07'00'; the date part is enough here.
function dateEntry(dict, name) {
  const match = textEntry(dict, name).match(/^D:(\d{4})(\d{2})?(\d{2})?/);
  return match ? [match[1], match[2], match[3]].filter(Boolean).join('-') : '';
}

function row(label, value) {
  const line = document.createElement('tr');
  const key = document.createElement('th');
  key.textContent = label;
  const cell = document.createElement('td');
  cell.textContent = value;
  line.append(key, cell);
  return line;
}

function orientation(width, height) {
  if (Math.abs(width - height) < 1) return 'Square';
  return width > height ? 'Landscape' : 'Portrait';
}

function mm(points) {
  return `${(points * POINTS_PER_MM).toFixed(0)} mm`;
}

function reset() {
  els.report.hidden = true;
  els.pages.textContent = '—';
  els.size.textContent = '—';
  els.version.textContent = '—';
  els.meta.replaceChildren();
  els.pageList.replaceChildren();
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  reset();
  const bytes = new Uint8Array(await file.arrayBuffer());

  let doc;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (error) {
    const encrypted = /encrypt/i.test(String((error && error.message) || ''));
    tk.setStatus(els.status, encrypted ? 'This PDF is encrypted, so its contents need the password before they can be read.' : 'That file could not be read as a PDF.', 'err');
    return;
  }

  const count = doc.getPageCount();
  els.pages.textContent = `${count} page${count === 1 ? '' : 's'}`;
  els.size.textContent = tk.formatBytes(file.size);
  els.version.textContent = pdfVersion(bytes);

  const info = doc.getInfoDict();
  const entries = [
    ['Title', textEntry(info, 'Title')],
    ['Author', textEntry(info, 'Author')],
    ['Subject', textEntry(info, 'Subject')],
    ['Keywords', textEntry(info, 'Keywords')],
    ['Creator', textEntry(info, 'Creator')],
    ['Producer', textEntry(info, 'Producer')],
    ['Created', dateEntry(info, 'CreationDate')],
    ['Modified', dateEntry(info, 'ModDate')],
  ].filter(([, value]) => value);

  els.meta.replaceChildren(...(entries.length ? entries.map(([label, value]) => row(label, value)) : [row('Document information', 'None stored in this file')]));

  const rows = doc.getPages().slice(0, MAX_ROWS).map((page, index) => {
    const { width, height } = page.getSize();
    const line = document.createElement('tr');
    [String(index + 1), `${width.toFixed(1)} pt · ${mm(width)}`, `${height.toFixed(1)} pt · ${mm(height)}`, orientation(width, height)].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      line.append(cell);
    });
    return line;
  });
  els.pageList.replaceChildren(...rows);

  els.report.hidden = false;
  tk.setStatus(els.status, `Read — ${count} page${count === 1 ? '' : 's'}, ${tk.formatBytes(file.size)}.`, 'ok');
}

els.file.addEventListener('change', onFile);
