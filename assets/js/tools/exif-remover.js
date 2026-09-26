// Rewriting an image through a canvas keeps the pixels and drops everything
// else, which is what removes EXIF, GPS and the thumbnails embedded alongside.
const { tk } = window;

const els = {
  file: document.querySelector('#exf-file'),
  format: document.querySelector('#exf-format'),
  quality: document.querySelector('#exf-quality'),
  qualityValue: document.querySelector('#exf-quality-value'),
  download: document.querySelector('#exf-download'),
  status: document.querySelector('#exf-status'),
  preview: document.querySelector('#exf-preview'),
  canvas: document.querySelector('#exf-canvas'),
  original: document.querySelector('#exf-original'),
  output: document.querySelector('#exf-output'),
};

const MIME = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const EXT = { jpeg: 'jpg', png: 'png', webp: 'webp' };

const ctx = els.canvas.getContext('2d');
let source = null;
let outputBlob = null;
let runId = 0;

function targetType() {
  if (els.format.value !== 'original') return els.format.value;
  return source && (source.kind === 'png' || source.kind === 'webp') ? source.kind : 'jpeg';
}

function clear() {
  source = null;
  outputBlob = null;
  runId += 1;
  els.preview.hidden = true;
  els.original.textContent = '—';
  els.output.textContent = '—';
}

function update() {
  if (!source || !ctx) return;
  const type = targetType();
  els.canvas.width = source.width;
  els.canvas.height = source.height;
  ctx.clearRect(0, 0, source.width, source.height);
  ctx.drawImage(source.img, 0, 0);

  const id = ++runId;
  const quality = type === 'png' ? undefined : Number(els.quality.value) / 100;
  els.original.textContent = `${source.width}×${source.height} · ${tk.formatBytes(source.size)}`;

  const finish = (blob) => {
    if (id !== runId) return;
    outputBlob = blob || null;
    els.output.textContent = blob
      ? `${source.width}×${source.height} · ${tk.formatBytes(blob.size)}`
      : `${source.width}×${source.height} · —`;
    tk.setStatus(els.status, blob ? `Metadata stripped — ${tk.formatBytes(blob.size)} of ${tk.formatBytes(source.size)}.` : '', blob ? 'ok' : '');
  };

  if (els.canvas.toBlob) els.canvas.toBlob(finish, MIME[type], quality);
  else finish(null);
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  clear();
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
tk.live([els.format], update);

els.download.addEventListener('click', () => {
  if (!source) {
    tk.setStatus(els.status, 'Choose an image first.', 'err');
    return;
  }
  if (!outputBlob) {
    tk.setStatus(els.status, 'Still working — try again in a moment', '');
    return;
  }
  const type = targetType();
  const base = (source.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const name = `${base}-clean.${EXT[type]}`;
  tk.download(name, outputBlob, MIME[type]);
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
