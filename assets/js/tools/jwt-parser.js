// Decode a JWT and show its header, payload and signature. No verification.
const { tk } = window;

const input = document.querySelector('#jwt-input');
const header = document.querySelector('#jwt-header');
const payload = document.querySelector('#jwt-payload');
const signature = document.querySelector('#jwt-signature');
const status = document.querySelector('#jwt-status');

function decodePart(part) {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const text = tk.b64decode(padded);
  return JSON.parse(text);
}

function withDates(payload_) {
  const clone = { ...payload_ };
  for (const key of ['exp', 'iat', 'nbf']) {
    if (typeof clone[key] === 'number') {
      clone[`${key} (readable)`] = new Date(clone[key] * 1000).toISOString();
    }
  }
  return clone;
}

tk.transform({
  watch: input,
  status,
  fn: () => {
    const token = input.value.trim();
    if (token === '') {
      header.textContent = '';
      payload.textContent = '';
      signature.textContent = '';
      return '';
    }
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('A JWT needs at least two dot-separated parts');
    header.textContent = JSON.stringify(decodePart(parts[0]), null, 2);
    const body = withDates(decodePart(parts[1]));
    payload.textContent = JSON.stringify(body, null, 2);
    signature.textContent = parts[2] || '(none)';

    const now = Math.floor(Date.now() / 1000);
    if (typeof body.exp === 'number') {
      return body.exp < now ? 'Token is expired' : `Expires ${new Date(body.exp * 1000).toLocaleString()}`;
    }
    return 'Decoded (signature not verified)';
  },
});
