// Shared QR renderer, used by QR Code Generator, Wi-Fi QR Code and QR Editor.
//
// The vendored library is used as an encoder and nothing else: `QRCode.create()`
// hands back the module matrix, and every path and pixel below is ours. That is
// not a stylistic choice — the library's own SVG output is one flat <path>, so
// there is nothing in it to hang a module shape, a gradient or a logo on.
import QRCode from './vendor/qrcode.js';

const NS = 'http://www.w3.org/2000/svg';
const XLINK = 'http://www.w3.org/1999/xlink';
const FINDER = 7;

export const DEFAULTS = {
  ecc: 'M',
  size: 320,
  margin: 2,
  dark: '#0f172a',
  light: '#ffffff',
  gradient: null, // { from, to, angle }
  shape: 'square', // square | rounded | dot
  finder: 'square', // square | rounded | dot — the three that were measured to scan
  logo: null, // { src, ratio, pad, radius, background }
};

// How large a centred logo can get before the code stops scanning, as a fraction
// of the code's width. Measured, not derived.
//
// The obvious guess — "H rebuilds 30% of the code, so a logo covering 10% of the
// area is safe" — is wrong, and wrong in the dangerous direction. Error correction
// is applied per block, not across the whole symbol, so a centred logo destroys
// one or two blocks outright while the overall average stays low. These numbers
// come from rendering each combination, rasterising the result and decoding it
// with an independent decoder over three payload lengths; each value is the
// largest size that decoded for all three, with the default 12% white box behind
// the logo, which erases modules of its own.
export const LOGO_LIMIT = { L: 0.12, M: 0.16, Q: 0.18, H: 0.24 };

export const ECC_CAPACITY = { L: 7, M: 15, Q: 25, H: 30 };

const num = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function resolve(options = {}) {
  const o = { ...DEFAULTS, ...options };
  return {
    ...o,
    size: Math.round(clamp(num(o.size, DEFAULTS.size), 64, 2048)),
    margin: Math.round(clamp(num(o.margin, DEFAULTS.margin), 0, 16)),
    light: o.light || 'transparent',
  };
}

export function encode(text, options = {}) {
  const o = resolve(options);
  const qr = QRCode.create(text, { errorCorrectionLevel: o.ecc });
  return { options: o, count: qr.modules.size, modules: qr.modules, version: qr.version };
}

// One module is `scale` pixels; the quiet zone is `margin` modules of padding, so
// the code body starts one margin in. The logo is centred in the body rather than
// in the canvas, which keeps the quiet zone even on all four sides.
function geometry({ options, count }) {
  const scale = options.size / (count + options.margin * 2);
  const body = { x: options.margin * scale, y: options.margin * scale, size: count * scale };
  return { scale, body, cell: (row, col) => ({ x: (col + options.margin) * scale, y: (row + options.margin) * scale }) };
}

// The three finder patterns are drawn on their own so they can take a different
// shape, which means the body loop has to skip them or they land on top of each
// other. Top-left, top-right, bottom-left — in (row, col) order.
function finderOrigins(count) {
  return [
    [0, 0],
    [0, count - FINDER],
    [count - FINDER, 0],
  ];
}

function isFinder(row, col, count) {
  return (
    (row < FINDER && col < FINDER) ||
    (row < FINDER && col >= count - FINDER) ||
    (row >= count - FINDER && col < FINDER)
  );
}

// A unit line across the image at `angle` degrees, measured clockwise from
// left-to-right. Returned as fractions so both renderers can scale it.
function gradientLine(angle) {
  const rad = (num(angle, 0) * Math.PI) / 180;
  const dx = Math.cos(rad) / 2;
  const dy = Math.sin(rad) / 2;
  return [0.5 - dx, 0.5 - dy, 0.5 + dx, 0.5 + dy];
}

// Where the logo sits, in pixels, plus the box its background is painted on.
function logoBox(geometry_, logo) {
  const side = geometry_.body.size * clamp(num(logo.ratio, 0.22), 0.08, 0.4);
  const pad = side * clamp(num(logo.pad, 0.12), 0, 0.5);
  const cx = geometry_.body.x + geometry_.body.size / 2;
  const cy = geometry_.body.y + geometry_.body.size / 2;
  return {
    x: cx - side / 2,
    y: cy - side / 2,
    side,
    pad,
    radius: (side * clamp(num(logo.radius, 25), 0, 50)) / 100,
  };
}

