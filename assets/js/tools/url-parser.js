// Break a URL into its components using the native URL parser.
const { tk } = window;

const input = document.querySelector('#url-input');
const results = document.querySelector('#url-results');
const status = document.querySelector('#url-status');

function render() {
  results.replaceChildren();
  const raw = input.value.trim();
  if (raw === '') {
    tk.setStatus(status, '');
    return;
  }
  let url;
  try {
    url = new URL(raw);
  } catch {
    tk.setStatus(status, 'Not a valid absolute URL', 'err');
    return;
  }

  const rows = [
    ['Protocol', url.protocol],
    ['Origin', url.origin],
    ['Host', url.host],
    ['Hostname', url.hostname],
    ['Port', url.port || '(default)'],
    ['Pathname', url.pathname],
    ['Query', url.search || '(none)'],
    ['Hash', url.hash || '(none)'],
    ['Username', url.username || '(none)'],
    ['Password', url.password ? '••••••' : '(none)'],
  ];
  for (const [key, value] of url.searchParams.entries()) {
    rows.push([`Param · ${key}`, value]);
  }

  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
      return row;
    }),
  );
  tk.setStatus(status, 'Valid URL', 'ok');
}

tk.live(input, render);
