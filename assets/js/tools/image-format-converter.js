// Re-encode an image to another format. The canvas writes whatever the
// browser's encoder supports, so AVIF is offered only after a probe.
const { tk } = window;

const els = {
  file: document.querySelector('#ifc-file'),
  format: document.querySelector('#ifc-format'),
  quality: document.querySelector('#ifc-quality'),
  qualityValue: document.querySelector('#ifc-quality-value'),
  download: document.querySelector('#ifc-download'),
  status: document.querySelector('#ifc-status'),
  note: document.querySelector('#ifc-note'),
  preview: document.querySelector('#ifc-preview'),
  canvas: document.querySelector('#ifc-canvas'),
  inputInfo: document.querySelector('#ifc-input-info'),
  outputInfo: document.querySelector('#ifc-output-info'),
  change: document.querySelector('#ifc-change'),
};

const MIME = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };
const EXT = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };
const LABEL = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP', avif: 'AVIF' };

const ctx = els.canvas.getContext('2d');
let source = null;
let outputBlob = null;
let runId = 0;

// Ask the canvas to encode a pixel and see what MIME type comes back. A
// browser without AVIF silently answers with a PNG.
function canEncode(type) {
  if (!ctx) return false;
  try {
    return els.canvas.toDataURL(type).startsWith(`data:${type}`);
  } catch {
    return false;
  }
}

function setupAvif() {
  const option = [...els.format.options].find((entry) => entry.value === 'avif');
  if (!option || canEncode('image/avif')) return;
  option.disabled = true;
  option.textContent = 'AVIF (not supported here)';
  if (els.format.value === 'avif') els.format.value = 'webp';
}

function clear() {
  source = null;
  outputBlob = null;
  runId += 1;
  els.preview.hidden = true;
  els.inputInfo.textContent = '—';
  els.outputInfo.textContent = '—';
  els.change.textContent = '—';
}

function update() {
  if (!source || !ctx) return;
  const type = els.format.value;
  els.canvas.width = source.width;
  els.canvas.height = source.height;
  ctx.clearRect(0, 0, source.width, source.height);
  // A JPEG has no alpha channel, so a transparent PNG needs a white backing.
  if (type === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, source.width, source.height);
  }
  ctx.drawImage(source.img, 0, 0);

  els.quality.disabled = type === 'png';
  els.qualityValue.textContent = els.quality.value;
  const id = ++runId;
  const quality = type === 'png' ? undefined : Number(els.quality.value) / 100;
  els.inputInfo.textContent = `${LABEL[source.kind] || source.kind.toUpperCase()} · ${source.width}×${source.height} · ${tk.formatBytes(source.size)}`;

  const finish = (blob) => {
    if (id !== runId) return;
    outputBlob = blob || null;
    els.outputInfo.textContent = blob
      ? `${LABEL[type]} · ${source.width}×${source.height} · ${tk.formatBytes(blob.size)}`
      : `${LABEL[type]} · —`;
    if (blob && source.size) {
      const percent = Math.round((blob.size / source.size - 1) * 100);
      els.change.textContent = percent <= 0 ? `${-percent}% smaller` : `${percent}% larger`;
    } else {
      els.change.textContent = '—';
    }
    els.download.disabled = false;
    tk.setStatus(els.status, blob ? `Ready — ${LABEL[type]}, ${tk.formatBytes(blob.size)}.` : 'This browser could not encode that format.', blob ? 'ok' : 'err');
  };

  els.download.disabled = true;
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

setupAvif();
if (!ctx) els.note.textContent = 'This browser cannot encode images here.';

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
    tk.setStatus(els.status, 'Still converting — try again in a moment', '');
    return;
  }
  const type = els.format.value;
  const base = (source.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const name = `${base}.${EXT[type]}`;
  tk.download(name, outputBlob, MIME[type]);
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
