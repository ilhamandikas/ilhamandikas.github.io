const { tk } = window;

const url = document.querySelector('#cors-url');
const method = document.querySelector('#cors-method');
const origin = document.querySelector('#cors-origin');
const reqHeaders = document.querySelector('#cors-req-headers');
const status = document.querySelector('#cors-status');
const result = document.querySelector('#cors-result');

origin.value = location.origin;

function row(label, value) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = label;
  dd.textContent = value || '—';
  wrap.append(dt, dd);
  return wrap;
}

function headerList(text) {
  return String(text).split(',').map((x) => x.trim()).filter(Boolean).join(', ');
}

function targetUrl() {
  const value = url.value.trim();
  if (!value) throw new Error('Type a URL first');
  const parsed = new URL(value);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only http and https URLs can be checked');
  return parsed.href;
}

function show(rows) {
  result.replaceChildren(...rows.map(([a, b]) => row(a, b)));
}

async function check() {
  let target;
  try {
    target = targetUrl();
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
    return;
  }

  result.replaceChildren();
  tk.setStatus(status, 'Checking…');
  const rows = [['Page origin', location.origin], ['Requested origin', origin.value.trim() || location.origin]];

  try {
    const response = await fetch(target, { method: method.value, mode: 'cors', cache: 'no-store' });
    rows.push(['Simple request', `Allowed · HTTP ${response.status}`]);
    rows.push(['Readable response headers', [...response.headers].map(([k, v]) => `${k}: ${v}`).join('\n') || 'Only safelisted headers are visible']);
    tk.setStatus(status, 'CORS allowed this browser request', response.ok ? 'ok' : '');
  } catch (error) {
    rows.push(['Simple request', 'Blocked by CORS, network, DNS, TLS, or server refusal']);
    rows.push(['Browser detail', error.message]);
    tk.setStatus(status, 'The browser could not read the response', 'err');
  }

  try {
    const preflightHeaders = new Headers();
    preflightHeaders.set('Access-Control-Request-Method', method.value);
    const requested = headerList(reqHeaders.value);
    if (requested) preflightHeaders.set('Access-Control-Request-Headers', requested);
    const preflight = await fetch(target, { method: 'OPTIONS', headers: preflightHeaders, mode: 'cors', cache: 'no-store' });
    rows.push(['OPTIONS probe', `Readable · HTTP ${preflight.status}`]);
    rows.push(['Allowed origin', preflight.headers.get('access-control-allow-origin') || 'Not visible']);
    rows.push(['Allowed methods', preflight.headers.get('access-control-allow-methods') || 'Not visible']);
    rows.push(['Allowed headers', preflight.headers.get('access-control-allow-headers') || 'Not visible']);
    rows.push(['Credentials', preflight.headers.get('access-control-allow-credentials') || 'Not visible']);
  } catch (error) {
    rows.push(['OPTIONS probe', 'Not readable from this browser']);
  }

  show(rows);
}

document.querySelector('#cors-check').addEventListener('click', check);
