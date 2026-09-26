// Webhook tester: sign, verify and send a test webhook, all in the browser.
const { tk } = window;

const els = {
  provider: document.querySelector('#wh-provider'),
  secret: document.querySelector('#wh-secret'),
  timestamp: document.querySelector('#wh-timestamp'),
  refresh: document.querySelector('#wh-refresh'),
  payload: document.querySelector('#wh-payload'),
  status: document.querySelector('#wh-status'),
  header: document.querySelector('#wh-header'),
  headerValue: document.querySelector('#wh-header-value'),
  signature: document.querySelector('#wh-signature'),
  verify: document.querySelector('#wh-verify'),
  verdict: document.querySelector('#wh-verdict'),
  url: document.querySelector('#wh-url'),
  send: document.querySelector('#wh-send'),
  sendStatus: document.querySelector('#wh-send-status'),
  response: document.querySelector('#wh-response'),
};

// Each provider signs a slightly different string and wraps the result in its
// own header format. `parse` is the inverse, used when checking a received one.
const PROVIDERS = {
  stripe: {
    label: 'Stripe',
    header: 'Stripe-Signature',
    encoding: 'hex',
    signed: (ts, payload) => `${ts}.${payload}`,
    format: (ts, sig) => `t=${ts},v1=${sig}`,
    parse: (value) => {
      const t = /(?:^|,)\s*t=([^,]+)/.exec(value);
      const v1 = /(?:^|,)\s*v1=([^,]+)/.exec(value);
      return v1 ? { signature: v1[1].trim(), timestamp: t ? t[1].trim() : '' } : null;
    },
  },
  github: {
    label: 'GitHub',
    header: 'X-Hub-Signature-256',
    encoding: 'hex',
    signed: (ts, payload) => payload,
    format: (ts, sig) => `sha256=${sig}`,
    parse: (value) => {
      const match = /sha256=([0-9a-f]+)/i.exec(value);
      return match ? { signature: match[1].toLowerCase(), timestamp: '' } : null;
    },
  },
  shopify: {
    label: 'Shopify',
    header: 'X-Shopify-Hmac-Sha256',
    encoding: 'base64',
    signed: (ts, payload) => payload,
    format: (ts, sig) => sig,
    parse: (value) => (value.trim() ? { signature: value.trim(), timestamp: '' } : null),
  },
  generic: {
    label: 'Generic HMAC-SHA256',
    header: 'X-Signature',
    encoding: 'hex',
    signed: (ts, payload) => payload,
    format: (ts, sig) => sig,
    parse: (value) => (value.trim() ? { signature: value.trim(), timestamp: '' } : null),
  },
};

async function hmac(secret, message, encoding) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const buffer = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const bytes = new Uint8Array(buffer);
  if (encoding === 'base64') {
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

let token = 0;

async function refresh() {
  const mine = ++token;
  const provider = PROVIDERS[els.provider.value];
  const payload = els.payload.value;
  if (!payload.trim()) {
    els.header.textContent = '—';
    els.headerValue.value = '';
    els.signature.value = '';
    tk.setStatus(els.status, '');
    tk.setStatus(els.verdict, '');
    return;
  }
  const ts = els.timestamp.value.trim() || String(Math.floor(Date.now() / 1000));
  const signature = await hmac(els.secret.value, provider.signed(ts, payload), provider.encoding);
  if (mine !== token) return;
  els.header.textContent = provider.header;
  els.signature.value = signature;
  els.headerValue.value = provider.format(ts, signature);
  tk.setStatus(els.status, `${provider.label} signature ready.`, 'ok');
  await verify(mine);
}

async function verify(mine = ++token) {
  const provider = PROVIDERS[els.provider.value];
  const received = els.verify.value.trim();
  if (!received) {
    tk.setStatus(els.verdict, '');
    return;
  }
  const parsed = provider.parse(received);
  if (!parsed) {
    tk.setStatus(els.verdict, 'Could not read a signature from that header.', 'err');
    return;
  }
  const ts = parsed.timestamp || els.timestamp.value.trim();
  const expected = await hmac(els.secret.value, provider.signed(ts, els.payload.value), provider.encoding);
  if (mine !== token) return;
  const ok = same(expected, parsed.signature);
  tk.setStatus(els.verdict, ok ? 'Signature is valid.' : 'Signature does not match.', ok ? 'ok' : 'err');
}

async function send() {
  const url = els.url.value.trim();
  if (!url) {
    tk.setStatus(els.sendStatus, 'Enter a target URL first.', 'err');
    return;
  }
  const provider = PROVIDERS[els.provider.value];
  const headers = { 'Content-Type': 'application/json' };
  if (els.headerValue.value) headers[provider.header] = els.headerValue.value;
  const started = Date.now();
  try {
    const response = await fetch(url, { method: 'POST', headers, body: els.payload.value });
    const text = await response.text();
    const ms = Date.now() - started;
    els.response.value = `HTTP ${response.status} ${response.statusText} · ${ms} ms\n\n${text}`;
    tk.setStatus(els.sendStatus, `Request completed in ${ms} ms.`, 'ok');
  } catch (error) {
    els.response.value = '';
    tk.setStatus(els.sendStatus, `Request failed: ${error.message}. This is usually CORS — the target must allow this origin.`, 'err');
  }
}

els.timestamp.value = String(Math.floor(Date.now() / 1000));
els.refresh.addEventListener('click', () => {
  els.timestamp.value = String(Math.floor(Date.now() / 1000));
  refresh();
});
els.send.addEventListener('click', send);
els.verify.addEventListener('input', () => verify());
tk.live([els.provider, els.secret, els.timestamp, els.payload], refresh);
