// HTTP header builder: clean up a key/value list and add common security headers.
const { tk } = window;

const els = {
  input: document.querySelector('#hhb-input'),
  out: document.querySelector('#hhb-out'),
  sort: document.querySelector('#hhb-sort'),
  status: document.querySelector('#hhb-status'),
};

const SECURITY = {
  hsts: ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
  nosniff: ['X-Content-Type-Options', 'nosniff'],
  frame: ['X-Frame-Options', 'DENY'],
  referrer: ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  csp: ['Content-Security-Policy', "default-src 'self'"],
  permissions: ['Permissions-Policy', 'geolocation=(), microphone=(), camera=()'],
  cache: ['Cache-Control', 'no-store'],
};

const boxes = [...document.querySelectorAll('[data-hhb]')];
const NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

function render() {
  const map = new Map();
  const invalid = [];
  els.input.value.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const at = line.indexOf(':');
    if (at === -1) {
      invalid.push(line);
      return;
    }
    const name = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();
    if (!NAME.test(name)) {
      invalid.push(line);
      return;
    }
    map.set(name, value);
  });

  boxes.forEach((box) => {
    if (!box.checked) return;
    const [name, value] = SECURITY[box.dataset.hhb];
    if (!map.has(name)) map.set(name, value);
  });

  let entries = [...map];
  if (els.sort.checked) entries = entries.sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));
  els.out.value = entries.map(([name, value]) => `${name}: ${value}`).join('\n');

  if (invalid.length) {
    tk.setStatus(els.status, `${invalid.length} line${invalid.length === 1 ? '' : 's'} skipped — use "Name: value".`, 'err');
  } else if (entries.length) {
    tk.setStatus(els.status, `${entries.length} header${entries.length === 1 ? '' : 's'} ready.`, 'ok');
  } else {
    tk.setStatus(els.status, '');
  }
}

tk.live([els.input, els.sort, ...boxes], render);
