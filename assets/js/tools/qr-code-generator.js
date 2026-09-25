// Generate a QR code and download it as PNG or SVG.
import QRCode from '../vendor/qrcode.js';
const { tk } = window;

const text = document.querySelector('#qr-text');
const size = document.querySelector('#qr-size');
const margin = document.querySelector('#qr-margin');
const ecc = document.querySelector('#qr-ecc');
const fg = document.querySelector('#qr-fg');
const bg = document.querySelector('#qr-bg');
const preview = document.querySelector('#qr-preview');
const status = document.querySelector('#qr-status');

function options() {
  return {
    errorCorrectionLevel: ecc.value,
    margin: Math.max(0, Math.min(10, Number(margin.value) || 0)),
    width: Math.max(64, Math.min(1024, Number(size.value) || 256)),
    color: { dark: fg.value || '#000000', light: bg.value || '#ffffff' },
  };
}

let currentSvg = '';

async function render() {
  const value = text.value.trim();
  if (value === '') { preview.replaceChildren(); currentSvg = ''; tk.setStatus(status, ''); return; }
  try {
    currentSvg = await QRCode.toString(value, { ...options(), type: 'svg' });
    preview.innerHTML = currentSvg;
    tk.setStatus(status, 'Ready', 'ok');
  } catch (error) {
    preview.replaceChildren();
    currentSvg = '';
    tk.setStatus(status, 'Could not build the QR code — try a shorter value.', 'err');
  }
}

document.querySelector('#qr-png').addEventListener('click', async () => {
  const value = text.value.trim();
  if (value === '') { tk.setStatus(status, 'Enter some text first', 'err'); return; }
  try {
    const url = await QRCode.toDataURL(value, { ...options(), type: 'image/png' });
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-code.png';
    a.click();
    tk.setStatus(status, 'PNG downloaded', 'ok');
  } catch (error) {
    tk.setStatus(status, 'Could not build the PNG here — the SVG download works everywhere.', 'err');
  }
});

document.querySelector('#qr-svg').addEventListener('click', () => {
  if (!currentSvg) { tk.setStatus(status, 'Nothing to download yet', 'err'); return; }
  tk.download('qr-code.svg', currentSvg, 'image/svg+xml');
  tk.setStatus(status, 'SVG downloaded', 'ok');
});

tk.live([text, size, margin, ecc, fg, bg], render);
