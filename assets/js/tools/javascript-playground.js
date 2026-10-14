// Snippets run in a disposable worker, never in the page's execution context.
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
  stop: document.querySelector('#jsp-stop'),
  auto: document.querySelector('#jsp-auto'),
  clearOutput: document.querySelector('#jsp-clear-output'),
  inputForm: document.querySelector('#jsp-input-form'),
  inputLabel: document.querySelector('#jsp-input-label'),
  input: document.querySelector('#jsp-input'),
  eof: document.querySelector('#jsp-eof'),
  inputMode: document.querySelector('#jsp-input-mode'),
  inputModeHint: document.querySelector('#jsp-input-mode-hint'),
  stdinField: document.querySelector('#jsp-stdin-field'),
  stdin: document.querySelector('#jsp-stdin'),
  workspace: document.querySelector('#jsp-workspace'),
  copyOutput: document.querySelector('#jsp-copy-output'),
  metrics: document.querySelector('#jsp-metrics'),
  category: document.querySelector('#jsp-category'),
  example: document.querySelector('#jsp-example'),
  exampleHint: document.querySelector('#jsp-example-hint'),
  suggestions: document.querySelector('#jsp-suggestions'),
  fullscreen: document.querySelector('#jsp-fullscreen'),
  fullscreenHint: document.querySelector('#jsp-fullscreen-hint'),
};

const language = els.workspace?.dataset.language || 'javascript';
const languageName = { javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', ruby: 'Ruby', c: 'C', cpp: 'C++' }[language];
const preparedInput = ['python', 'ruby', 'c', 'cpp'].includes(language);
// Monaco has no separate C language; its `cpp` grammar covers C too.
const monacoLanguage = language === 'c' ? 'cpp' : language;
const runtimeModule = els.workspace?.dataset.runtimeModule
  ? new URL(els.workspace.dataset.runtimeModule, location.href).href : null;
const exampleData = JSON.parse(document.querySelector('#jsp-examples')?.textContent || '[]');
const runtimeURLs = {
  typescript: 'https://cdn.jsdelivr.net/npm/typescript@5.9.3/lib/typescript.js',
  python: 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/',
  ruby: 'https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.10.1/dist/ruby.wasm',
  c: 'https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/index.js',
  cpp: 'https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/index.js',
};

let editor = null;
let loading = false;
let activeWorker = null;
let deadline = null;
let autoTimer = null;
let promptId = null;
let outputCount = 0;
let outputText = [];
let runTiming = null;
let selectedExample = '';
let bridgeSession = null;
let bridgeReady = null;
let runGeneration = 0;
let executionRemaining = 30000;
let executionResumedAt = null;

/* --------------------------------------------------------------- fullscreen */

let expanded = false;
let nativeFullscreen = false;
let previousFocus = null;
let outsideElements = [];

function setExpanded(value) {
  if (expanded === value) return;
  expanded = value;
  els.workspace.classList.toggle('jsp-expanded', value);
  document.body.classList.toggle('jsp-focus-open', value);
  els.fullscreen.textContent = value ? 'Exit full screen' : 'Full screen';
  els.fullscreen.setAttribute('aria-pressed', String(value));
  els.fullscreenHint.hidden = !value;
  if (value) {
    previousFocus = document.activeElement;
    // In the fallback, hide surrounding controls from keyboard and assistive
    // technology without moving the editor or recreating its model.
    for (let node = els.workspace; node.parentElement; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && !sibling.hasAttribute('inert')) {
          sibling.setAttribute('inert', '');
          outsideElements.push(sibling);
        }
      }
      if (node.parentElement === document.body) break;
    }
    els.fullscreen.focus({ preventScroll: true });
  } else {
    for (const element of outsideElements) element.removeAttribute('inert');
    outsideElements = [];
    previousFocus?.focus({ preventScroll: true });
    previousFocus = null;
  }
  editor?.layout();
}

async function exitExpanded() {
  if (document.fullscreenElement === els.workspace) {
    try {
      await document.exitFullscreen();
    } catch {
      tk.setStatus(els.status, 'Could not exit full screen. Press Esc to leave browser fullscreen.', 'err');
      return;
    }
  }
  nativeFullscreen = false;
  setExpanded(false);
}

