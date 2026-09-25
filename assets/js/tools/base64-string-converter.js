// Base64 text converter — uses the UTF-8 safe helpers from toolkit.js.
const { tk } = window;

const text = document.querySelector('#b64enc-input');
const encoded = document.querySelector('#b64enc-output');
const encodeUrlSafe = document.querySelector('#b64-encode-urlsafe');

const b64Input = document.querySelector('#b64dec-input');
const decoded = document.querySelector('#b64dec-output');
const decodeUrlSafe = document.querySelector('#b64-decode-urlsafe');

tk.transform({
  watch: [text, encodeUrlSafe],
  output: encoded,
  fn: () => (text.value === '' ? '' : tk.b64encode(text.value, { urlSafe: encodeUrlSafe.checked })),
});

tk.transform({
  watch: [b64Input, decodeUrlSafe],
  output: decoded,
  status: document.querySelector('#b64dec-status'),
  ok: 'Valid Base64',
  fn: () => (b64Input.value.trim() === '' ? '' : tk.b64decode(b64Input.value, { urlSafe: decodeUrlSafe.checked })),
});
