// JWT Token Editor — take a token apart, edit the claims, sign it again.
//
// The parser next door reads tokens; this one writes them. Only the mechanism is
// shared (../jws.js); what to trust and what to refuse is different in each tool.
import { ALGORITHMS, b64url, sign } from '../jws.js';

const { tk } = window;

const headerField = document.querySelector('#jwe-header');
const payloadField = document.querySelector('#jwe-payload');
const algSelect = document.querySelector('#jwe-alg');
const keyInput = document.querySelector('#jwe-key');
const keyLabel = document.querySelector('#jwe-key-label');
const keyRow = document.querySelector('#jwe-key-row');
const secretRow = document.querySelector('#jwe-secret-b64-row');
const secretB64 = document.querySelector('#jwe-secret-b64');
const output = document.querySelector('#jwe-output');
const note = document.querySelector('#jwe-note');
const status = document.querySelector('#jwe-status');

const known = (alg) => Object.prototype.hasOwnProperty.call(ALGORITHMS, alg);

function parseObject(text, what) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(`The ${what} is not valid JSON`);
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`The ${what} has to be a JSON object`);
  }
  return value;
}

// A starter payload and header rather than two empty boxes, and a real timestamp
// so a token signed straight away carries an honest "issued at".
headerField.value = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
payloadField.value = JSON.stringify({ sub: 'user_42', role: 'admin', iat: Math.floor(Date.now() / 1000) }, null, 2);

function syncKey() {
  const alg = algSelect.value;
  const hmac = alg.startsWith('HS');
  keyRow.hidden = alg === 'none';
  secretRow.hidden = !hmac;
  keyLabel.textContent = hmac ? 'Shared secret' : 'Private key (PEM)';
  keyInput.rows = hmac ? 3 : 9;
  keyInput.placeholder = hmac ? 'a long random string' : '-----BEGIN PRIVATE KEY-----';
}

algSelect.addEventListener('change', () => {
  syncKey();
  // The select is what the signature will actually use, so the header has to
  // agree with it. Leaving a stale alg in the header is how "signed with HS256,
  // labelled RS256" tokens get made by accident.
  try {
    const header = parseObject(headerField.value, 'header');
    header.alg = algSelect.value;
    headerField.value = JSON.stringify(header, null, 2);
  } catch {
    // An unparseable header is the sign button's problem to report, not this one's.
  }
});

document.querySelector('#jwe-sign').addEventListener('click', async () => {
  const alg = algSelect.value;
  try {
    const header = parseObject(headerField.value, 'header');
    const payload = parseObject(payloadField.value, 'payload');
    header.alg = alg;

    const signed = `${b64url(new TextEncoder().encode(JSON.stringify(header)))}.${b64url(new TextEncoder().encode(JSON.stringify(payload)))}`;

    let signature = new Uint8Array(0);
    if (alg !== 'none') {
      if (!known(alg)) throw new Error(`${alg} is not one this page can sign`);
      signature = await sign(ALGORITHMS[alg], keyInput.value, new TextEncoder().encode(signed), { secretIsBase64: secretB64.checked });
    }

    output.value = `${signed}.${b64url(signature)}`;
    headerField.value = JSON.stringify(header, null, 2);
    note.textContent = alg === 'none' ? 'unsigned' : `${signature.length * 8}-bit signature`;
    tk.setStatus(
      status,
      alg === 'none'
        ? 'Written with no signature at all — that is what alg "none" means, and a verifier should refuse it'
        : `${alg} signature written`,
      alg === 'none' ? 'err' : 'ok',
    );
  } catch (error) {
    output.value = '';
    note.textContent = '';
    tk.setStatus(status, error.message, 'err');
  }
});

syncKey();
