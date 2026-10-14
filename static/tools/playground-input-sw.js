// A local stdin bridge for synchronous runtimes. No caching, storage or proxying.
const inputPath = new URL('./__playground_input__/', self.location.href).pathname;
const sessions = new Map();
const response = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const validToken = (token) => typeof token === 'string' && /^[a-f0-9-]{36}$/.test(token);
const validId = (id) => Number.isInteger(id) && id > 0 && id <= 99999;
function close(token) {
  const session = sessions.get(token);
  if (!session) return;
  clearTimeout(session.expiry);
  if (session.pending) {
    clearTimeout(session.pending.timeout);
    session.pending.resolve(response({ error: 'Input session closed. Run again.' }, 410));
  }
  sessions.delete(token);
}
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !validToken(data.token) || !event.source?.id) return;
  if (data.type === 'open') {
    if (sessions.has(data.token) || sessions.size >= 32) {
      event.ports[0]?.postMessage({ ok: false });
      return;
    }
    sessions.set(data.token, {
      owner: event.source.id, pending: null, answer: null, lastId: 0,
      expiry: setTimeout(() => close(data.token), 300000),
    });
    event.ports[0]?.postMessage({ ok: true });
    return;
  }
  const session = sessions.get(data.token);
  if (!session || session.owner !== event.source.id) return;
  if (data.type === 'close') { close(data.token); return; }
  if (data.type !== 'input' || !validId(data.id) || data.id <= session.lastId) return;
  if (data.value !== null && (typeof data.value !== 'string' || new TextEncoder().encode(data.value).length > 65536)) return;
  clearTimeout(session.expiry);
  session.expiry = setTimeout(() => close(data.token), 300000);
  if (session.pending?.id === data.id) {
    clearTimeout(session.pending.timeout);
    session.lastId = data.id;
    session.pending.resolve(response({ value: data.value }));
    session.pending = null;
  } else if (!session.pending && !session.answer) {
    // The page can answer before the worker's local request reaches this handler.
    session.answer = { id: data.id, value: data.value };
  }
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(inputPath)) return;
  // Reserved requests never fall through to the server, including invalid sessions.
  const match = url.pathname.slice(inputPath.length).match(/^([a-f0-9-]{36})\/([1-9]\d{0,4})$/);
  if (!match || event.request.method !== 'GET' || url.search) {
    event.respondWith(response({ error: 'Invalid input request.' }, 400));
    return;
  }
  const [, token, rawId] = match;
  const id = Number(rawId);
  const session = sessions.get(token);
  if (!session || id <= session.lastId || session.pending) {
    event.respondWith(response({ error: 'Input session unavailable. Run again or use prepared input.' }, 409));
    return;
  }
  clearTimeout(session.expiry);
  session.expiry = setTimeout(() => close(token), 300000);
  if (session.answer?.id === id) {
    session.lastId = id;
    event.respondWith(response({ value: session.answer.value }));
    session.answer = null;
    return;
  }
  event.respondWith(new Promise((resolve) => {
    session.pending = {
      id, resolve,
      timeout: setTimeout(() => close(token), 120000),
    };
  }));
});
