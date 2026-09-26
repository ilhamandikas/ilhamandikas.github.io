// Clear a plain background from an image. Pixels along the edge are flooded
// inwards and anything close enough in colour turns transparent, which suits a
// uniform backdrop and not a busy one.
const { tk } = window;

const els = {
  file: document.querySelector('#bgr-file'),
  tolerance: document.querySelector('#bgr-tolerance'),
  toleranceValue: document.querySelector('#bgr-tolerance-value'),
  seeds: document.querySelector('#bgr-seeds'),
  edge: document.querySelector('#bgr-edge'),
  format: document.querySelector('#bgr-format'),
  download: document.querySelector('#bgr-download'),
  reset: document.querySelector('#bgr-reset'),
  status: document.querySelector('#bgr-status'),
  result: document.querySelector('#bgr-result'),
  source: document.querySelector('#bgr-source'),
  work: document.querySelector('#bgr-work'),
  removed: document.querySelector('#bgr-removed'),
  output: document.querySelector('#bgr-output'),
  canvas: document.querySelector('#bgr-canvas'),
};

// The flood fill and the softening pass are both linear in the pixel count, so
// a cap keeps a slider drag responsive on a phone.
const MAX_PIXELS = 4000000;
const CHANNEL_MAX = 441.673; // the longest possible distance in RGB space

let pixels = null;
let width = 0;
let height = 0;
let working = null;
let blob = null;
let runId = 0;

function fit(source) {
  const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (source.width * source.height)));
  working = { width: Math.max(1, Math.round(source.width * scale)), height: Math.max(1, Math.round(source.height * scale)) };
  return scale < 1;
}

// Flood fill from the seeds. One reference colour is used, the average of the
// seeds, which is plenty for a flat backdrop and leaves the tolerance slider to
// cover a slight gradient.
function flood(data, tolerance) {
  const total = width * height;
  const limit = (tolerance / 100) * CHANNEL_MAX;
  const seeds = [];
  for (let x = 0; x < width; x += 1) {
    seeds.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    seeds.push(y * width, y * width + width - 1);
  }
  const seedsOnly = els.seeds.value === 'corners' ? [0, width - 1, (height - 1) * width, total - 1] : [...new Set(seeds)];

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  seedsOnly.forEach((index) => {
    const offset = index * 4;
    sumR += data[offset];
    sumG += data[offset + 1];
    sumB += data[offset + 2];
  });
  const refR = sumR / seedsOnly.length;
  const refG = sumG / seedsOnly.length;
  const refB = sumB / seedsOnly.length;

  const mask = new Float32Array(total).fill(255);
  const seen = new Uint8Array(total);
  let stack = new Int32Array(4096);
  let top = 0;

  const matches = (index) => {
    const offset = index * 4;
    const dr = data[offset] - refR;
    const dg = data[offset + 1] - refG;
    const db = data[offset + 2] - refB;
    return Math.sqrt(dr * dr + dg * dg + db * db) <= limit;
  };

  const push = (index) => {
    if (top === stack.length) {
      const grown = new Int32Array(stack.length * 2);
      grown.set(stack);
      stack = grown;
    }
    stack[top++] = index;
  };

  const visit = (index) => {
    if (index < 0 || index >= total || seen[index]) return;
    if (!matches(index)) return;
    seen[index] = 1;
    mask[index] = 0;
    push(index);
  };

  seedsOnly.forEach(visit);
  while (top > 0) {
    const index = stack[--top];
    const x = index % width;
    if (x > 0) visit(index - 1);
    if (x < width - 1) visit(index + 1);
    if (index >= width) visit(index - width);
    if (index + width < total) visit(index + width);
  }

  return mask;
}

// Soften the mask so the cut edge does not look like a staircase.
function soften(mask, rounds) {
  let current = mask;
  for (let round = 0; round < rounds; round += 1) {
    const next = new Float32Array(current.length);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let sum = 0;
        let count = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            sum += current[ny * width + nx];
            count += 1;
          }
        }
        next[y * width + x] = sum / count;
      }
    }
    current = next;
  }
  return current;
}

