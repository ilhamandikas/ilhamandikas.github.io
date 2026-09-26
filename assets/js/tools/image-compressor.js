// Resize and re-encode an image in the page: the pixels are redrawn onto a
// canvas and written out again, so the file is never uploaded. Re-encoding is
// also what drops EXIF and GPS, which the about section calls out.
const { tk } = window;

const els = {
  file: document.querySelector('#imc-file'),
  maxWidth: document.querySelector('#imc-max-width'),
  maxHeight: document.querySelector('#imc-max-height'),
  format: document.querySelector('#imc-format'),
  quality: document.querySelector('#imc-quality'),
  qualityValue: document.querySelector('#imc-quality-value'),
  download: document.querySelector('#imc-download'),
  status: document.querySelector('#imc-status'),
  preview: document.querySelector('#imc-preview'),
  canvas: document.querySelector('#imc-canvas'),
  original: document.querySelector('#imc-original'),
  output: document.querySelector('#imc-output'),
  saved: document.querySelector('#imc-saved'),
};

const MIME = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const EXT = { jpeg: 'jpg', png: 'png', webp: 'webp' };

const ctx = els.canvas.getContext('2d');
let source = null;
let outputBlob = null;
let runId = 0;
let busy = false;

function targetType() {
  if (els.format.value !== 'original') return els.format.value;
  return source && (source.kind === 'png' || source.kind === 'webp') ? source.kind : 'jpeg';
}

// Width and height are ceilings, so the aspect ratio holds and the image is
// never enlarged.
function targetSize() {
  const maxW = Number(els.maxWidth.value) || 0;
  const maxH = Number(els.maxHeight.value) || 0;
  let scale = 1;
  if (maxW > 0) scale = Math.min(scale, maxW / source.width);
  if (maxH > 0) scale = Math.min(scale, maxH / source.height);
  scale = Math.min(scale, 1);
  return {
    width: Math.max(1, Math.round(source.width * scale)),
    height: Math.max(1, Math.round(source.height * scale)),
  };
}

function clear() {
  source = null;
  outputBlob = null;
  runId += 1;
  busy = false;
  els.preview.hidden = true;
  els.download.disabled = false;
  els.original.textContent = '—';
  els.output.textContent = '—';
  els.saved.textContent = '—';
}

function update() {
  if (!source) return;
  if (!ctx) {
    tk.setStatus(els.status, 'This browser cannot resize images.', 'err');
    return;
  }

  const type = targetType();
  const { width, height } = targetSize();
  els.canvas.width = width;
  els.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source.img, 0, 0, width, height);

  els.quality.disabled = type === 'png';
  els.qualityValue.textContent = els.quality.value;

  const id = ++runId;
  busy = true;
  els.download.disabled = true;

  const finish = (blob) => {
    if (id !== runId) return;
    busy = false;
    els.download.disabled = false;
    outputBlob = blob || null;
    els.original.textContent = `${source.width}×${source.height} · ${tk.formatBytes(source.size)}`;
    els.output.textContent = blob ? `${width}×${height} · ${tk.formatBytes(blob.size)}` : `${width}×${height} · —`;
    if (blob && source.size) {
      const pct = Math.round((1 - blob.size / source.size) * 100);
      els.saved.textContent = pct >= 0 ? `${pct}% smaller` : `${-pct}% larger`;
    } else {
      els.saved.textContent = '—';
    }
    tk.setStatus(els.status, blob ? `Ready — ${width}×${height}, ${tk.formatBytes(blob.size)}.` : '', blob ? 'ok' : '');
  };

  const quality = type === 'png' ? undefined : Number(els.quality.value) / 100;
  if (els.canvas.toBlob) els.canvas.toBlob(finish, MIME[type], quality);
  else finish(null);
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  clear();
  els.download.disabled = true;
  const kind = await tk.imageKindOfFile(file);
  if (!kind) {
    tk.setStatus(els.status, tk.BROWSER_IMAGE_KINDS, 'err');
    return;
  }
  if (!ctx) {
    tk.setStatus(els.status, tk.NO_CANVAS, 'err');
    return;
  }

  try {
    source = await tk.imageSource(file, kind);
    els.preview.hidden = false;
    update();
  } catch (error) {
    tk.setStatus(els.status, error.message, 'err');
  }
}

els.file.addEventListener('change', onFile);
els.quality.addEventListener('input', () => {
  els.qualityValue.textContent = els.quality.value;
  update();
});
tk.live([els.maxWidth, els.maxHeight, els.format], update);

els.download.addEventListener('click', () => {
  if (!source) {
    tk.setStatus(els.status, 'Choose an image first.', 'err');
    return;
  }
  if (busy || !outputBlob) {
    tk.setStatus(els.status, 'Still compressing — try again in a moment.', '');
    return;
  }
  const type = targetType();
  const base = (source.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const name = `${base}-compressed.${EXT[type]}`;
  tk.download(name, outputBlob, MIME[type]);
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
