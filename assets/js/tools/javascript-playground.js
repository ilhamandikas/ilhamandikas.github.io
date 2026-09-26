// JavaScript playground: run a snippet in the page and collect its console
// output, return value and timing. The code runs with the page's own privileges,
// which is what a browser console does — so only run code you trust.
const { tk } = window;

const els = {
  code: document.querySelector('#jsp-code'),
  run: document.querySelector('#jsp-run'),
  clear: document.querySelector('#jsp-clear'),
  output: document.querySelector('#jsp-output'),
  status: document.querySelector('#jsp-status'),
};

function format(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack || `${value.name}: ${value.message}`;
  if (typeof value === 'function') return value.toString();
  if (value === undefined) return 'undefined';
  try {
    const json = JSON.stringify(value, null, 2);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
}

function render(lines) {
  els.output.replaceChildren();
  if (!lines.length) {
    els.output.textContent = '(no output)';
    return;
  }
  for (const line of lines) {
    const row = document.createElement('div');
    row.className = `jsp-line jsp-${line.kind}`;
    const tag = document.createElement('span');
    tag.className = 'jsp-tag';
    tag.textContent = line.kind;
    const text = document.createElement('span');
    text.textContent = line.text;
    row.append(tag, text);
    els.output.append(row);
  }
}

async function run() {
  const lines = [];
  const write = (kind, args) => lines.push({ kind, text: args.map(format).join(' ') });
  const console = {
    log: (...args) => write('log', args),
    info: (...args) => write('log', args),
    warn: (...args) => write('warn', args),
    error: (...args) => write('error', args),
    debug: (...args) => write('log', args),
  };
  const started = Date.now();
  try {
    // The async wrapper lets a snippet use top-level await and return a value.
    const fn = new Function('console', `"use strict"; return (async () => {\n${els.code.value}\n})();`);
    const value = await fn(console);
    if (value !== undefined) lines.push({ kind: 'result', text: format(value) });
    tk.setStatus(els.status, `Ran in ${Date.now() - started} ms.`, 'ok');
  } catch (error) {
    lines.push({ kind: 'error', text: format(error) });
    tk.setStatus(els.status, 'Threw an error.', 'err');
  }
  render(lines);
}

function clearOutput() {
  render([]);
  tk.setStatus(els.status, '');
}

els.run.addEventListener('click', run);
els.clear.addEventListener('click', clearOutput);
// Ctrl/Cmd + Enter runs, the shortcut a console user expects.
els.code.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});

render([]);