els.fullscreen.addEventListener('click', async () => {
  if (expanded) { await exitExpanded(); return; }
  setExpanded(true);
  if (!els.workspace.requestFullscreen) return;
  els.fullscreen.disabled = true;
  try {
    await els.workspace.requestFullscreen();
  } catch {
    // Keep the in-page full-size workspace when fullscreen is unsupported or denied.
  } finally {
    els.fullscreen.disabled = false;
    if (expanded) els.fullscreen.focus({ preventScroll: true });
  }
});
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === els.workspace) {
    nativeFullscreen = true;
    setExpanded(true);
  } else if (nativeFullscreen) {
    nativeFullscreen = false;
    setExpanded(false);
  }
});
els.workspace.addEventListener('keydown', (event) => {
  if (!expanded) return;
  // Leave editor shortcuts intact, but don't trigger site navigation/search.
  event.stopPropagation();
  if (event.key === 'Escape' && !event.defaultPrevented) {
    event.preventDefault();
    void exitExpanded();
  }
});
window.addEventListener('pagehide', () => { nativeFullscreen = false; setExpanded(false); });

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
  scheduleRun();
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
      const { javascriptDefaults, typescriptDefaults } = window.monaco.languages.typescript;
      for (const defaults of [javascriptDefaults, typescriptDefaults]) {
        // Top-level return/await are valid in the runner's async wrapper.
        defaults.setDiagnosticsOptions({
          noSyntaxValidation: false,
          noSemanticValidation: false,
          diagnosticCodesToIgnore: [1108, 1375, 1378],
        });
        defaults.setCompilerOptions({
          ...defaults.getCompilerOptions(),
          allowNonTsExtensions: true,
          allowJs: true,
          checkJs: true,
          lib: ['es2022', 'webworker'],
          target: window.monaco.languages.typescript.ScriptTarget.ES2022,
        });
        defaults.addExtraLib('declare function prompt(message?: string, value?: string): Promise<string | null>;\n', 'ts:playground-globals.d.ts');
      }
      editor = window.monaco.editor.create(els.container, {
        value: els.code.value,
        language: monacoLanguage,
        ariaLabel: `${languageName} code`,
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
        quickSuggestions: els.suggestions.checked,
        suggestOnTriggerCharacters: els.suggestions.checked,
        wordBasedSuggestions: els.suggestions.checked ? 'currentDocument' : 'off',
        tabCompletion: els.suggestions.checked ? 'on' : 'off',
        acceptSuggestionOnEnter: 'smart',
        renderValidationDecorations: 'on',
        cursorSmoothCaretAnimation: 'off',
        smoothScrolling: false,
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

/* --------------------------------------------------------------- local stdin */

function timed(promise, message) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), 10000); }),
  ]).finally(() => clearTimeout(timer));
}

async function openInputBridge() {
  const scriptURL = new URL(els.workspace.dataset.inputWorkerUrl, location.href).href;
  if (!bridgeReady) {
    bridgeReady = (async () => {
      await timed(navigator.serviceWorker.register(scriptURL), 'Local input bridge registration timed out.');
      await timed(navigator.serviceWorker.ready, 'Local input bridge activation timed out.');
      if (navigator.serviceWorker.controller?.scriptURL !== scriptURL) {
        await new Promise((resolve, reject) => {
          const cleanup = () => { clearTimeout(timer); navigator.serviceWorker.removeEventListener('controllerchange', check); };
          const check = () => {
            if (navigator.serviceWorker.controller?.scriptURL === scriptURL) { cleanup(); resolve(); }
          };
          const timer = setTimeout(() => { cleanup(); reject(new Error('Local input bridge could not control this page.')); }, 10000);
          navigator.serviceWorker.addEventListener('controllerchange', check);
          check();
        });
      }
    })().catch((error) => { bridgeReady = null; throw error; });
  }
  await bridgeReady;
  const controller = navigator.serviceWorker.controller;
  if (controller?.scriptURL !== scriptURL) { bridgeReady = null; throw new Error('Local input bridge disconnected.'); }
  const token = crypto.randomUUID();
  const channel = new MessageChannel();
  try {
    await timed(new Promise((resolve, reject) => {
      channel.port1.onmessage = ({ data }) => data.ok ? resolve() : reject(new Error('Local input bridge is busy.'));
      controller.postMessage({ type: 'open', token }, [channel.port2]);
    }), 'Local input session timed out.');
  } catch (error) {
    controller.postMessage({ type: 'close', token });
    throw error;
  } finally {
    channel.port1.close();
    channel.port2.close();
  }
  return { controller, token, url: new URL(`./__playground_input__/${token}/`, scriptURL).href };
}