// How much of the code a centred logo hides, as a percentage of its area, and
// whether the measured limit for this error correction level leaves room for it.
export function logoCheck(ratio, ecc) {
  const width = clamp(num(ratio, 0.22), 0.08, 0.4);
  const limit = LOGO_LIMIT[ecc] || LOGO_LIMIT.M;
  return { ratio: width, coverage: width ** 2 * 100, limit, safe: width <= limit };
}

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------

let gradientSeq = 0;

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null) node.setAttribute(key, String(value));
  }
  return node;
}

function svgModule(shape, x, y, scale) {
  if (shape === 'dot') {
    const r = scale / 2;
    return el('circle', { cx: x + r, cy: y + r, r: r * 0.92 });
  }
  return el('rect', { x, y, width: scale, height: scale, rx: shape === 'rounded' ? scale * 0.35 : 0 });
}

// The finder is an outer ring one module thick and a solid 3x3 inside it. The
// ring is drawn as a *stroke* rather than as two filled squares, so the gap
// between them is whatever the background is — a real hole when the background is
// transparent, instead of a white square that only looks right on white.
//
// The outer ring is never a circle. A round ring breaks detection outright: with
// the ring circular the symbol stopped decoding with either a square or a round
// centre, while a rounded *square* ring decoded with both. The three styles below
// are exactly the three that were measured to work.
function svgFinder(style, { x, y }, scale, paint) {
  const group = el('g');
  const rx = style === 'square' ? 0 : scale * 1.6;
  group.append(
    el('rect', {
      x: x + scale / 2,
      y: y + scale / 2,
      width: 6 * scale,
      height: 6 * scale,
      rx,
      fill: 'none',
      stroke: paint,
      'stroke-width': scale,
    }),
  );
  if (style === 'dot') {
    group.append(el('circle', { cx: x + 3.5 * scale, cy: y + 3.5 * scale, r: 1.5 * scale, fill: paint }));
  } else {
    group.append(el('rect', { x: x + 2 * scale, y: y + 2 * scale, width: 3 * scale, height: 3 * scale, rx: rx / 2, fill: paint }));
  }
  return group;
}

export function renderSvg(text, options = {}) {
  const { options: o, count, modules } = encode(text, options);
  const g = geometry({ options: o, count });
  const svg = el('svg', {
    xmlns: NS,
    'xmlns:xlink': XLINK,
    viewBox: `0 0 ${o.size} ${o.size}`,
    width: o.size,
    height: o.size,
    role: 'img',
    'aria-label': 'QR code',
  });

  if (o.light !== 'transparent') svg.append(el('rect', { width: o.size, height: o.size, fill: o.light }));

  let paint = o.dark;
  if (o.gradient) {
    // userSpaceOnUse, not objectBoundingBox: each module is its own element, so a
    // bounding-box gradient would restart inside every single one.
    const [x1, y1, x2, y2] = gradientLine(o.gradient.angle);
    gradientSeq += 1;
    paint = `url(#qr-gradient-${gradientSeq})`;
    const gradient = el('linearGradient', {
      id: `qr-gradient-${gradientSeq}`,
      gradientUnits: 'userSpaceOnUse',
      x1: x1 * o.size,
      y1: y1 * o.size,
      x2: x2 * o.size,
      y2: y2 * o.size,
    });
    gradient.append(el('stop', { offset: '0', 'stop-color': o.gradient.from }));
    gradient.append(el('stop', { offset: '1', 'stop-color': o.gradient.to }));
    const defs = el('defs');
    defs.append(gradient);
    svg.append(defs);
  }

  const body = el('g', { fill: paint });
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!modules.get(row, col) || isFinder(row, col, count)) continue;
      const { x, y } = g.cell(row, col);
      body.append(svgModule(o.shape, x, y, g.scale));
    }
  }
  svg.append(body);

  const corners = el('g');
  for (const [row, col] of finderOrigins(count)) {
    const { x, y } = g.cell(row, col);
    corners.append(svgFinder(o.finder, { x, y }, g.scale, paint));
  }
  svg.append(corners);

  if (o.logo && o.logo.src) {
    const box = logoBox(g, o.logo);
    if (o.logo.background) {
      svg.append(
        el('rect', {
          x: box.x - box.pad,
          y: box.y - box.pad,
          width: box.side + box.pad * 2,
          height: box.side + box.pad * 2,
          rx: box.radius,
          fill: o.logo.background,
        }),
      );
    }
    // The data URI is embedded, so the downloaded file is self-contained. Both
    // href and xlink:href are set because SVG consumers are still split on which
    // one they read.
    const image = el('image', {
      x: box.x,
      y: box.y,
      width: box.side,
      height: box.side,
      preserveAspectRatio: 'xMidYMid meet',
      href: o.logo.src,
    });
    image.setAttributeNS(XLINK, 'xlink:href', o.logo.src);
    svg.append(image);
  }

  return svg;
}

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

