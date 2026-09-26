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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// The magic bytes, so a renamed text file is refused by its contents.
function kindOf(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'gif';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'webp';
  return null;
}

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

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
    img.src = url;
  });
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
    els.original.textContent = `${source.width}×${source.height} · ${formatBytes(source.size)}`;
    els.output.textContent = blob ? `${width}×${height} · ${formatBytes(blob.size)}` : `${width}×${height} · —`;
    if (blob && source.size) {
      const pct = Math.round((1 - blob.size / source.size) * 100);
      els.saved.textContent = pct >= 0 ? `${pct}% smaller` : `${-pct}% larger`;
    } else {
      els.saved.textContent = '—';
    }
    tk.setStatus(els.status, blob ? `Ready — ${width}×${height}, ${formatBytes(blob.size)}.` : '', blob ? 'ok' : '');
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
  const head = new Uint8Array(await file.arrayBuffer()).subarray(0, 12);
  const kind = kindOf(head);
  if (!kind) {
    tk.setStatus(els.status, 'This does not look like a JPEG, PNG, GIF or WebP. Those are the four this page can read.', 'err');
    return;
  }
  if (!ctx) {
    tk.setStatus(els.status, 'This browser cannot resize images.', 'err');
    return;
  }

  try {
    const img = await loadImage(file);
    source = {
      img,
      name: file.name || 'image',
      kind,
      size: file.size,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
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
