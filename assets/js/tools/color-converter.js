// Color converter — Canvas parses supported CSS colors; results stay text-only.
const { tk } = window;

const input = document.querySelector('#color-input');
let context;

function parse(text) {
  let value = text.trim();
  if (value === '') return null;
  // Keep standalone CSS-wide keywords consistent with the old body-child probe.
  if (/^(currentcolor|inherit|unset|revert|revert-layer)$/i.test(value)) value = getComputedStyle(document.body).color;
  if (/^initial$/i.test(value)) value = '#000000';
  if (!context) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    context = canvas.getContext('2d');
  }
  if (!context) throw new Error('Canvas color parsing is unavailable in this browser. Try another browser.');

  // Invalid fillStyle assignments are ignored. Two different starting colors
  // distinguish rejection from a valid color that happens to equal one sentinel.
  context.fillStyle = '#010203';
  context.fillStyle = value;
  const normalized = context.fillStyle;
  context.fillStyle = '#040506';
  context.fillStyle = value;
  if (context.fillStyle !== normalized) throw new Error('Unrecognised color. Use HEX, rgb(), hsl(), or a CSS color name; stylesheet expressions such as var() are not supported.');

  const hexColor = normalized.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (hexColor) return { r: parseInt(hexColor[1], 16), g: parseInt(hexColor[2], 16), b: parseInt(hexColor[3], 16), a: 1 };
  const match = normalized.match(/^rgba?\(([^)]+)\)$/);
  if (!match) throw new Error('This color format is not supported. Use HEX, rgb(), hsl(), or a CSS color name.');
  const parts = match[1].split(',').map((p) => parseFloat(p));
  if (parts.length < 3 || parts.length > 4 || parts.some((p) => !Number.isFinite(p))) throw new Error('Unrecognised color. Try #3498db.');
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

const hex = (n) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();

tk.transform({
  watch: input,
  output: document.querySelector('#color-output'),
  status: document.querySelector('#color-status'),
  fn: () => {
    const color = parse(input.value);
    if (!color) return '';
    const { r, g, b, a } = color;
    const hsl = rgbToHsl(color);
    const cmyk = rgbToCmyk(color);
    return [
      `HEX:   #${hex(r)}${hex(g)}${hex(b)}`,
      `RGB:   rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
      `RGBA:  rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`,
      `HSL:   hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      `CMYK:  cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    ].join('\n');
  },
});