// ctx.roundRect is recent (Chrome 99, Safari 16, Firefox 112), so fall back to a
// square corner rather than shipping an arc-based path for old browsers.
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, width, height, radius);
  else ctx.rect(x, y, width, height);
}

function drawModule(ctx, shape, x, y, scale) {
  if (shape === 'dot') {
    ctx.beginPath();
    ctx.arc(x + scale / 2, y + scale / 2, scale * 0.46, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (shape === 'rounded') {
    roundRect(ctx, x, y, scale, scale, scale * 0.35);
    ctx.fill();
    return;
  }
  ctx.fillRect(x, y, scale, scale);
}

function drawFinder(ctx, style, { x, y }, scale) {
  ctx.lineWidth = scale;
  // Never a circular outer ring — see svgFinder.
  const rx = style === 'square' ? 0 : scale * 1.6;
  roundRect(ctx, x + scale / 2, y + scale / 2, 6 * scale, 6 * scale, rx);
  ctx.stroke();
  if (style === 'dot') {
    ctx.beginPath();
    ctx.arc(x + 3.5 * scale, y + 3.5 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  roundRect(ctx, x + 2 * scale, y + 2 * scale, 3 * scale, 3 * scale, rx / 2);
  ctx.fill();
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That image could not be loaded'));
    image.src = src;
  });
}

export async function renderCanvas(text, options = {}) {
  const { options: o, count, modules } = encode(text, options);
  const g = geometry({ options: o, count });
  const canvas = document.createElement('canvas');
  canvas.width = o.size;
  canvas.height = o.size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot build the PNG here — the SVG download works everywhere.');

  if (o.light !== 'transparent') {
    ctx.fillStyle = o.light;
    ctx.fillRect(0, 0, o.size, o.size);
  }

  let paint = o.dark;
  if (o.gradient) {
    const [x1, y1, x2, y2] = gradientLine(o.gradient.angle);
    const grad = ctx.createLinearGradient(x1 * o.size, y1 * o.size, x2 * o.size, y2 * o.size);
    grad.addColorStop(0, o.gradient.from);
    grad.addColorStop(1, o.gradient.to);
    paint = grad;
  }
  ctx.fillStyle = paint;
  ctx.strokeStyle = paint;

  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!modules.get(row, col) || isFinder(row, col, count)) continue;
      const { x, y } = g.cell(row, col);
      drawModule(ctx, o.shape, x, y, g.scale);
    }
  }

  for (const [row, col] of finderOrigins(count)) {
    const { x, y } = g.cell(row, col);
    drawFinder(ctx, o.finder, { x, y }, g.scale);
  }

  if (o.logo && o.logo.src) {
    const box = logoBox(g, o.logo);
    if (o.logo.background) {
      ctx.fillStyle = o.logo.background;
      roundRect(ctx, box.x - box.pad, box.y - box.pad, box.side + box.pad * 2, box.side + box.pad * 2, box.radius);
      ctx.fill();
    }
    ctx.drawImage(await loadImage(o.logo.src), box.x, box.y, box.side, box.side);
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

// A logo is embedded as a data URI in the SVG, and the SVG is then handed to the
// browser as an <image>. An SVG logo could therefore carry a script of its own,
// so only raster formats are accepted — nothing here needs a vector logo.
const RASTER = /^image\/(png|jpeg|jpg|gif|webp|bmp|avif)$/;

export function readLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Choose an image first'));
      return;
    }
    if (!RASTER.test(file.type)) {
      reject(new Error('Use a PNG, JPEG, GIF, WebP or BMP — not an SVG'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result, name: file.name });
    reader.onerror = () => reject(new Error('Could not read that image'));
    reader.readAsDataURL(file);
  });
}

export function svgToString(svg) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(svg)}\n`;
}

// The canvas is the only thing that knows how to make a PNG, so this is the one
// place that has to touch the DOM to download one.
export function canvasToPng(canvas) {
  return canvas.toDataURL('image/png');
}
