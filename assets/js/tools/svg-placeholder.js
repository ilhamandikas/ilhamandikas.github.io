// Generate a simple SVG placeholder image.
const { tk } = window;

const fields = {
  w: document.querySelector('#svg-w'),
  h: document.querySelector('#svg-h'),
  bg: document.querySelector('#svg-bg'),
  fg: document.querySelector('#svg-fg'),
  text: document.querySelector('#svg-text'),
};
const preview = document.querySelector('#svg-preview');
const output = document.querySelector('#svg-output');

const escapeXml = (value) => value.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

function render() {
  const w = Math.max(16, Math.min(4000, Number(fields.w.value) || 600));
  const h = Math.max(16, Math.min(4000, Number(fields.h.value) || 400));
  const label = fields.text.value || `${w} × ${h}`;
  const fontSize = Math.max(12, Math.round(Math.min(w, h) / 8));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(label)}">\n` +
    `  <rect width="100%" height="100%" fill="${escapeXml(fields.bg.value)}"/>\n` +
    `  <text x="50%" y="50%" fill="${escapeXml(fields.fg.value)}" font-family="system-ui, sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>\n` +
    '</svg>';

  preview.innerHTML = svg;
  output.value = svg;
}

tk.live(Object.values(fields), render);
