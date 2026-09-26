// Copy a chosen set of pages into a fresh PDF, which is also how pages are
// removed: whatever is not listed simply does not come across.
import { PDFDocument } from '../vendor/pdf-lib.js';

const { tk } = window;

const els = {
  file: document.querySelector('#ppe-file'),
  range: document.querySelector('#ppe-range'),
  name: document.querySelector('#ppe-name'),
  download: document.querySelector('#ppe-download'),
  status: document.querySelector('#ppe-status'),
  result: document.querySelector('#ppe-result'),
  source: document.querySelector('#ppe-source'),
  kept: document.querySelector('#ppe-kept'),
  output: document.querySelector('#ppe-output'),
};

let source = null;
let outputBlob = null;
let runId = 0;

// "1-3, 7, 5-, -2" becomes a sorted list of page numbers, with anything
// outside the document reported rather than silently ignored.
function parseRange(text, count) {
  const pages = new Set();
  const invalid = [];
  text.split(',').forEach((chunk) => {
    const part = chunk.trim();
    if (!part) return;
    const span = part.match(/^(\d+)?\s*-\s*(\d+)?$/);
    if (span) {
      const from = span[1] ? Number(span[1]) : 1;
      const to = span[2] ? Number(span[2]) : count;
      if (from < 1 || to > count || from > to) {
        invalid.push(part);
        return;
      }
      for (let page = from; page <= to; page += 1) pages.add(page);
      return;
    }
    if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1 || page > count) invalid.push(part);
      else pages.add(page);
      return;
    }
    invalid.push(part);
  });
  return { pages: [...pages].sort((a, b) => a - b), invalid };
}

function reset() {
  outputBlob = null;
  els.download.disabled = true;
  els.result.hidden = true;
  els.source.textContent = '—';
  els.kept.textContent = '—';
  els.output.textContent = '—';
}

async function run() {
  if (!source) return;
  const id = ++runId;
  const count = source.count;
  const { pages, invalid } = parseRange(els.range.value, count);

  if (invalid.length) {
    reset();
    tk.setStatus(els.status, `Outside 1–${count}: ${invalid.join(', ')}.`, 'err');
    return;
  }
  if (!pages.length) {
    reset();
    tk.setStatus(els.status, 'List at least one page to keep.', 'err');
    return;
  }

  try {
    const out = await PDFDocument.create();
    const copied = await out.copyPages(source.doc, pages.map((page) => page - 1));
    copied.forEach((page) => out.addPage(page));
    const bytes = await out.save();
    if (id !== runId) return;

    outputBlob = new Blob([bytes], { type: 'application/pdf' });
    els.download.disabled = false;
    els.result.hidden = false;
    els.source.textContent = `${count} page${count === 1 ? '' : 's'} · ${tk.formatBytes(source.size)}`;
    els.kept.textContent = `${pages.length} of ${count} page${count === 1 ? '' : 's'}`;
    els.output.textContent = tk.formatBytes(outputBlob.size);
    tk.setStatus(els.status, `Ready — ${pages.length} page${pages.length === 1 ? '' : 's'}, ${tk.formatBytes(outputBlob.size)}.`, 'ok');
  } catch {
    reset();
    tk.setStatus(els.status, 'Could not build the new PDF from that file.', 'err');
  }
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  source = null;
  runId += 1;
  reset();
  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const doc = await PDFDocument.load(bytes);
    source = { doc, count: doc.getPageCount(), size: file.size };
    if (source.count === 1 && els.range.value.trim() === '1-2') els.range.value = '1';
    await run();
  } catch (error) {
    const encrypted = /encrypt/i.test(String((error && error.message) || ''));
    tk.setStatus(els.status, encrypted ? 'This PDF is encrypted, so its pages need the password first.' : 'That file could not be read as a PDF.', 'err');
  }
}

els.file.addEventListener('change', onFile);
tk.live([els.range, els.name], run);

els.download.addEventListener('click', () => {
  if (!outputBlob) {
    tk.setStatus(els.status, 'Choose a PDF and a page range first.', 'err');
    return;
  }
  const name = (els.name.value.trim() || 'extracted').replace(/\.pdf$/i, '') + '.pdf';
  tk.download(name, outputBlob, 'application/pdf');
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
