import { ALGORITHMS, b64url, sign } from '../jws.js';

const { tk } = window;

const tokenField = document.querySelector('#jwe-token');
const editor = document.querySelector('#jwe-editor');
const outputPanel = document.querySelector('#jwe-output-panel');
const iatField = document.querySelector('#jwe-iat');
const nbfField = document.querySelector('#jwe-nbf');
const expField = document.querySelector('#jwe-exp');
const algSelect = document.querySelector('#jwe-alg');
const secretField = document.querySelector('#jwe-secret');
const payloadField = document.querySelector('#jwe-payload');
const output = document.querySelector('#jwe-out');
const status = document.querySelector('#jwe-status');

let header = null;
let payload = null;

function decode(text) {
  const parts = String(text).trim().split('.');
  if (parts.length < 2) throw new Error('That does not look like a JWT');
  return {
    header: JSON.parse(tk.b64decode(parts[0], { urlSafe: true })),
    payload: JSON.parse(tk.b64decode(parts[1], { urlSafe: true })),
  };
}

function toLocal(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '';
  const d = new Date(seconds * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocal(value) {
  if (!value) return undefined;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : undefined;
}

function applyClaim(key, field) {
  const seconds = fromLocal(field.value);
  if (seconds === undefined) delete payload[key];
  else payload[key] = seconds;
}

function paint() {
  payloadField.value = JSON.stringify(payload, null, 2);
  const parts = [];
  parts.push(b64url(new TextEncoder().encode(JSON.stringify(header))));
  parts.push(b64url(new TextEncoder().encode(JSON.stringify(payload))));
  return parts;
}

async function update() {
  if (!header) return;
  try {
    applyClaim('iat', iatField);
    applyClaim('nbf', nbfField);
    applyClaim('exp', expField);
    if (payloadField.value.trim()) {
      payload = JSON.parse(payloadField.value);
    }
    const [h, p] = paint();
    const alg = algSelect.value;
    if (alg === 'none') {
      output.value = `${h}.${p}.`;
      tk.setStatus(status, 'Signature removed', '');
    } else {
      const secret = secretField.value;
      if (!secret) {
        output.value = `${h}.${p}.`;
        tk.setStatus(status, 'Enter a secret to sign, or pick none', 'err');
        return;
      }
      const data = new TextEncoder().encode(`${h}.${p}`);
      const sig = await sign(ALGORITHMS[alg], secret, data);
      output.value = `${h}.${p}.${b64url(sig)}`;
      tk.setStatus(status, `Signed with ${alg}`, 'ok');
    }
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message || 'Could not update the token', 'err');
  }
}

function load() {
  if (!tokenField.value.trim()) {
    header = null;
    editor.hidden = true;
    outputPanel.hidden = true;
    tk.setStatus(status, '');
    return;
  }
  try {
    const decoded = decode(tokenField.value);
    header = decoded.header;
    payload = decoded.payload;
    editor.hidden = false;
    outputPanel.hidden = false;
    iatField.value = toLocal(payload.iat);
    nbfField.value = toLocal(payload.nbf);
    expField.value = toLocal(payload.exp);
    if (header.alg && ALGORITHMS[header.alg]) algSelect.value = header.alg;
    update();
  } catch (error) {
    header = null;
    editor.hidden = true;
    outputPanel.hidden = true;
    tk.setStatus(status, error.message, 'err');
  }
}

document.querySelectorAll('[data-jwe-shift]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const base = fromLocal(expField.value) ?? Math.floor(Date.now() / 1000);
    expField.value = toLocal(base + Number(btn.dataset.jweShift));
    update();
  });
});

tokenField.addEventListener('input', tk.debounce(load, 200));
[iatField, nbfField, expField, algSelect, secretField, payloadField].forEach((el) => {
  el.addEventListener('change', update);
  el.addEventListener('input', tk.debounce(update, 200));
});

load();
