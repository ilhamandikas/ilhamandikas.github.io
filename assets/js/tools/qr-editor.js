import jsQR from '../vendor/jsqr.js';
import * as qr from '../qr.js';
const { tk } = window;

const sourceInput = document.querySelector('#qre-source');
const sourceStatus = document.querySelector('#qre-source-status');
const contentPanel = document.querySelector('#qre-content-panel');
const text = document.querySelector('#qre-text');
const ecc = document.querySelector('#qre-ecc');
const size = document.querySelector('#qre-size');
const margin = document.querySelector('#qre-margin');
const shape = document.querySelector('#qre-shape');
const finder = document.querySelector('#qre-finder');
const dark = document.querySelector('#qre-dark');
const gradientOn = document.querySelector('#qre-gradient');
const dark2 = document.querySelector('#qre-dark2');
const angle = document.querySelector('#qre-angle');
const gradientRow = document.querySelector('#qre-gradient-row');
const light = document.querySelector('#qre-light');
const transparent = document.querySelector('#qre-transparent');
const lightRow = document.querySelector('#qre-light-row');
const logoInput = document.querySelector('#qre-logo');
const logoSize = document.querySelector('#qre-logo-size');
const logoPad = document.querySelector('#qre-logo-pad');
const logoRadius = document.querySelector('#qre-logo-radius');
const logoBg = document.querySelector('#qre-logo-bg');
const logoNoBox = document.querySelector('#qre-logo-nobox');
const logoStatus = document.querySelector('#qre-logo-status');
const hint = document.querySelector('#qre-hint');
const preview = document.querySelector('#qre-preview');
const meta = document.querySelector('#qre-meta');
const status = document.querySelector('#qre-status');

let logo = null;
let currentSvg = null;

const pct = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

function readImageData(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('Choose a QR image first')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image')); };
    img.src = url;
  });
}

async function decodeSource(file) {
  try {
    const image = await readImageData(file);
    const found = jsQR(image.data, image.width, image.height);
    if (!found || !found.data) throw new Error('No QR code found in that image');
    text.value = found.data;
    text.dispatchEvent(new Event('input', { bubbles: true }));
    contentPanel.hidden = false;
    tk.setStatus(sourceStatus, 'QR text extracted — edit it below', 'ok');
    render();
  } catch (error) {
    tk.setStatus(sourceStatus, error.message, 'err');
  }
}

function options() {
  return {
    ecc: ecc.value,
    size: Number(size.value) || 512,
    margin: Number(margin.value) || 0,
    dark: dark.value || '#0f172a',
    light: transparent.checked ? 'transparent' : light.value || '#ffffff',
    gradient: gradientOn.checked ? { from: dark.value || '#0f172a', to: dark2.value || '#0ea5e9', angle: pct(angle.value, 0) } : null,
    shape: shape.value,
    finder: finder.value,
    logo: logo
      ? {
          src: logo.src,
          ratio: pct(logoSize.value, 22) / 100,
          pad: pct(logoPad.value, 12) / 100,
          radius: pct(logoRadius.value, 25),
          background: logoNoBox.checked ? null : logoBg.value || '#ffffff',
        }
      : null,
  };
}

function updateHint() {
  if (!logo) {
    hint.textContent = 'A logo is optional. If you add one, H is the safe level — in testing it stayed scannable up to a 24% wide logo, where M managed only 16%.';
    return;
  }
  const { coverage, limit, safe } = qr.logoCheck(pct(logoSize.value, 22) / 100, ecc.value);
  hint.textContent = safe
    ? `This logo covers about ${coverage.toFixed(1)}% of the code. Against a real decoder, ${ecc.value} stayed scannable up to a ${(limit * 100).toFixed(0)}% wide logo — this is inside that.`
    : `This logo covers about ${coverage.toFixed(1)}% of the code. Against a real decoder, ${ecc.value} only stayed scannable up to a ${(limit * 100).toFixed(0)}% wide logo, so this one may not scan. Shrink the logo or raise the error correction level.`;
}

function syncVisibility() {
  gradientRow.hidden = !gradientOn.checked;
  lightRow.hidden = transparent.checked;
}

function render() {
  syncVisibility();
  updateHint();
  const value = text.value.trim();
  if (value === '') {
    preview.replaceChildren();
    currentSvg = null;
    meta.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  try {
    const { version, count } = qr.encode(value, options());
    currentSvg = qr.renderSvg(value, options());
    preview.replaceChildren(currentSvg);
    meta.textContent = `Version ${version} · ${count} × ${count} modules`;
    tk.setStatus(status, '');
  } catch (error) {
    preview.replaceChildren();
    currentSvg = null;
    meta.textContent = '';
    tk.setStatus(status, 'Could not build the QR code — try a shorter value.', 'err');
  }
}

sourceInput.addEventListener('change', (event) => decodeSource(event.target.files[0]));

document.querySelector('#qre-source-clear').addEventListener('click', () => {
  sourceInput.value = '';
  contentPanel.hidden = true;
  tk.setStatus(sourceStatus, '');
});

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

document.querySelector('#qre-logo-clear').addEventListener('click', () => {
  logo = null;
  logoInput.value = '';
  tk.setStatus(logoStatus, '');
  render();
});

const PRESETS = {
  classic: { shape: 'square', finder: 'square', dark: '#0f172a', gradient: false, light: '#ffffff', transparent: false },
  rounded: { shape: 'rounded', finder: 'rounded', dark: '#0f172a', gradient: false, light: '#ffffff', transparent: false },
  dots: { shape: 'dot', finder: 'dot', dark: '#111827', gradient: false, light: '#ffffff', transparent: false },
  sunset: { shape: 'rounded', finder: 'rounded', dark: '#7c2d12', dark2: '#f59e0b', angle: 135, gradient: true, light: '#fffbeb', transparent: false },
  ocean: { shape: 'rounded', finder: 'rounded', dark: '#1e3a8a', dark2: '#0ea5e9', angle: 120, gradient: true, light: '#ffffff', transparent: false },
  sticker: { shape: 'dot', finder: 'dot', dark: '#0f172a', gradient: false, light: '#ffffff', transparent: true },
};

for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => {
    const preset = PRESETS[button.getAttribute('data-preset')];
    if (!preset) return;
    shape.value = preset.shape;
    finder.value = preset.finder;
    dark.value = preset.dark;
    gradientOn.checked = Boolean(preset.gradient);
    dark2.value = preset.dark2 || '#0ea5e9';
    angle.value = preset.angle || 0;
    light.value = preset.light;
    transparent.checked = preset.transparent;
    render();
    tk.setStatus(status, `${button.textContent.trim()} preset applied`, 'ok');
  });
}

document.querySelector('#qre-png').addEventListener('click', async () => {
  if (text.value.trim() === '') {
    tk.setStatus(status, 'Enter some text first', 'err');
    return;
  }
  try {
    const canvas = await qr.renderCanvas(text.value.trim(), options());
    const a = document.createElement('a');
    a.href = qr.canvasToPng(canvas);
    a.download = 'qr-code.png';
    a.click();
    tk.setStatus(status, 'PNG downloaded', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

document.querySelector('#qre-svg').addEventListener('click', () => {
  if (!currentSvg) {
    tk.setStatus(status, 'Nothing to download yet', 'err');
    return;
  }
  tk.download('qr-code.svg', qr.svgToString(currentSvg), 'image/svg+xml');
  tk.setStatus(status, 'SVG downloaded', 'ok');
});

tk.live([text, ecc, size, margin, shape, finder, dark, gradientOn, dark2, angle, light, transparent, logoSize, logoPad, logoRadius, logoBg, logoNoBox], render);
