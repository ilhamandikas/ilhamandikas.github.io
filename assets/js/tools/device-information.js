// A quick snapshot of the current browser and device.
const { tk } = window;

const results = document.querySelector('#dev-results');
const status = document.querySelector('#dev-status');

function render() {
  const nav = navigator;
  const rows = [
    ['User agent', nav.userAgent],
    ['Platform', nav.platform || '—'],
    ['Language', nav.language],
    ['Languages', (nav.languages || []).join(', ') || '—'],
    ['CPU threads', nav.hardwareConcurrency || '—'],
    ['Device memory', nav.deviceMemory ? `${nav.deviceMemory} GB` : '—'],
    ['Screen', `${screen.width} × ${screen.height} @ ${window.devicePixelRatio}x`],
    ['Viewport', `${window.innerWidth} × ${window.innerHeight}`],
    ['Colour depth', `${screen.colorDepth}-bit`],
    ['Timezone', Intl.DateTimeFormat().resolvedOptions().timeZone],
    ['Online', nav.onLine ? 'yes' : 'no'],
    ['Cookies enabled', nav.cookieEnabled ? 'yes' : 'no'],
    ['Touch points', nav.maxTouchPoints || 0],
    ['Reduced motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'yes' : 'no'],
    ['Dark mode', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'yes' : 'no'],
  ];
  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${String(value)}</dd>`;
      return row;
    }),
  );
  tk.setStatus(status, 'Updated', 'ok');
}

document.querySelector('#dev-refresh').addEventListener('click', render);
render();
