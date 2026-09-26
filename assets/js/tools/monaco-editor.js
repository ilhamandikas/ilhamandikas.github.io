// Monaco Editor with a plain-textarea fallback. Monaco is a large bundle, so it
// is loaded from a CDN only when asked for; if that fails the text area keeps
// working and nothing is lost. The text area is always the source of truth, so
// the copy and download buttons work whether or not Monaco is present. A file
// can be opened through the picker or dropped onto the editor; text files get a
// language from their extension, binaries are refused.
const { tk } = window;

const CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';

const els = {
  lang: document.querySelector('#mon-lang'),
  load: document.querySelector('#mon-load'),
  open: document.querySelector('#mon-open'),
  file: document.querySelector('#mon-file'),
  format: document.querySelector('#mon-format'),
  clear: document.querySelector('#mon-clear'),
  textarea: document.querySelector('#mon-editor'),
  container: document.querySelector('#mon-container'),
  wrap: document.querySelector('.mon-editor-wrap'),
  badge: document.querySelector('#mon-badge'),
  meta: document.querySelector('#mon-meta'),
  fileName: document.querySelector('#mon-file-name'),
  status: document.querySelector('#mon-status'),
};

// Extensions we can name a language for. A known text extension also settles the
// binary question, because browsers guess a few of them badly (Chrome reports
// .ts as video/mp2t, for example).
const LANGUAGE_BY_EXT = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  json: 'json', jsonc: 'json',
  html: 'html', htm: 'html', vue: 'html', svelte: 'html',
  css: 'css', scss: 'scss', less: 'scss',
  md: 'markdown', markdown: 'markdown',
  yaml: 'yaml', yml: 'yaml',
  xml: 'xml', svg: 'xml', xsl: 'xml', xsd: 'xml',
  sql: 'sql',
  py: 'python', pyw: 'python',
  sh: 'shell', bash: 'shell', zsh: 'shell', ksh: 'shell', fish: 'shell',
  go: 'go', rs: 'rust', java: 'java', cs: 'csharp',
  c: 'cpp', h: 'cpp', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  php: 'php', rb: 'ruby',
  ini: 'ini', conf: 'ini', cfg: 'ini', env: 'ini', properties: 'ini', toml: 'ini',
  graphql: 'graphql', gql: 'graphql',
  dockerfile: 'dockerfile', containerfile: 'dockerfile',
  txt: 'plaintext', log: 'plaintext', csv: 'plaintext', tsv: 'plaintext', text: 'plaintext',
};

// Formats that are never text. The NUL-byte check in looksBinary() catches the
// rest, so this list only has to cover the common cases.
const BINARY_EXT = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'tif', 'tiff', 'avif', 'heic',
  'pdf', 'zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'tar',
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'jar', 'war', 'wasm',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'mp3', 'mp4', 'mov', 'avi', 'mkv', 'wav', 'ogg', 'flac', 'webm',
  'db', 'sqlite', 'iso', 'img', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
]);

const WARN_BYTES = 2 * 1024 * 1024;
const MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_NAME = 'snippet.txt';

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

function extensionOf(name) {
  const lower = name.toLowerCase();
  if (lower === 'dockerfile' || lower === 'containerfile') return lower;
  const dot = lower.lastIndexOf('.');
  return dot > -1 ? lower.slice(dot + 1) : '';
}

function languageFor(name) {
  return LANGUAGE_BY_EXT[extensionOf(name)] ?? null;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function looksBinary(file, text) {
  const ext = extensionOf(file.name);
  if (BINARY_EXT.has(ext)) return true;
  if (text.includes('\u0000')) return true;
  if (LANGUAGE_BY_EXT[ext]) return false;
  const type = file.type || '';
  if (/^(image|audio|video|font)\//.test(type)) return true;
  return /^application\/(pdf|zip|gzip|x-tar|x-7z|x-rar|x-msdownload|octet-stream|wasm|vnd)/.test(type);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsText(file);
  });
}

function setFileName(name) {
  els.fileName.textContent = name;
  els.fileName.hidden = false;
  const button = document.querySelector('[data-download="#mon-editor"]');
  if (button) button.dataset.filename = name;
}

function resetFileName() {
  els.fileName.textContent = '';
  els.fileName.hidden = true;
  const button = document.querySelector('[data-download="#mon-editor"]');
  if (button) button.dataset.filename = DEFAULT_NAME;
}

function setLanguage(value) {
  els.lang.value = value;
  if (!editor || !window.monaco) return;
  const model = editor.getModel();
  if (model) window.monaco.editor.setModelLanguage(model, value);
}

async function loadFile(file, note = '') {
  if (!file) return;

  if (file.size > MAX_BYTES) {
    tk.setStatus(els.status, `${file.name} is ${formatSize(file.size)}, over the 10 MB limit.${note}`, 'err');
    return;
  }

  let text;
  try {
    text = await readFile(file);
  } catch (error) {
    tk.setStatus(els.status, error.message, 'err');
    return;
  }

  if (looksBinary(file, text)) {
    tk.setStatus(els.status, `${file.name} looks like a binary file, so it was not loaded.${note}`, 'err');
    return;
  }

  els.textarea.value = text;
  if (editor) editor.setValue(text);
  updateMeta();

  const language = languageFor(file.name);
  if (language) setLanguage(language);
  setFileName(file.name);

  const size = formatSize(file.size);
  if (file.size > WARN_BYTES) {
    tk.setStatus(els.status, `Loaded ${file.name} (${size}). It is large, so editing may feel slow.${note}`, '');
  } else {
    tk.setStatus(els.status, `Loaded ${file.name} (${size}).${note}`, 'ok');
  }
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
        padding: { top: 10, bottom: 10 },
        folding: true,
        // Visual aids that Monaco leaves off by default.
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

els.open.addEventListener('click', () => els.file.click());
els.file.addEventListener('change', () => {
  const file = els.file.files && els.file.files[0];
  if (file) loadFile(file);
  // Clear the picker so choosing the same file twice still fires a change.
  try { els.file.value = ''; } catch { /* some browsers refuse, harmless */ }
});

function highlightDrop(on) {
  els.wrap.classList.toggle('is-drop', on);
}

els.wrap.addEventListener('dragenter', (event) => {
  event.preventDefault();
  highlightDrop(true);
});
els.wrap.addEventListener('dragover', (event) => {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  highlightDrop(true);
});
els.wrap.addEventListener('dragleave', (event) => {
  if (event.relatedTarget && els.wrap.contains(event.relatedTarget)) return;
  highlightDrop(false);
});
els.wrap.addEventListener('drop', (event) => {
  event.preventDefault();
  highlightDrop(false);
  const files = event.dataTransfer && event.dataTransfer.files;
  // A dragged selection is text, not a file; never let it overwrite the editor.
  if (!files || !files.length) return;
  const note = files.length > 1 ? ` ${files.length - 1} other file(s) were ignored.` : '';
  loadFile(files[0], note);
});

// A file dropped outside the editor would otherwise navigate the page away.
document.addEventListener('dragover', (event) => event.preventDefault());
document.addEventListener('drop', (event) => event.preventDefault());

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
  resetFileName();
  tk.setStatus(els.status, 'Cleared.', '');
});

els.textarea.addEventListener('input', updateMeta);
updateMeta();
