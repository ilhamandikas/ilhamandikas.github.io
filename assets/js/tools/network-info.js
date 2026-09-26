// Network info: a snapshot of what the browser will tell a page about the connection.
const { tk } = window;

const els = {
  out: document.querySelector('#ni-out'),
  status: document.querySelector('#ni-status'),
  refresh: document.querySelector('#ni-refresh'),
};

function row(label, value) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const key = document.createElement('dt');
  const val = document.createElement('dd');
  key.textContent = label;
  val.textContent = value;
  wrap.append(key, val);
  return wrap;
}

function render() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
  const timeZone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '—';
    } catch {
      return '—';
    }
  })();
  const languages = navigator.languages && navigator.languages.length ? navigator.languages.join(', ') : navigator.language || '—';

  els.out.replaceChildren(
    row('Online', navigator.onLine ? 'Yes' : 'No'),
    row('Effective type', conn.effectiveType || '—'),
    row('Downlink', conn.downlink !== undefined ? `${conn.downlink} Mbps` : '—'),
    row('Round-trip time', conn.rtt !== undefined ? `${conn.rtt} ms` : '—'),
    row('Data saver', conn.saveData ? 'On' : 'Off'),
    row('User agent', navigator.userAgent || '—'),
    row('Platform', navigator.platform || '—'),
    row('Languages', languages),
    row('CPU threads', navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : '—'),
    row('Device memory', navigator.deviceMemory ? `${navigator.deviceMemory} GB` : '—'),
    row('Screen', `${screen.width}×${screen.height}`),
    row('Viewport', `${window.innerWidth}×${window.innerHeight}`),
    row('Pixel ratio', String(window.devicePixelRatio || 1)),
    row('Time zone', timeZone),
    row('Cookies enabled', navigator.cookieEnabled ? 'Yes' : 'No'),
    row('Do Not Track', navigator.doNotTrack || '—'),
  );
  tk.setStatus(els.status, 'Read from your browser — nothing was sent anywhere.', 'ok');
}

if (els.refresh) els.refresh.addEventListener('click', render);
window.addEventListener('online', render);
window.addEventListener('offline', render);
render();
