// WebSocket tester — open a socket from the page and watch what comes back.
//
// The connection is the browser's own WebSocket object, so there is no proxy in the
// middle and no account anywhere: what you see is exactly what the server sent.
// That also means the browser's rules are the rules. The one that surprises people
// is mixed content — a page served over https cannot open a plain ws:// socket, and
// the failure looks like a network error rather than a policy decision.
const { tk } = window;

const els = {
  url: document.querySelector('#ws-url'),
  protocol: document.querySelector('#ws-protocol'),
  connect: document.querySelector('#ws-connect'),
  disconnect: document.querySelector('#ws-disconnect'),
  status: document.querySelector('#ws-status'),
  message: document.querySelector('#ws-message'),
  send: document.querySelector('#ws-send'),
  clear: document.querySelector('#ws-clear'),
  log: document.querySelector('#ws-log'),
  note: document.querySelector('#ws-note'),
  binary: document.querySelector('#ws-binary'),
};

let socket = null;
let started = 0;

const READY = ['Connecting', 'Open', 'Closing', 'Closed'];

// A bare host is what people type. Guessing the scheme is friendlier than refusing,
// but the guess is reported so a wrong one is visible rather than mysterious.
function normalise(value) {
  const raw = value.trim();
  if (raw === '') return { url: '', note: '' };
  if (/^wss?:\/\//i.test(raw)) return { url: raw, note: '' };
  if (/^https:\/\//i.test(raw)) return { url: raw.replace(/^https:/i, 'wss:'), note: 'https:// became wss://' };
  if (/^http:\/\//i.test(raw)) return { url: raw.replace(/^http:/i, 'ws:'), note: 'http:// became ws://' };
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return { url: raw, note: '' };
  // On an https page the only scheme that can work is wss, so that is the guess.
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
  return { url: `${scheme}://${raw}`, note: `no scheme given, so ${scheme}:// was assumed` };
}

function entry(kind, text) {
  const row = document.createElement('div');
  row.className = `ws-entry ws-${kind}`;
  const time = document.createElement('span');
  time.className = 'ws-time';
  const seconds = (Date.now() - started) / 1000;
  time.textContent = started === 0 ? '—' : `${seconds.toFixed(2)}s`;
  const label = document.createElement('span');
  label.className = 'ws-kind';
  label.textContent = kind;
  const body = document.createElement('pre');
  body.className = 'ws-text';
  body.textContent = text;
  row.append(time, label, body);
  els.log.append(row);
  els.log.scrollTop = els.log.scrollHeight;
  return row;
}

const stamp = () => new Date().toLocaleTimeString();

function system(text) {
  const row = entry('system', text);
  row.querySelector('.ws-time').textContent = stamp();
  return row;
}

function showState() {
  const state = socket ? READY[socket.readyState] || 'Unknown' : 'Not connected';
  els.note.textContent = state;
  els.note.dataset.state = state;
  const open = socket && socket.readyState === WebSocket.OPEN;
  els.connect.disabled = Boolean(socket) && socket.readyState <= WebSocket.OPEN;
  els.disconnect.disabled = !socket;
  els.send.disabled = !open;
  els.message.disabled = !open;
  return open;
}

function teardown() {
  socket = null;
  showState();
}

function connect() {
  const { url, note } = normalise(els.url.value);
  if (url === '') {
    tk.setStatus(els.status, 'Enter a ws:// or wss:// address first.', 'err');
    return;
  }
  if (note) tk.setStatus(els.status, `Opening ${url}… (${note})`, '');

  // Mixed content is refused by the browser before any packet leaves, and the
  // error it raises does not say so. Saying it here saves an hour of confusion.
  if (location.protocol === 'https:' && /^ws:\/\//i.test(url) && !/^ws:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(url)) {
    entry('error', 'A page served over https cannot open a plain ws:// socket. The browser blocks it before it reaches the network. Use wss://, or open this page over http.');
    tk.setStatus(els.status, 'Blocked by the browser: this page is https and the socket is ws.', 'err');
    return;
  }

  let protocols = [];
  if (els.protocol.value.trim() !== '') {
    protocols = els.protocol.value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  els.log.replaceChildren();
  started = Date.now();
  // The status line is replaced as soon as the socket opens, so the guess is also
  // written where it stays. A guess nobody can see again is a silent guess.
  if (note) entry('system', note);
  if (!note) tk.setStatus(els.status, `Opening ${url}…`, '');

  try {
    socket = protocols.length > 0 ? new WebSocket(url, protocols) : new WebSocket(url);
  } catch (error) {
    entry('error', `Could not open the socket: ${error.message}`);
    tk.setStatus(els.status, `Could not open the socket: ${error.message}`, 'err');
    socket = null;
    showState();
    return;
  }

  showState();
  entry('sent', `→ GET ${url}`);

  socket.addEventListener('open', () => {
    entry('system', `open — protocol: ${socket.protocol || '(none)'} · extensions: ${socket.extensions || '(none)'}`);
    tk.setStatus(els.status, 'Connected.', 'ok');
    showState();
    els.message.focus();
  });

  socket.addEventListener('message', async (event) => {
    const data = event.data;
    if (typeof data === 'string') {
      let shown = data;
      try {
        shown = JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        /* not JSON — show it as it arrived */
      }
      entry('received', shown);
      return;
    }
    const bytes = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : new Uint8Array(data);
    const head = [...bytes.subarray(0, 64)].map((b) => b.toString(16).padStart(2, '0')).join(' ');
    entry('received', `binary, ${bytes.length} bytes\n${head}${bytes.length > 64 ? ' …' : ''}`);
  });

  socket.addEventListener('error', () => {
    // The browser deliberately gives no detail here — an error event is all you get,
    // and the close event that follows is where the code lives. Saying "unknown"
    // is more useful than inventing a cause.
    entry('error', 'error — the browser reports no detail for this event. A refused connection, a wrong path and a rejected Origin all look the same from here.');
  });

  socket.addEventListener('close', (event) => {
    entry(
      'system',
      `close — code ${event.code}${event.reason ? ` · ${event.reason}` : ''} · ${event.wasClean ? 'clean' : 'not clean'}` +
        (event.code === 1006 ? '\n1006 means the connection was closed without a close frame: the server dropped it, or nothing was listening, or a proxy refused it.' : ''),
    );
    tk.setStatus(els.status, `Closed with code ${event.code}.`, event.code === 1000 || event.code === 1005 ? 'ok' : 'err');
    teardown();
  });

  showState();
}

function send() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  const text = els.message.value;
  if (els.binary.checked) {
    // "hex" is the only shape worth accepting: a text box cannot hold arbitrary
    // bytes, and hex is the one that survives being copied and pasted.
    const cleaned = text.replace(/[\s,]/g, '');
    if (!/^([0-9a-f]{2})*$/i.test(cleaned)) {
      tk.setStatus(els.status, 'Binary frames are sent as hex — use pairs of hex digits, for example 48 69.', 'err');
      return;
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
    socket.send(bytes);
    entry('sent', `binary, ${bytes.length} bytes\n${cleaned.replace(/(..)(?=.)/g, '$1 ')}`);
  } else {
    socket.send(text);
    entry('sent', text);
  }
  els.message.value = '';
}

/* ---------- wiring ---------- */

els.connect.addEventListener('click', connect);
els.disconnect.addEventListener('click', () => {
  if (socket && socket.readyState <= WebSocket.OPEN) socket.close(1000, 'closed from the page');
  else teardown();
});
els.send.addEventListener('click', send);
els.message.addEventListener('keydown', (event) => {
  // Enter sends, Shift+Enter makes a newline — the convention every chat box uses.
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});
els.clear.addEventListener('click', () => {
  els.log.replaceChildren();
  started = Date.now();
});
els.url.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') connect();
});

showState();
