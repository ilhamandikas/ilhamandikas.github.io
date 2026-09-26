// JavaScript playground: a Monaco editor (CDN on demand, text-area fallback) that
// runs the snippet in the page and collects its console output. The code runs with
// the page's own privileges, so only run what you trust.
const { tk } = window;

const CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';
// Monaco resolves worker ids like `vs/.../tsWorker.js` against `baseUrl`, so it
// must be the directory that contains `vs/`.
const BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min';

const els = {
  code: document.querySelector('#jsp-code'),
  container: document.querySelector('#jsp-container'),
  load: document.querySelector('#jsp-load'),
  format: document.querySelector('#jsp-format'),
  run: document.querySelector('#jsp-run'),
  clear: document.querySelector('#jsp-clear'),
  output: document.querySelector('#jsp-output'),
  badge: document.querySelector('#jsp-badge'),
  meta: document.querySelector('#jsp-meta'),
  status: document.querySelector('#jsp-status'),
};

let editor = null;
let loading = false;

/* ------------------------------------------------------------------ editor */

function updateMeta() {
  const value = els.code.value;
  const lines = value ? value.split('\n').length : 0;
  els.meta.textContent = `${lines} line${lines === 1 ? '' : 's'} · ${value.length} chars`;
}

function syncToTextarea() {
  if (!editor) return;
  els.code.value = editor.getValue();
  updateMeta();
}

// A data-URL worker proxy, the standard way to run Monaco's workers when its
// files are served from a CDN instead of the same origin.
function workerProxy() {
  const code =
    `self.MonacoEnvironment = { baseUrl: '${BASE}/' };` +
    `importScripts('${CDN}/base/worker/workerMain.js');`;
  return `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.require && window.monaco) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.monaco = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Monaco could not be fetched.'));
    document.head.append(script);
    // jsdom never fires onload for injected scripts, so never wait forever.
    setTimeout(() => reject(new Error('Monaco took too long to load.')), 10000);
  });
}

function loadMonaco() {
  return loadScript(`${CDN}/loader.js`).then(
    () =>
      new Promise((resolve, reject) => {
        if (!window.require) { reject(new Error('Monaco loader missing.')); return; }
        window.require.config({ paths: { vs: CDN } });
        window.require(['vs/editor/editor.main'], () => resolve(), () => reject(new Error('Monaco failed to start.')));
        setTimeout(() => reject(new Error('Monaco took too long to start.')), 10000);
      }),
  );
}

function enableMonaco() {
  if (editor || loading) return;
  loading = true;
  els.load.disabled = true;
  tk.setStatus(els.status, 'Loading Monaco', '');

  window.MonacoEnvironment = { getWorkerUrl: () => workerProxy() };

  loadMonaco()
    .then(() => {
      editor = window.monaco.editor.create(els.container, {
        value: els.code.value,
        language: 'javascript',
        theme: 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        padding: { top: 10, bottom: 10 },
        folding: true,
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true, indentation: true, highlightActiveIndentation: true },
        renderLineHighlight: 'all',
        occurrencesHighlight: 'singleFile',
        colorDecorators: true,
        stickyScroll: { enabled: true },
        unicodeHighlight: { ambiguousCharacters: true, invisibleCharacters: true },
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        lineNumbersMinChars: 3,
      });
      editor.onDidChangeModelContent(syncToTextarea);
      // Ctrl/Cmd + Enter keeps working once the text area is hidden.
      editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, run);
      els.code.hidden = true;
      els.container.hidden = false;
      els.load.textContent = 'Monaco ready';
      els.badge.textContent = 'Monaco';
      els.badge.classList.add('is-on');
      tk.setStatus(els.status, 'Monaco editor ready.', 'ok');
      updateMeta();
    })
    .catch((error) => {
      loading = false;
      els.load.disabled = false;
      tk.setStatus(els.status, `${error.message} The plain editor still works.`, '');
    });
}

/* ----------------------------------------------------------------- running */

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

/* ----------------------------------------------------------------- actions */

els.run.addEventListener('click', run);
els.load.addEventListener('click', enableMonaco);

els.format.addEventListener('click', () => {
  if (!editor) {
    tk.setStatus(els.status, 'Enable Monaco to format.', '');
    return;
  }
  const action = editor.getAction('editor.action.formatDocument');
  if (!action) {
    tk.setStatus(els.status, 'This language has no formatter.', '');
    return;
  }
  action.run().then(
    () => { syncToTextarea(); tk.setStatus(els.status, 'Formatted.', 'ok'); },
    () => tk.setStatus(els.status, 'This language has no formatter.', ''),
  );
});

els.clear.addEventListener('click', () => {
  if (editor) editor.setValue('');
  els.code.value = '';
  updateMeta();
  render([]);
  tk.setStatus(els.status, 'Cleared.', '');
});

// Ctrl/Cmd + Enter runs, the shortcut a console user expects.
els.code.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});

els.code.addEventListener('input', updateMeta);
updateMeta();
render([]);