function paint() {
  const data = new Uint8ClampedArray(pixels);
  const tolerance = Number(els.tolerance.value);
  els.toleranceValue.textContent = `${tolerance}%`;

  const mask = soften(flood(data, tolerance), Math.max(0, Math.min(3, Number(els.edge.value) || 0)));

  let cleared = 0;
  for (let i = 0; i < mask.length; i += 1) {
    data[i * 4 + 3] = mask[i];
    if (mask[i] < 128) cleared += 1;
  }

  els.canvas.width = width;
  els.canvas.height = height;
  const context = els.canvas.getContext('2d');
  if (!context) {
    tk.setStatus(els.status, tk.NO_CANVAS, 'err');
    return 0;
  }
  context.putImageData(new ImageData(data, width, height), 0, 0);

  const percent = (cleared / mask.length) * 100;
  els.removed.textContent = `${percent.toFixed(1)}% of the pixels`;
  return percent;
}

async function exportImage(percent) {
  const type = els.format.value;
  blob = await new Promise((resolve) => els.canvas.toBlob(resolve, type, 0.92));
  if (!blob) {
    tk.setStatus(els.status, 'The browser could not write that format.', 'err');
    return;
  }
  els.output.textContent = `${tk.formatBytes(blob.size)} as ${type === 'image/webp' ? 'WebP' : 'PNG'}`;
  tk.setStatus(els.status, `Ready — ${percent.toFixed(1)}% of the pixels removed.`, 'ok');
}

async function render() {
  if (!pixels) return;
  const id = ++runId;
  try {
    const percent = paint();
    if (id !== runId) return;
    await exportImage(percent);
    if (id !== runId) return;
    if (percent < 0.05) tk.setStatus(els.status, 'Nothing matched the background. Raise the colour match, or start from a different set of pixels.', '');
  } catch {
    tk.setStatus(els.status, 'The image could not be processed.', 'err');
  }
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;

  pixels = null;
  runId += 1;
  els.download.disabled = true;
  els.reset.disabled = true;
  els.result.hidden = true;

  // Bytes first, then the canvas, then the decode: each answer is more useful
  // than the one after it, and a file that is not an image at all is named as
  // such even where the canvas is unavailable.
  const kind = await tk.imageKindOfFile(file);
  if (!kind) {
    tk.setStatus(els.status, tk.BROWSER_IMAGE_KINDS, 'err');
    return;
  }
  if (!document.createElement('canvas').getContext('2d')) {
    tk.setStatus(els.status, tk.NO_CANVAS, 'err');
    return;
  }

  let source;
  try {
    source = await tk.imageSource(file, kind);
  } catch {
    tk.setStatus(els.status, 'The image could not be decoded.', 'err');
    return;
  }

  const scaled = fit(source);
  const canvas = document.createElement('canvas');
  canvas.width = width = working.width;
  canvas.height = height = working.height;
  const context = canvas.getContext('2d');
  context.drawImage(source.img, 0, 0, width, height);
  pixels = context.getImageData(0, 0, width, height).data;

  els.source.textContent = `${source.name} · ${tk.formatBytes(source.size)}`;
  els.work.textContent = `${working.width}×${working.height}${scaled ? ' (scaled to fit 4 MP)' : ''}`;
  els.result.hidden = false;
  els.download.disabled = false;
  els.reset.disabled = false;
  await render();
}

els.file.addEventListener('change', onFile);
tk.live([els.tolerance, els.seeds, els.edge, els.format], render, 200);

els.reset.addEventListener('click', () => {
  els.tolerance.value = '24';
  els.seeds.value = 'border';
  els.edge.value = '1';
  render();
});

els.download.addEventListener('click', () => {
  if (!blob) {
    tk.setStatus(els.status, 'Choose an image first.', 'err');
    return;
  }
  const extension = els.format.value === 'image/webp' ? 'webp' : 'png';
  const name = `background-removed.${extension}`;
  tk.download(name, blob, els.format.value);
  tk.setStatus(els.status, `Saved ${name}.`, 'ok');
});
