const { tk } = window;
const url = document.querySelector('#grpc-url');
const method = document.querySelector('#grpc-method');
const headers = document.querySelector('#grpc-headers');
const body = document.querySelector('#grpc-body');
const mode = document.querySelector('#grpc-mode');
const output = document.querySelector('#grpc-output');
const status = document.querySelector('#grpc-status');
const quote = (v) => (/^[A-Za-z0-9._:/@%+=?&-]+$/.test(v) ? v : `'${String(v).replace(/'/g, "'\\''")}'`);
function headerLines() { return headers.value.split('\n').map((x) => x.trim()).filter(Boolean); }
function grpcurl() {
  const target = url.value.trim().replace(/^https?:\/\//, '');
  if (!target || !method.value.trim()) throw new Error('Endpoint and method are required');
  const lines = ['grpcurl'];
  for (const h of headerLines()) lines.push(`  -H ${quote(h)}`);
  if (body.value.trim()) lines.push(`  -d ${quote(body.value.trim())}`);
  lines.push(`  ${quote(target)} ${quote(method.value.trim())}`);
  return lines.join(' \\\n');
}
function frame(bytes) {
  const out = new Uint8Array(bytes.length + 5);
  out[0] = 0;
  new DataView(out.buffer).setUint32(1, bytes.length);
  out.set(bytes, 5);
  return out;
}
function parseHeaders() {
  const h = new Headers();
  for (const line of headerLines()) {
    const at = line.indexOf(':');
    if (at > 0) h.set(line.slice(0, at).trim(), line.slice(at + 1).trim());
  }
  return h;
}
async function run() {
  try {
    const m = mode.value;
    if (m === 'command') { output.value = grpcurl(); tk.setStatus(status, 'grpcurl command built', 'ok'); return; }
    const endpoint = `${url.value.replace(/\/$/, '')}/${method.value.replace(/^\//, '')}`;
    const h = parseHeaders();
    h.set('x-grpc-web', '1');
    h.set('content-type', m === 'web-json' ? 'application/grpc-web-text+json' : 'application/grpc-web+proto');
    let bytes;
    if (m === 'web-json') bytes = new TextEncoder().encode(body.value.trim() || '{}');
    else bytes = Uint8Array.from(atob(body.value.trim()), (c) => c.charCodeAt(0));
    const res = await fetch(endpoint, { method: 'POST', headers: h, body: frame(bytes) });
    const buf = new Uint8Array(await res.arrayBuffer());
    output.value = `HTTP ${res.status} ${res.statusText}\n` + [...res.headers].map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\n${btoa(String.fromCharCode(...buf))}`;
    tk.setStatus(status, res.ok ? 'Response received' : 'Server returned an error', res.ok ? 'ok' : 'err');
  } catch (e) { tk.setStatus(status, e.message, 'err'); }
}
document.querySelector('#grpc-run').addEventListener('click', run);
tk.live([url, method, headers, body, mode], () => { if (mode.value === 'command') { try { output.value = grpcurl(); } catch {} } });