function updateInputMode() {
  if (els.stdinField) els.stdinField.hidden = els.inputMode.value !== 'prepared';
}
if (els.inputMode) {
  if (!window.isSecureContext || !navigator.serviceWorker) {
    els.inputMode.value = 'prepared';
    els.inputMode.querySelector('[value="interactive"]').disabled = true;
    els.inputModeHint.textContent = 'Interactive stdin needs HTTPS and service worker support. Prepared input remains available in this browser.';
  }
  els.inputMode.addEventListener('change', () => {
    clearTimeout(autoTimer);
    els.auto.checked = false;
    stop();
    updateInputMode();
    tk.setStatus(els.status, 'Input mode changed. Press Run; Auto-run is paused.', '');
  });
  updateInputMode();
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

// This function is serialized into a Blob; it must not depend on page globals.
function workerMain() {
  const send = self.postMessage.bind(self);
  let count = 0;
  let nextPrompt = 0;
  const prompts = new Map();
  const write = (kind, args) => {
    if (++count > 500) return;
    send({ type: 'line', kind, text: args.map(format).join(' ').slice(0, 20000) });
  };
  const console = Object.fromEntries(['log', 'info', 'warn', 'error', 'debug', 'table'].map(
    (kind) => [kind, (...args) => write(kind === 'table' ? 'log' : kind, args)],
  ));
  console.clear = () => { count = 0; send({ type: 'clear' }); };
  const prompt = (label = 'Input', value = '') => new Promise((resolve) => {
    const id = ++nextPrompt;
    prompts.set(id, resolve);
    send({ type: 'prompt', id, label: String(label), value: String(value) });
  });
  self.addEventListener('error', (event) => write('error', [event.message]));
  self.addEventListener('unhandledrejection', (event) => write('error', [event.reason]));
  self.onmessage = async ({ data }) => {
    if (data.type === 'input') {
      prompts.get(data.id)?.(data.value);
      prompts.delete(data.id);
      return;
    }
    if (data.type !== 'run') return;
    const preparationStarted = performance.now();
    let executionStarted = null;
    let memory = null;
    const start = () => {
      executionStarted = performance.now();
      send({ type: 'started', preparation: executionStarted - preparationStarted });
    };
    const finish = (type) => send({
      type,
      preparation: (executionStarted ?? performance.now()) - preparationStarted,
      execution: executionStarted === null ? null : performance.now() - executionStarted,
      memory,
    });
    const readLine = () => {
      const id = ++nextPrompt;
      send({ type: 'prompt', id, label: '', value: '', synchronous: true });
      const request = new XMLHttpRequest();
      request.open('GET', `${data.inputURL}${id}`, false);
      request.send();
      if (request.status !== 200) throw new Error('Interactive input was interrupted. Run again or select prepared input.');
      return JSON.parse(request.responseText).value;
    };
    const terminalFd = (OpenFile, File, flush) => {
      const fd = new OpenFile(new File(new Uint8Array()));
      let pending = new Uint8Array();
      let eof = false;
      fd.fd_read = (size) => {
        if (!size) return { ret: 0, data: new Uint8Array() };
        if (!pending.length && !eof) {
          flush();
          const line = readLine();
          eof = line === null;
          if (!eof) pending = new TextEncoder().encode(`${line}\n`);
        }
        const bytes = pending.slice(0, size);
        pending = pending.slice(bytes.length);
        return { ret: 0, data: bytes };
      };
      // WASI character-device stdin (type 2) is non-seekable (ERRNO_SPIPE 70),
      // so runtimes do not mistake the initially empty buffer for a regular file.
      const stat = fd.fd_fdstat_get.bind(fd);
      fd.fd_fdstat_get = () => { const value = stat(); value.fdstat.filetype = 2; return value; };
      const fileStat = fd.fd_filestat_get.bind(fd);
      fd.fd_filestat_get = () => { const value = fileStat(); value.filestat.filetype = 2; return value; };
      fd.fd_seek = () => ({ ret: 70, offset: 0n });
      return fd;
    };
    try {
      let code = data.code;
      if (data.language === 'python') {
        send({ type: 'loading' });
        importScripts(`${data.runtimeURL}pyodide.js`);
        const py = await self.loadPyodide({ indexURL: data.runtimeURL });
        const pythonStream = (kind) => {
          const decoder = new TextDecoder();
          let pending = '';
          return {
            write(bytes) {
              const lines = (pending + decoder.decode(bytes, { stream: true })).split('\n');
              pending = lines.pop().slice(0, 20000);
              for (const line of lines) write(kind, [line.replace(/\r$/, '')]);
              return bytes.length;
            },
            flush() { if (pending) write(kind, [pending]); pending = ''; },
          };
        };
        const stdout = pythonStream('log');
        const stderr = pythonStream('error');
        py.setStdout({ write: (bytes) => stdout.write(bytes) });
        py.setStderr({ write: (bytes) => stderr.write(bytes) });
        const inputLines = data.stdin.split(/\r?\n/);
        if (inputLines.at(-1) === '') inputLines.pop();
        let eof = false;
        py.setStdin({ isatty: Boolean(data.inputURL), stdin: () => {
          if (!data.inputURL) return inputLines.shift();
          stdout.flush(); stderr.flush();
          if (eof) return null;
          const value = readLine();
          eof = value === null;
          return value;
        } });
        start();
        try {
          const value = await py.runPythonAsync(code);
          if (value !== undefined && value !== null) write('result', [String(value)]);
          value?.destroy?.();
        } finally { stdout.flush(); stderr.flush(); }
      } else if (data.language === 'ruby') {
        send({ type: 'loading' });
        const { DefaultRubyVM, File, OpenFile, ConsoleStdout } = await import(data.runtimeModule);
        const response = await fetch(data.runtimeURL);
        if (!response.ok) throw new Error('Ruby runtime could not be fetched. Check your connection and try Run again.');
        const module = await WebAssembly.compileStreaming(response);
        const { vm, wasi } = await DefaultRubyVM(module, { consolePrint: false });
        // Decode across byte chunks, retain indentation and flush final print()
        // fragments even if a snippet fails without writing a newline.
        const stream = (kind) => {
          const decoder = new TextDecoder();
          let pending = '';
          const push = (text) => {
            const lines = text.split('\n');
            lines[0] = pending + lines[0];
            pending = lines.pop().slice(0, 20000);
            for (const line of lines) write(kind, [line.replace(/\r$/, '')]);
          };
          return {
            fd: new ConsoleStdout((bytes) => push(decoder.decode(bytes, { stream: true }))),
            flush: () => { push(decoder.decode()); if (pending) write(kind, [pending]); pending = ''; },
          };
        };
        const stdout = stream('log');
        const stderr = stream('error');
        wasi.fds[0] = data.inputURL
          ? terminalFd(OpenFile, File, () => { stdout.flush(); stderr.flush(); })
          : new OpenFile(new File(new TextEncoder().encode(data.stdin)));
        wasi.fds[1] = stdout.fd;
        wasi.fds[2] = stderr.fd;
        vm.eval('$stdout.sync = true; $stderr.sync = true');
        start();
        try { vm.eval(code); } finally { stdout.flush(); stderr.flush(); }
      } else if (data.language === 'c' || data.language === 'cpp') {
        send({ type: 'loading' });
        const { compile } = await import(data.runtimeURL);
        const { WASI, File, OpenFile, ConsoleStdout } = await import(data.runtimeModule);
        const { module, compileOutput } = await compile({
          source: code,
          fileName: data.language === 'c' ? 'main.c' : 'main.cpp',
          flags: data.language === 'c'
            ? ['--driver-mode=gcc', '-std=c17', '-O0']
            : ['-std=c++20', '-fno-exceptions', '-O0'],
        });
        for (const line of compileOutput.split('\n')) if (line.trim()) write('error', [line]);
        if (!module) throw new Error('Compilation failed. See the compiler output above.');
        // Decode across byte chunks and keep partial lines so a final printf()
        // without a newline still appears as its own row.
        const stream = (kind) => {
          const decoder = new TextDecoder();
          let pending = '';
          const push = (text) => {
            const lines = text.split('\n');
            lines[0] = pending + lines[0];
            pending = lines.pop().slice(0, 20000);
            for (const line of lines) write(kind, [line.replace(/\r$/, '')]);
          };
          return {
            fd: new ConsoleStdout((bytes) => push(decoder.decode(bytes, { stream: true }))),
            flush: () => { push(decoder.decode()); if (pending) write(kind, [pending]); pending = ''; },
          };
        };
        const stdout = stream('log');
        const stderr = stream('error');
        const wasi = new WASI([], [], [
          data.inputURL
            ? terminalFd(OpenFile, File, () => { stdout.flush(); stderr.flush(); })
            : new OpenFile(new File(new TextEncoder().encode(data.stdin))),
          stdout.fd,
          stderr.fd,
        ]);
        const instance = await WebAssembly.instantiate(module, { wasi_snapshot_preview1: wasi.wasiImport });
        start();
        try {
          const exitCode = wasi.start(instance);
          if (exitCode) throw new Error(`Program exited with status ${exitCode}.`);
        } finally {
          if (instance.exports.memory instanceof WebAssembly.Memory) memory = instance.exports.memory.buffer.byteLength;
          stdout.flush();
          stderr.flush();
        }
      } else {
        if (data.language === 'typescript') {
          send({ type: 'loading' });
          importScripts(data.runtimeURL);
          const ts = self.ts;
          const transpiled = ts.transpileModule(code, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
            reportDiagnostics: true,
          });
          const errors = transpiled.diagnostics.filter((item) => item.category === ts.DiagnosticCategory.Error);
          if (errors.length) {
            throw new Error(errors.map((item) => {
              const message = ts.flattenDiagnosticMessageText(item.messageText, '\n');
              const position = item.file && item.start !== undefined ? item.file.getLineAndCharacterOfPosition(item.start) : null;
              return position ? `Line ${position.line + 1}: ${message}` : message;
            }).join('\n'));
          }
          code = transpiled.outputText;
        }
        start();
        const fn = new Function('console', 'prompt', `"use strict"; return (async () => {\n${code}\n})();`);
        const value = await fn(console, prompt);
        if (value !== undefined) write('result', [value]);
      }
      finish('done');
    } catch (error) {
      write('error', [error]);
      finish('failed');
    }
  };
}

