// Build a Wi-Fi join QR code.
import QRCode from '../vendor/qrcode.js';
const { tk } = window;

const ssid = document.querySelector('#wqr-ssid');
const pass = document.querySelector('#wqr-pass');
const type = document.querySelector('#wqr-type');
const hidden = document.querySelector('#wqr-hidden');
const size = document.querySelector('#wqr-size');
const preview = document.querySelector('#wqr-preview');
const payload = document.querySelector('#wqr-payload');
const status = document.querySelector('#wqr-status');

// Escape the characters that are special inside a WIFI: payload.
const esc = (value) => value.replace(/([\\;,:"])/g, '\\$1');

function build() {
  const parts = [`T:${type.value}`, `S:${esc(ssid.value)}`];
  if (type.value !== 'nopass') parts.push(`P:${esc(pass.value)}`);
  if (hidden.checked) parts.push('H:true');
  return `WIFI:${parts.join(';')};;`;
}

let currentSvg = '';

async function render() {
  const value = build();
  payload.value = value;
  if (ssid.value.trim() === '') { preview.replaceChildren(); currentSvg = ''; tk.setStatus(status, 'Enter a network name'); return; }
  try {
    const opts = { errorCorrectionLevel: 'M', margin: 2, width: Math.max(128, Math.min(1024, Number(size.value) || 320)) };
    currentSvg = await QRCode.toString(value, { ...opts, type: 'svg' });
    preview.innerHTML = currentSvg;
    tk.setStatus(status, 'Ready', 'ok');
  } catch (error) {
    preview.replaceChildren();
    currentSvg = '';
    tk.setStatus(status, 'Could not build the QR code — try a shorter network name or password.', 'err');
  }
}

document.querySelector('#wqr-png').addEventListener('click', async () => {
  if (ssid.value.trim() === '') { tk.setStatus(status, 'Enter a network name first', 'err'); return; }
  try {
    const url = await QRCode.toDataURL(build(), { width: Math.max(128, Math.min(1024, Number(size.value) || 320)), margin: 2 });
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wifi-qr.png';
    a.click();
    tk.setStatus(status, 'PNG downloaded', 'ok');
  } catch (error) {
    tk.setStatus(status, 'Could not build the PNG here — the SVG download works everywhere.', 'err');
  }
});

document.querySelector('#wqr-svg').addEventListener('click', () => {
  if (!currentSvg) { tk.setStatus(status, 'Nothing to download yet', 'err'); return; }
  tk.download('wifi-qr.svg', currentSvg, 'image/svg+xml');
  tk.setStatus(status, 'SVG downloaded', 'ok');
});

tk.live([ssid, pass, type, hidden, size], render);
