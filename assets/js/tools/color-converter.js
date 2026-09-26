// Color converter — the browser parses the input, we present every format.
const { tk } = window;

const input = document.querySelector('#color-input');

function parse(text) {
  const value = text.trim();
  if (value === '') return null;
  const probe = document.createElement('span');
  probe.style.color = '';
  probe.style.color = value;
  if (!probe.style.color) throw new Error('Unrecognised color');
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  const match = computed.match(/rgba?\(([^)]+)\)/);
  if (!match) throw new Error('Unrecognised color');
  const parts = match[1].split(',').map((p) => parseFloat(p));
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
