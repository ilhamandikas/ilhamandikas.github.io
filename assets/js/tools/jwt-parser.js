import { ALGORITHMS, b64url, decodePart, unb64url, verify } from '../jws.js';

const { tk } = window;

const input = document.querySelector('#jwt-input');
const header = document.querySelector('#jwt-header');
const payload = document.querySelector('#jwt-payload');
const signature = document.querySelector('#jwt-signature');
const status = document.querySelector('#jwt-status');
const headerEdit = document.querySelector('#jwt-header-edit');
const payloadEdit = document.querySelector('#jwt-payload-edit');

const keyInput = document.querySelector('#jwt-key');
const verifyStatus = document.querySelector('#jwt-verify-status');

const encodeJson = (value) => b64url(new TextEncoder().encode(JSON.stringify(value)));
let editing = null;
let rewriting = false;

function withDates(claims) {
  const clone = { ...claims };
  for (const key of ['exp', 'iat', 'nbf']) {
    if (typeof clone[key] === 'number') {
      clone[`${key} (readable)`] = new Date(clone[key] * 1000).toISOString();
    }
  }
  return clone;
}

function syncEditors(headerObject, payloadObject) {
  if (editing !== 'header') headerEdit.value = JSON.stringify(headerObject, null, 2);
  if (editing !== 'payload') payloadEdit.value = JSON.stringify(payloadObject, null, 2);
}

function setEditor(which, open) {
  const isHeader = which === 'header';
  const pre = isHeader ? header : payload;
  const edit = isHeader ? headerEdit : payloadEdit;
  editing = open ? which : null;
  pre.hidden = open;
  edit.hidden = !open;
  if (open) edit.focus();
}

function rewriteTokenFromEditor(which) {
  if (rewriting) return;
  const edit = which === 'header' ? headerEdit : payloadEdit;
  const token = input.value.trim();
  const parts = token.split('.');
  if (parts.length < 2) return;
  try {
    const parsed = JSON.parse(edit.value);
    parts[which === 'header' ? 0 : 1] = encodeJson(parsed);
    rewriting = true;
    input.value = parts.join('.');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    rewriting = false;
    tk.setStatus(status, which === 'payload' ? 'Payload edited — token updated. Existing signature may no longer match.' : 'Header edited — token updated. Existing signature may no longer match.');
  } catch {
    tk.setStatus(status, `${which === 'header' ? 'Header' : 'Payload'} editor is not valid JSON yet`, 'err');
  }
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
    const headerObject = decodePart(parts[0]);
    const rawClaims = decodePart(parts[1]);
    header.textContent = JSON.stringify(headerObject, null, 2);
    const claims = withDates(rawClaims);
    payload.textContent = JSON.stringify(claims, null, 2);
    syncEditors(headerObject, rawClaims);
    signature.textContent = parts[2] || '(none)';

    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.exp === 'number') {
      return claims.exp < now ? 'Token is expired' : `Expires ${new Date(claims.exp * 1000).toLocaleString()}`;
    }
    return 'Decoded — the signature has not been checked';
  },
});

header.addEventListener('click', () => setEditor('header', true));
payload.addEventListener('click', () => setEditor('payload', true));
header.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') setEditor('header', true); });
payload.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') setEditor('payload', true); });
for (const button of document.querySelectorAll('[data-jwt-edit]')) {
  button.addEventListener('click', () => setEditor(button.dataset.jwtEdit, true));
}
headerEdit.addEventListener('input', () => rewriteTokenFromEditor('header'));
payloadEdit.addEventListener('input', () => rewriteTokenFromEditor('payload'));
headerEdit.addEventListener('blur', () => setEditor('header', false));
payloadEdit.addEventListener('blur', () => setEditor('payload', false));

document.querySelector('#jwt-verify').addEventListener('click', async () => {
  const token = input.value.trim();
  if (token === '') {
    tk.setStatus(verifyStatus, 'Paste a token first');
    return;
  }

  const parts = token.split('.');

  let alg;
  try {
    alg = decodePart(parts[0]).alg;
  } catch {
    tk.setStatus(verifyStatus, 'The header is not readable JSON', 'err');
    return;
  }

  if (alg === undefined || alg === null || String(alg).toLowerCase() === 'none') {
    tk.setStatus(verifyStatus, 'alg is "none" — the token is unsigned, so anyone could have written it', 'err');
    return;
  }

  if (parts.length !== 3 || parts[2] === '') {
    tk.setStatus(verifyStatus, 'This token has no signature to check', 'err');
    return;
  }

  const spec = Object.prototype.hasOwnProperty.call(ALGORITHMS, alg) ? ALGORITHMS[alg] : null;
  if (!spec) {
    tk.setStatus(verifyStatus, `This page cannot check ${alg} — it handles HS, RS, PS and ES`, 'err');
    return;
  }

  const wanted = spec.kind === 'hmac' ? 'secret' : 'public key';
  if (keyInput.value.trim() === '') {
    tk.setStatus(verifyStatus, `Paste the ${wanted} to check ${alg}`);
    return;
  }

  if (spec.kind === 'hmac' && /-----BEGIN [A-Z ]+-----/.test(keyInput.value)) {
    tk.setStatus(
      verifyStatus,
      `${alg} uses a shared secret, but that is a PEM key. This is the shape of the algorithm-confusion attack — check the algorithm you expect before pasting anything.`,
      'err',
    );
    return;
  }

  tk.setStatus(verifyStatus, 'Checking…');
  try {
    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const ok = await verify(spec, keyInput.value, unb64url(parts[2]), signed);
    tk.setStatus(
      verifyStatus,
      ok
        ? `${alg} signature is valid — this token was signed by the holder of that ${wanted}`
        : `${alg} signature does not match that ${wanted}`,
      ok ? 'ok' : 'err',
    );
  } catch (error) {
    tk.setStatus(verifyStatus, error.message, 'err');
  }
});