function clearOutput() {
  outputCount = 0;
  outputText = [];
  render([]);
}

function appendOutput(kind, text) {
  if (outputCount >= 500) return;
  if (!outputCount) els.output.replaceChildren();
  outputCount += 1;
  outputText.push(`${kind}: ${text}`);
  const row = document.createElement('div');
  row.className = `jsp-line jsp-${['warn', 'error', 'result'].includes(kind) ? kind : 'log'}`;
  const tag = document.createElement('span');
  tag.className = 'jsp-tag';
  tag.textContent = kind;
  const body = document.createElement('span');
  body.textContent = text;
  row.append(tag, body);
  els.output.append(row);
  els.output.scrollTop = els.output.scrollHeight;
  if (outputCount === 500) tk.setStatus(els.status, 'Output limited to 500 rows. Stop or run again to reset.', '');
}

function duration(ms) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function showMetrics(data = null, stopped = false) {
  if (!runTiming) return;
  const now = performance.now();
  const preparation = data?.preparation ?? runTiming.preparation ?? now - runTiming.requested;
  const execution = data ? data.execution : runTiming.started === null ? null : now - runTiming.started;
  const parts = [`Preparation: ${duration(preparation)}`];
  if (execution !== null && execution !== undefined) {
    const label = stopped ? 'Elapsed execution until Stop' : preparedInput ? 'Execution' : 'Main code';
    parts.push(`${label}: ${duration(execution)}`);
  }
  if (Number.isFinite(data?.memory)) parts.push(`WASM linear memory: ${(data.memory / 1048576).toFixed(2)} MiB`);
  els.metrics.textContent = parts.join(' · ');
}

