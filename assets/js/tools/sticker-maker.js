const { tk } = window;

const file = document.querySelector('#stk-file');
const shape = document.querySelector('#stk-shape');
const topText = document.querySelector('#stk-top');
const bottomText = document.querySelector('#stk-bottom');
const textStyle = document.querySelector('#stk-text-style');
const textColor = document.querySelector('#stk-text-color');
const accent = document.querySelector('#stk-accent');
const zoom = document.querySelector('#stk-zoom');
const imageY = document.querySelector('#stk-y');
const textSize = document.querySelector('#stk-text-size');
const removeBg = document.querySelector('#stk-remove-bg');
const tolerance = document.querySelector('#stk-tolerance');
const outline = document.querySelector('#stk-outline');
const transparent = document.querySelector('#stk-transparent');
const canvas = document.querySelector('#stk-canvas');
const status = document.querySelector('#stk-status');
const ctx = canvas.getContext('2d');
let image = null;

function loadImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
    img.src = url;
  });
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function drawFrame() {
  const pad = 70;
  ctx.save();
  if (shape.value === 'circle') {
    ctx.beginPath();
    ctx.arc(512, 512, 430, 0, Math.PI * 2);
  } else if (shape.value === 'rounded') roundRect(ctx, pad, pad, 884, 884, 120);
  else if (shape.value === 'square') ctx.rect(pad, pad, 884, 884);
  else ctx.rect(0, 0, 1024, 1024);
  ctx.clip();
  if (!transparent.checked) {
    const grad = ctx.createLinearGradient(140, 80, 900, 920);
    grad.addColorStop(0, accent.value || '#2563eb');
    grad.addColorStop(1, '#111827');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
  }
  ctx.restore();

  if (outline.checked && shape.value !== 'none') {
    ctx.save();
    ctx.lineWidth = 34;
    ctx.strokeStyle = '#fff';
    if (shape.value === 'circle') { ctx.beginPath(); ctx.arc(512, 512, 430, 0, Math.PI * 2); }
    else if (shape.value === 'rounded') roundRect(ctx, pad, pad, 884, 884, 120);
    else ctx.rect(pad, pad, 884, 884);
    ctx.stroke();
    ctx.restore();
  }
}

function removeBackground(source) {
  const temp = document.createElement('canvas');
  temp.width = source.width;
  temp.height = source.height;
  const c = temp.getContext('2d');
  c.drawImage(source, 0, 0);
  const data = c.getImageData(0, 0, temp.width, temp.height);
  const d = data.data;
  const pts = [[0, 0], [temp.width - 1, 0], [0, temp.height - 1], [temp.width - 1, temp.height - 1]];
  const bg = pts.map(([x, y]) => {
    const i = (y * temp.width + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  });
  const limit = Number(tolerance.value) * 4.5;
  for (let i = 0; i < d.length; i += 4) {
    const hit = bg.some(([r, g, b]) => Math.abs(d[i] - r) + Math.abs(d[i + 1] - g) + Math.abs(d[i + 2] - b) < limit);
    if (hit) d[i + 3] = 0;
  }
  c.putImageData(data, 0, 0);
  return temp;
}

function drawImageLayer() {
  if (!image) return;
  const src = removeBg.checked ? removeBackground(image) : image;
  const max = 720 * (Number(zoom.value) / 100);
  const scale = Math.min(max / src.width, max / src.height);
  const w = src.width * scale;
  const h = src.height * scale;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.28)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  ctx.drawImage(src, (1024 - w) / 2, (1024 - h) / 2 + Number(imageY.value), w, h);
  ctx.restore();
}

function fitText(text, max, start) {
  let size = start;
  do {
    ctx.font = `900 ${size}px system-ui, sans-serif`;
    if (ctx.measureText(text).width <= max) return size;
    size -= 4;
  } while (size > 28);
  return size;
}

function drawStickerText(text, y) {
  if (!text.trim()) return;
  const value = text.trim().toUpperCase();
  const size = fitText(value, 900, Number(textSize.value) || 92);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${size}px system-ui, sans-serif`;
  ctx.lineJoin = 'round';
  if (textStyle.value === 'bubble') {
    ctx.lineWidth = 28;
    ctx.strokeStyle = accent.value || '#2563eb';
    ctx.strokeText(value, 512, y);
  } else if (textStyle.value === 'ribbon') {
    const metrics = ctx.measureText(value);
    const width = Math.min(930, metrics.width + 90);
    ctx.fillStyle = accent.value || '#2563eb';
    roundRect(ctx, (1024 - width) / 2, y - size * .62, width, size * 1.24, 30);
    ctx.fill();
  } else if (textStyle.value === 'neon') {
    ctx.shadowColor = accent.value || '#2563eb';
    ctx.shadowBlur = 28;
    ctx.lineWidth = 10;
    ctx.strokeStyle = accent.value || '#2563eb';
    ctx.strokeText(value, 512, y);
  } else if (textStyle.value === 'meme') {
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#111';
    ctx.strokeText(value, 512, y);
  }
  ctx.fillStyle = textColor.value || '#fff';
  ctx.fillText(value, 512, y);
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, 1024, 1024);
  drawFrame();
  drawImageLayer();
  drawStickerText(topText.value, 135);
  drawStickerText(bottomText.value, 890);
}

file.addEventListener('change', async () => {
  try {
    image = await loadImage(file.files[0]);
    tk.setStatus(status, 'Image loaded', 'ok');
    render();
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

document.querySelector('#stk-download').addEventListener('click', () => {
  render();
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'sticker.png';
  a.click();
});

tk.live([shape, topText, bottomText, textStyle, textColor, accent, zoom, imageY, textSize, removeBg, tolerance, outline, transparent], render);
render();
