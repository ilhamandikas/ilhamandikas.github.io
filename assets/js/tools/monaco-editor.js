// Monaco Editor with a plain-textarea fallback. Monaco is a large bundle, so it
// is loaded from a CDN only when asked for; if that fails the text area keeps
// working and nothing is lost. The text area is always the source of truth, so
// the copy and download buttons work whether or not Monaco is present.
const { tk } = window;

const CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';

const els = {
  lang: document.querySelector('#mon-lang'),
  load: document.querySelector('#mon-load'),
  format: document.querySelector('#mon-format'),
  clear: document.querySelector('#mon-clear'),
  textarea: document.querySelector('#mon-editor'),
  container: document.querySelector('#mon-container'),
  badge: document.querySelector('#mon-badge'),
  meta: document.querySelector('#mon-meta'),
  status: document.querySelector('#mon-status'),
};

let editor = null;
let loading = false;

function updateMeta() {
  const value = els.textarea.value;
  const lines = value ? value.split('\n').length : 0;
  els.meta.textContent = `${lines} line${lines === 1 ? '' : 's'} · ${value.length} chars`;
}

function syncToTextarea() {
  if (!editor) return;
  els.textarea.value = editor.getValue();
  updateMeta();
}

// A data-URL worker proxy, the standard way to run Monaco's workers when its
// files are served from a CDN instead of the same origin.
function workerProxy() {
  const code =
    `self.MonacoEnvironment = { baseUrl: '${CDN}/' };` +
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
        value: els.textarea.value,
        language: els.lang.value,
        theme: 'vs',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 13,
        tabSize: 2,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
      });
      editor.onDidChangeModelContent(syncToTextarea);
      els.textarea.hidden = true;
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

els.load.addEventListener('click', enableMonaco);

els.lang.addEventListener('change', () => {
  if (!editor || !window.monaco) return;
  const model = editor.getModel();
  if (model) window.monaco.editor.setModelLanguage(model, els.lang.value);
});

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
  els.textarea.value = '';
  updateMeta();
  tk.setStatus(els.status, 'Cleared.', '');
});

els.textarea.addEventListener('input', updateMeta);
updateMeta();
