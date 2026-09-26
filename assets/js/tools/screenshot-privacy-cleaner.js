// Cover parts of a screenshot by drawing over them. Boxes are kept in a list
// and replayed onto the visible canvas, so undo and reset are just a redraw.
const { tk } = window;

const els = {
  file: document.querySelector('#spc-file'),
  mode: document.querySelector('#spc-mode'),
  block: document.querySelector('#spc-block'),
  blockValue: document.querySelector('#spc-block-value'),
  undo: document.querySelector('#spc-undo'),
  reset: document.querySelector('#spc-reset'),
  download: document.querySelector('#spc-download'),
  status: document.querySelector('#spc-status'),
  preview: document.querySelector('#spc-preview'),
  canvas: document.querySelector('#spc-canvas'),
};

const ctx = els.canvas.getContext('2d');
// The untouched pixels live off screen; the visible canvas is a copy with the
// boxes replayed on top.
const base = document.createElement('canvas');
const baseCtx = base.getContext('2d');
// A small canvas used to sample a region down before scaling it back up.
const tile = document.createElement('canvas');
const tileCtx = tile.getContext('2d');

const ready = Boolean(ctx && baseCtx && tileCtx);
let source = null;
let boxes = [];
let drag = null;
let outputBlob = null;
let runId = 0;

function pixelate(box) {
  const block = Math.max(2, Number(els.block.value) || 24);
  const sw = Math.max(1, Math.round(box.w / block));
  const sh = Math.max(1, Math.round(box.h / block));
  tile.width = sw;
  tile.height = sh;
  tileCtx.imageSmoothingEnabled = false;
  tileCtx.clearRect(0, 0, sw, sh);
  tileCtx.drawImage(base, box.x, box.y, box.w, box.h, 0, 0, sw, sh);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tile, 0, 0, sw, sh, box.x, box.y, box.w, box.h);
  ctx.imageSmoothingEnabled = true;
}

function apply(box) {
  if (box.mode === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(box.x, box.y, box.w, box.h);
    return;
  }
  pixelate(box);
}

function redraw() {
  if (!source || !ready) return;
  ctx.drawImage(base, 0, 0);
  boxes.forEach(apply);
  if (drag) {
    const box = dragBox();
    if (box.w > 0 && box.h > 0) {
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = Math.max(1, Math.round(source.width / 500));
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      ctx.restore();
    }
  }
  els.undo.disabled = !boxes.length;
  els.reset.disabled = !boxes.length;
  els.blockValue.textContent = els.block.value;
}

function dragBox() {
  const x = Math.min(drag.start.x, drag.current.x);
  const y = Math.min(drag.start.y, drag.current.y);
  return {
    x,
    y,
    w: Math.abs(drag.current.x - drag.start.x),
    h: Math.abs(drag.current.y - drag.start.y),
  };
}

function point(event) {
  const rect = els.canvas.getBoundingClientRect();
  const width = rect.width || els.canvas.width;
  const height = rect.height || els.canvas.height;
  const x = ((event.clientX - rect.left) / width) * els.canvas.width;
  const y = ((event.clientY - rect.top) / height) * els.canvas.height;
  return {
    x: Math.max(0, Math.min(els.canvas.width, x)),
    y: Math.max(0, Math.min(els.canvas.height, y)),
  };
}

async function commit() {
  const id = ++runId;
  els.download.disabled = true;
  const finish = (blob) => {
    if (id !== runId) return;
    outputBlob = blob || null;
    els.download.disabled = !blob;
    const count = boxes.length;
    tk.setStatus(els.status, count ? `${count} redaction${count === 1 ? '' : 's'} applied.` : 'Ready — nothing marked yet.');
  };
  if (els.canvas.toBlob) els.canvas.toBlob(finish, 'image/png');
  else finish(null);
}

els.canvas.addEventListener('pointerdown', (event) => {
  if (!source || !ready) return;
  event.preventDefault();
  drag = { start: point(event), current: point(event) };
  try {
    els.canvas.setPointerCapture(event.pointerId);
  } catch {
    /* capture is a nicety, not a requirement */
  }
  redraw();
});

els.canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  drag.current = point(event);
  redraw();
});

function finishDrag() {
  if (!drag) return;
  const box = { ...dragBox(), mode: els.mode.value };
  drag = null;
  if (box.w >= 4 && box.h >= 4) boxes.push(box);
  redraw();
  commit();
}

els.canvas.addEventListener('pointerup', finishDrag);
els.canvas.addEventListener('pointercancel', finishDrag);
window.addEventListener('pointerup', finishDrag);

els.undo.addEventListener('click', () => {
  if (!boxes.length) return;
  boxes.pop();
  redraw();
  commit();
});

els.reset.addEventListener('click', () => {
  if (!boxes.length) return;
  boxes = [];
  redraw();
  commit();
});

tk.live([els.mode, els.block], redraw);

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  source = null;
  boxes = [];
  drag = null;
  outputBlob = null;
  runId += 1;
  els.preview.hidden = true;
  els.download.disabled = true;
  els.undo.disabled = true;
  els.reset.disabled = true;
  const kind = await tk.imageKindOfFile(file);
  if (!kind) {
    tk.setStatus(els.status, tk.BROWSER_IMAGE_KINDS, 'err');
    return;
  }
  if (!ready) {
    tk.setStatus(els.status, tk.NO_CANVAS, 'err');
    return;
  }

  try {
    source = await tk.imageSource(file, kind);
    base.width = source.width;
    base.height = source.height;
    baseCtx.drawImage(source.img, 0, 0);
    els.canvas.width = source.width;
    els.canvas.height = source.height;
    els.preview.hidden = false;
    redraw();
    tk.setStatus(els.status, 'Drag on the picture to mark what should be hidden.');
  } catch (error) {
    tk.setStatus(els.status, error.message, 'err');
  }
}

els.file.addEventListener('change', onFile);

els.download.addEventListener('click', () => {
  if (!source) {
    tk.setStatus(els.status, 'Choose an image first.', 'err');
    return;
  }
  if (!boxes.length) {
    tk.setStatus(els.status, 'Mark at least one area before downloading.', 'err');
    return;
  }
  if (!outputBlob) {
    tk.setStatus(els.status, 'Still working — try again in a moment', '');
    return;
  }
  const stem = (source.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const name = `${stem}-redacted.png`;
  tk.download(name, outputBlob, 'image/png');
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
