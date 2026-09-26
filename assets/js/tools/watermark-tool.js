// Write a line of text onto an image. The work happens on a canvas, so the
// original file is never touched and the pixels are baked in on download.
const { tk } = window;

const els = {
  file: document.querySelector('#wmt-file'),
  text: document.querySelector('#wmt-text'),
  position: document.querySelector('#wmt-position'),
  size: document.querySelector('#wmt-size'),
  sizeValue: document.querySelector('#wmt-size-value'),
  color: document.querySelector('#wmt-color'),
  opacity: document.querySelector('#wmt-opacity'),
  opacityValue: document.querySelector('#wmt-opacity-value'),
  date: document.querySelector('#wmt-date'),
  outline: document.querySelector('#wmt-outline'),
  download: document.querySelector('#wmt-download'),
  status: document.querySelector('#wmt-status'),
  preview: document.querySelector('#wmt-preview'),
  canvas: document.querySelector('#wmt-canvas'),
};

const ctx = els.canvas.getContext('2d');
let source = null;
let outputBlob = null;
let runId = 0;

function today() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function caption() {
  const text = els.text.value.trim();
  return els.date.checked ? (text ? `${text} · ${today()}` : today()) : text;
}

// Where the text sits, and which way its baseline points.
function anchor(position, width, height, pad) {
  const spots = {
    'bottom-right': { x: width - pad, y: height - pad, align: 'right', baseline: 'bottom' },
    'bottom-left': { x: pad, y: height - pad, align: 'left', baseline: 'bottom' },
    'top-right': { x: width - pad, y: pad, align: 'right', baseline: 'top' },
    'top-left': { x: pad, y: pad, align: 'left', baseline: 'top' },
    center: { x: width / 2, y: height / 2, align: 'center', baseline: 'middle' },
  };
  return spots[position] || spots['bottom-right'];
}

function draw() {
  if (!source || !ctx) return;
  const { width, height } = source;
  els.canvas.width = width;
  els.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source.img, 0, 0);

  const text = caption();
  const short = Math.min(width, height);
  const font = Math.max(8, Math.round((short * Number(els.size.value)) / 100));
  const pad = Math.round(short * 0.03);
  const spot = anchor(els.position.value, width, height, pad);

  ctx.save();
  ctx.font = `bold ${font}px sans-serif`;
  ctx.textAlign = spot.align;
  ctx.textBaseline = spot.baseline;
  ctx.globalAlpha = Number(els.opacity.value) / 100;
  if (text) {
    if (els.outline.checked) {
      ctx.lineWidth = Math.max(1, font / 10);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.strokeText(text, spot.x, spot.y);
    }
    ctx.fillStyle = els.color.value;
    ctx.fillText(text, spot.x, spot.y);
  }
  ctx.restore();

  els.sizeValue.textContent = els.size.value;
  els.opacityValue.textContent = els.opacity.value;

  const id = ++runId;
  const finish = (blob) => {
    if (id !== runId) return;
    outputBlob = blob || null;
    els.download.disabled = !blob;
    tk.setStatus(els.status, blob ? `Ready — ${width}×${height}, ${tk.formatBytes(blob.size)}.` : '', blob ? 'ok' : '');
  };
  if (els.canvas.toBlob) els.canvas.toBlob(finish, 'image/png');
  else finish(null);
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
    draw();
  } catch (error) {
    tk.setStatus(els.status, error.message, 'err');
  }
}

els.file.addEventListener('change', onFile);
tk.live([els.text, els.position, els.size, els.color, els.opacity, els.date, els.outline], draw);

els.download.addEventListener('click', () => {
  if (!source) {
    tk.setStatus(els.status, 'Choose an image first.', 'err');
    return;
  }
  if (!outputBlob) {
    tk.setStatus(els.status, 'Still drawing — try again in a moment', '');
    return;
  }
  const base = (source.name || 'image').replace(/\.[^.]+$/, '') || 'image';
  const name = `${base}-watermarked.png`;
  tk.download(name, outputBlob, 'image/png');
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
