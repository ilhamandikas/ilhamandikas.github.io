// Fit a picture under a size in kilobytes by walking the quality down until
// the encoder produces something small enough, keeping the highest that fits.
const { tk } = window;

const els = {
  file: document.querySelector('#ptr-file'),
  target: document.querySelector('#ptr-target'),
  edge: document.querySelector('#ptr-edge'),
  webp: document.querySelector('#ptr-webp'),
  download: document.querySelector('#ptr-download'),
  status: document.querySelector('#ptr-status'),
  preview: document.querySelector('#ptr-preview'),
  canvas: document.querySelector('#ptr-canvas'),
  original: document.querySelector('#ptr-original'),
  output: document.querySelector('#ptr-output'),
};

const ctx = els.canvas.getContext('2d');
const QUALITIES = [0.92, 0.86, 0.8, 0.74, 0.68, 0.6, 0.52, 0.44, 0.36, 0.3];
let source = null;
let outputBlob = null;
let outputType = 'image/jpeg';
let runId = 0;

function encode(type, quality) {
  return new Promise((resolve) => {
    if (!els.canvas.toBlob) return resolve(null);
    els.canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function run() {
  if (!source || !ctx) return;
  const id = ++runId;
  els.download.disabled = true;

  const targetKb = Number(els.target.value) || 0;
  const limit = targetKb > 0 ? targetKb * 1024 : Infinity;
  const edge = Number(els.edge.value) || 0;
  const scale = edge > 0 ? Math.min(1, edge / Math.max(source.width, source.height)) : 1;
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  els.canvas.width = width;
  els.canvas.height = height;
  // A photo is written as JPEG, which has no alpha, so lay down a white base.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source.img, 0, 0, width, height);
  els.original.textContent = `${source.width}×${source.height} · ${tk.formatBytes(source.size)}`;

  let best = null;
  let quality = QUALITIES[QUALITIES.length - 1];
  for (const candidate of QUALITIES) {
    const blob = await encode('image/jpeg', candidate);
    if (!blob) break;
    best = blob;
    quality = candidate;
    if (blob.size <= limit) break;
  }

  let type = 'image/jpeg';
  if (best && els.webp.checked) {
    const webp = await encode('image/webp', quality);
    if (webp && webp.size < best.size) {
      best = webp;
      type = 'image/webp';
    }
  }

  if (id !== runId) return;
  outputBlob = best;
  outputType = type;
  els.download.disabled = !best;
  if (!best) {
    els.output.textContent = '—';
    tk.setStatus(els.status, 'This browser cannot re-encode images here.', 'err');
    return;
  }

  const label = type === 'image/webp' ? 'WebP' : 'JPEG';
  const percent = Math.round(quality * 100);
  els.output.textContent = `${label} · ${width}×${height} · ${tk.formatBytes(best.size)} · quality ${percent}%`;
  if (best.size <= limit) {
    tk.setStatus(els.status, `Ready — ${tk.formatBytes(best.size)} at quality ${percent}%.`, 'ok');
  } else {
    tk.setStatus(els.status, `Could not reach ${targetKb} KB — the smallest was ${tk.formatBytes(best.size)} at quality ${percent}%. Lower the longest edge and try again.`, 'err');
  }
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  source = null;
  outputBlob = null;
  runId += 1;
  els.preview.hidden = true;
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
    await run();
  } catch (error) {
    tk.setStatus(els.status, error.message, 'err');
  }
}

els.file.addEventListener('change', onFile);
tk.live([els.target, els.edge, els.webp], run);

els.download.addEventListener('click', () => {
  if (!source) {
    tk.setStatus(els.status, 'Choose an image first.', 'err');
    return;
  }
  if (!outputBlob) {
    tk.setStatus(els.status, 'Still working — try again in a moment', '');
    return;
  }
  const base = (source.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const extension = outputType === 'image/webp' ? 'webp' : 'jpg';
  const name = `${base}-${Math.round(outputBlob.size / 1024)}kb.${extension}`;
  tk.download(name, outputBlob, outputType);
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