function stop() {
  runGeneration++;
  if (bridgeSession) {
    bridgeSession.controller.postMessage({ type: 'close', token: bridgeSession.token });
    bridgeSession = null;
  }
  executionResumedAt = null;
  activeWorker?.terminate();
  activeWorker = null;
  clearTimeout(deadline);
  els.stop.disabled = true;
  els.inputForm.hidden = true;
  promptId = null;
}

function armExecutionDeadline() {
  clearTimeout(deadline);
  executionResumedAt = performance.now();
  deadline = setTimeout(() => {
    showMetrics(null, true);
    stop();
    tk.setStatus(els.status, 'Stopped at the 30-second execution limit. You can run again.', '');
  }, executionRemaining);
}

async function run() {
  clearTimeout(autoTimer);
  stop();
  clearOutput();
  runTiming = null;
  els.metrics.textContent = '';
  if (!els.code.value.trim()) {
    tk.setStatus(els.status, `Write ${languageName} first, then press Run.`, '');
    return;
  }
  runTiming = { requested: performance.now(), started: null, preparation: null };
  executionRemaining = 30000;
  const generation = runGeneration;
  const code = els.code.value;
  const stdin = els.stdin?.value || '';
  els.metrics.textContent = '';
  let url;
  if (els.inputMode?.value === 'interactive') {
    els.stop.disabled = false;
    tk.setStatus(els.status, 'Preparing local terminal input…', '');
    try {
      const session = await openInputBridge();
      if (generation !== runGeneration) {
        session.controller.postMessage({ type: 'close', token: session.token });
        return;
      }
      bridgeSession = session;
    } catch {
      if (generation !== runGeneration) return;
      stop();
      tk.setStatus(els.status, 'Interactive input could not start. Select Prepared standard input and Run again; your code is unchanged.', 'err');
      return;
    }
  }
  try {
    url = URL.createObjectURL(new Blob([`${format.toString()}\n(${workerMain.toString()})();`], { type: 'text/javascript' }));
    const worker = new Worker(url);
    activeWorker = worker;
    els.stop.disabled = false;
    tk.setStatus(els.status, language === 'javascript' ? 'Running…' : `Loading ${languageName} runtime from jsDelivr… Stop cancels loading.`, '');
    worker.onmessage = ({ data }) => {
      if (activeWorker !== worker) return;
      if (data.type === 'loading') tk.setStatus(els.status, `Loading ${languageName} runtime from jsDelivr… Stop cancels loading.`, '');
      if (data.type === 'started') {
        clearTimeout(deadline);
        runTiming.started = performance.now();
        runTiming.preparation = data.preparation;
        tk.setStatus(els.status, 'Running…', '');
        armExecutionDeadline();
      }
      if (data.type === 'line') appendOutput(data.kind, data.text);
      if (data.type === 'clear') clearOutput();
      if (data.type === 'prompt') {
        if (promptId !== null) {
          appendOutput('error', 'Use await prompt() sequentially, not concurrent prompts.');
          showMetrics(null, true);
          stop();
          tk.setStatus(els.status, 'Concurrent prompts are unsupported. Ask one question at a time, then Run again.', 'err');
          return;
        }
        if (executionResumedAt !== null) executionRemaining = Math.max(0, executionRemaining - (performance.now() - executionResumedAt));
        executionResumedAt = null;
        clearTimeout(deadline);
        deadline = setTimeout(() => {
          showMetrics(null, true);
          stop();
          tk.setStatus(els.status, 'Input wait timed out after 2 minutes. Run again when ready.', '');
        }, 120000);
        promptId = data.id;
        if (data.label) appendOutput('prompt', data.label);
        els.inputLabel.textContent = data.label || 'Terminal input';
        els.input.value = data.value;
        els.inputForm.hidden = false;
        els.input.focus();
        tk.setStatus(els.status, 'Waiting for input…', '');
      }
      if (data.type === 'done') {
        showMetrics(data);
        if (preparedInput) stop();
        tk.setStatus(els.status, preparedInput ? 'Finished.' : 'Main code finished. Timers stay live until Stop or the 30-second limit.', 'ok');
      }
      if (data.type === 'failed') {
        showMetrics(data);
        stop();
        tk.setStatus(els.status, 'Threw an error or could not load the runtime. Check the output, then run again.', 'err');
      }
    };
    worker.onerror = (event) => {
      if (activeWorker !== worker) return;
      appendOutput('error', event.message || 'Worker execution failed.');
      showMetrics(null, true);
      stop();
      tk.setStatus(els.status, 'Could not execute the snippet.', 'err');
    };
    deadline = setTimeout(() => {
      showMetrics(null, true);
      stop();
      tk.setStatus(els.status, 'Runtime loading timed out after 90 seconds. Check your connection and try Run again.', 'err');
    }, 90000);
    worker.postMessage({ type: 'run', language, runtimeURL: runtimeURLs[language], runtimeModule, code, stdin, inputURL: bridgeSession?.url || null });
  } catch {
    stop();
    tk.setStatus(els.status, 'This browser could not start a Web Worker. Check browser support or content security policy.', 'err');
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

function scheduleRun() {
  clearTimeout(autoTimer);
  if (els.auto.checked) {
    stop();
    autoTimer = setTimeout(run, 700);
  }
}

/* ----------------------------------------------------------------- actions */

els.run.addEventListener('click', run);
els.stop.addEventListener('click', () => {
  clearTimeout(autoTimer);
  if (activeWorker) showMetrics(null, true);
  stop();
  tk.setStatus(els.status, 'Stopped.', '');
});
els.auto.addEventListener('change', scheduleRun);
els.clearOutput.addEventListener('click', clearOutput);
els.copyOutput?.addEventListener('click', () => tk.copy(outputText.join('\n'), els.status));
function exampleOption(label, value) {
  const option = document.createElement('option');
  option.textContent = label;
  option.value = value;
  return option;
}
for (const category of new Set(exampleData.map((example) => example.category))) {
  els.category.add(exampleOption(category, category));
}
function updateExampleHint() {
  const example = els.example.value === '' ? null : exampleData[Number(els.example.value)];
  els.exampleHint.textContent = example ? example.hint : 'Choosing an example replaces code and input, and pauses Auto-run. Multiline code requires confirmation.';
}
els.category.addEventListener('change', () => {
  els.example.replaceChildren(exampleOption('Choose an example…', ''));
  exampleData.forEach((example, index) => {
    if (!els.category.value || example.category === els.category.value) els.example.add(exampleOption(example.name, String(index)));
  });
  selectedExample = '';
  updateExampleHint();
});
els.example.addEventListener('change', () => {
  const value = els.example.value;
  const example = value === '' ? null : exampleData[Number(value)];
  if (!example) {
    selectedExample = '';
    updateExampleHint();
    return;
  }
  const code = editor ? editor.getValue() : els.code.value;
  if (code.trimEnd().split(/\r\n|\r|\n/).length > 1 && !window.confirm('Loading this example will delete the existing code and replace standard input. Continue?')) {
    els.example.value = selectedExample;
    updateExampleHint();
    return;
  }
  selectedExample = value;
  loadExample(example);
  updateExampleHint();
});
function loadExample(example) {
  els.auto.checked = false;
  clearTimeout(autoTimer);
  stop();
  const code = `${example.code.trimEnd()}\n`;
  if (editor) editor.setValue(code);
  els.code.value = code;
  if (els.stdin) els.stdin.value = example.stdin || '';
  updateMeta();
  tk.setStatus(els.status, `${example.name} loaded. Press Run; Auto-run is paused.`, 'ok');
  if (editor) editor.focus(); else els.code.focus();
}
els.suggestions.addEventListener('change', () => {
  editor?.updateOptions({
    quickSuggestions: els.suggestions.checked,
    suggestOnTriggerCharacters: els.suggestions.checked,
    wordBasedSuggestions: els.suggestions.checked ? 'currentDocument' : 'off',
    tabCompletion: els.suggestions.checked ? 'on' : 'off',
  });
});
function sendInput(value) {
  if (!activeWorker || promptId === null) return;
  appendOutput('input', value === null ? '^D (EOF)' : value);
  if (bridgeSession) bridgeSession.controller.postMessage({ type: 'input', token: bridgeSession.token, id: promptId, value });
  else activeWorker.postMessage({ type: 'input', id: promptId, value });
  promptId = null;
  els.inputForm.hidden = true;
  armExecutionDeadline();
  tk.setStatus(els.status, 'Running…', '');
}
els.inputForm.addEventListener('submit', (event) => { event.preventDefault(); sendInput(els.input.value); });
els.eof.addEventListener('click', () => sendInput(null));
els.input.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === 'd') { event.preventDefault(); sendInput(null); }
});
window.addEventListener('pagehide', stop);
els.load.addEventListener('click', enableMonaco);

els.format.addEventListener('click', () => {
  if (!editor) {
    tk.setStatus(els.status, 'Enable Monaco to format.', '');
    return;
  }
  const action = preparedInput ? null : editor.getAction('editor.action.formatDocument');
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
  stop();
  if (editor) editor.setValue('');
  clearTimeout(autoTimer);
  els.code.value = '';
  if (els.stdin) els.stdin.value = '';
  selectedExample = '';
  els.example.value = '';
  updateExampleHint();
  runTiming = null;
  els.metrics.textContent = '';
  updateMeta();
  clearOutput();
  tk.setStatus(els.status, 'Cleared.', '');
});

// Ctrl/Cmd + Enter runs, the shortcut a console user expects.
els.code.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    run();
  }
});

els.code.addEventListener('input', () => { updateMeta(); scheduleRun(); });
els.stdin?.addEventListener('input', scheduleRun);
updateMeta();
render([]);
