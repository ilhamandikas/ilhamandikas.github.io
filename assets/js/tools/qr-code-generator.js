// Generate a QR code, optionally with a logo in the middle, and download it as
// PNG or SVG. The drawing itself lives in ../qr.js.
import * as qr from '../qr.js';
const { tk } = window;

const text = document.querySelector('#qr-text');
const size = document.querySelector('#qr-size');
const margin = document.querySelector('#qr-margin');
const ecc = document.querySelector('#qr-ecc');
const fg = document.querySelector('#qr-fg');
const bg = document.querySelector('#qr-bg');
const logoInput = document.querySelector('#qr-logo');
const logoSize = document.querySelector('#qr-logo-size');
const logoStatus = document.querySelector('#qr-logo-status');
const hint = document.querySelector('#qr-logo-hint');
const preview = document.querySelector('#qr-preview');
const status = document.querySelector('#qr-status');

let logo = null;
let currentSvg = null;

// 16% is the measured limit for the M level this page defaults to, so a logo
// added without touching anything else still scans.
const logoRatio = () => Math.min(0.4, Math.max(0.08, (Number(logoSize.value) || 16) / 100));

function options() {
  return {
    ecc: ecc.value,
    size: Number(size.value) || 256,
    margin: Number(margin.value) || 0,
    dark: fg.value || '#0f172a',
    light: bg.value || '#ffffff',
    logo: logo ? { src: logo.src, ratio: logoRatio(), background: '#ffffff' } : null,
  };
}

// Say out loud how much of the code the logo eats and whether the measured limit
// for this level leaves room for it. A silent "it still scans" claim would be a
// guess, and the honest limit is much lower than the error-correction percentage.
function updateHint() {
  if (!logo) {
    hint.textContent =
      'A logo sits in the middle and hides part of the code. Error correction is applied per block, not across the whole code, so a logo costs more than you would expect: H stayed scannable up to a 24% wide logo in testing, M only to 16%.';
    return;
  }
  const { coverage, limit, safe } = qr.logoCheck(logoRatio(), ecc.value);
  hint.textContent = safe
    ? `This logo covers about ${coverage.toFixed(1)}% of the code. Against a real decoder, ${ecc.value} stayed scannable up to a ${(limit * 100).toFixed(0)}% wide logo — this is inside that.`
    : `This logo covers about ${coverage.toFixed(1)}% of the code. Against a real decoder, ${ecc.value} only stayed scannable up to a ${(limit * 100).toFixed(0)}% wide logo, so this one may not scan. Shrink the logo or raise the error correction level.`;
}

function render() {
  updateHint();
  const value = text.value.trim();
  if (value === '') {
    preview.replaceChildren();
    currentSvg = null;
    tk.setStatus(status, '');
    return;
  }
  try {
    currentSvg = qr.renderSvg(value, options());
    preview.replaceChildren(currentSvg);
    tk.setStatus(status, '');
  } catch (error) {
    preview.replaceChildren();
    currentSvg = null;
    tk.setStatus(status, 'Could not build the QR code — try a shorter value.', 'err');
  }
}

logoInput.addEventListener('change', async (event) => {
  try {
    logo = await qr.readLogo(event.target.files[0]);
    tk.setStatus(logoStatus, `${logo.name} added`, 'ok');
  } catch (error) {
    logo = null;
    tk.setStatus(logoStatus, error.message, 'err');
  }
  render();
});

document.querySelector('#qr-logo-clear').addEventListener('click', () => {
  logo = null;
  logoInput.value = '';
  tk.setStatus(logoStatus, '');
  render();
});

document.querySelector('#qr-png').addEventListener('click', async () => {
  const value = text.value.trim();
  if (value === '') {
    tk.setStatus(status, 'Enter some text first', 'err');
    return;
  }
  try {
    const canvas = await qr.renderCanvas(value, options());
    const a = document.createElement('a');
    a.href = qr.canvasToPng(canvas);
    a.download = 'qr-code.png';
    a.click();
    tk.setStatus(status, 'PNG downloaded', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

document.querySelector('#qr-svg').addEventListener('click', () => {
  if (!currentSvg) {
    tk.setStatus(status, 'Nothing to download yet', 'err');
    return;
  }
  tk.download('qr-code.svg', qr.svgToString(currentSvg), 'image/svg+xml');
  tk.setStatus(status, 'SVG downloaded', 'ok');
});

tk.live([text, size, margin, ecc, fg, bg, logoSize], render);
