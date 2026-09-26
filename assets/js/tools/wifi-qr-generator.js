// Build a Wi-Fi join QR code. The drawing lives in ../qr.js, shared with the QR
// Code Generator and the QR Editor.
import * as qr from '../qr.js';
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

const options = () => ({ ecc: 'M', margin: 2, size: Number(size.value) || 320 });

let currentSvg = null;

function render() {
  const value = build();
  payload.value = value;
  if (ssid.value.trim() === '') {
    preview.replaceChildren();
    currentSvg = null;
    tk.setStatus(status, 'Enter a network name');
    return;
  }
  try {
    currentSvg = qr.renderSvg(value, options());
    preview.replaceChildren(currentSvg);
    tk.setStatus(status, '');
  } catch (error) {
    preview.replaceChildren();
    currentSvg = null;
    tk.setStatus(status, 'Could not build the QR code — try a shorter network name or password.', 'err');
  }
}

document.querySelector('#wqr-png').addEventListener('click', async () => {
  if (ssid.value.trim() === '') {
    tk.setStatus(status, 'Enter a network name first', 'err');
    return;
  }
  try {
    const canvas = await qr.renderCanvas(build(), options());
    const a = document.createElement('a');
    a.href = qr.canvasToPng(canvas);
    a.download = 'wifi-qr.png';
    a.click();
    tk.setStatus(status, 'PNG downloaded', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

document.querySelector('#wqr-svg').addEventListener('click', () => {
  if (!currentSvg) {
    tk.setStatus(status, 'Nothing to download yet', 'err');
    return;
  }
  tk.download('wifi-qr.svg', qr.svgToString(currentSvg), 'image/svg+xml');
  tk.setStatus(status, 'SVG downloaded', 'ok');
});

tk.live([ssid, pass, type, hidden, size], render);
