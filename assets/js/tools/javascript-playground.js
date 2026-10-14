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
  stdin: document.querySelector('#jsp-stdin'),
  workspace: document.querySelector('#jsp-workspace'),
  copyOutput: document.querySelector('#jsp-copy-output'),
  metrics: document.querySelector('#jsp-metrics'),
  category: document.querySelector('#jsp-category'),
  example: document.querySelector('#jsp-example'),
  exampleHint: document.querySelector('#jsp-example-hint'),
  exampleLoad: document.querySelector('#jsp-example-load'),
  exampleConfirm: document.querySelector('#jsp-example-confirm'),
  exampleReplace: document.querySelector('#jsp-example-replace'),
  exampleCancel: document.querySelector('#jsp-example-cancel'),
  suggestions: document.querySelector('#jsp-suggestions'),
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
let baselineCode = els.code.value;
let baselineInput = els.stdin?.value || '';
let pendingExample = null;

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
        defaults.addExtraLib('declare function prompt(message?: string, value?: string): Promise<string>;\n', 'ts:playground-globals.d.ts');
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
    try {
      let code = data.code;
      if (data.language === 'python') {
        send({ type: 'loading' });
        importScripts(`${data.runtimeURL}pyodide.js`);
        const py = await self.loadPyodide({ indexURL: data.runtimeURL });
        py.setStdout({ batched: (text) => write('log', [text]) });
        py.setStderr({ batched: (text) => write('error', [text]) });
        const inputLines = data.stdin.split(/\r?\n/);
        if (inputLines.at(-1) === '') inputLines.pop();
        py.setStdin({ stdin: () => inputLines.shift() });
        start();
        const value = await py.runPythonAsync(code);
        if (value !== undefined && value !== null) write('result', [String(value)]);
        value?.destroy?.();
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
        wasi.fds[0] = new OpenFile(new File(new TextEncoder().encode(data.stdin)));
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
          new OpenFile(new File(new TextEncoder().encode(data.stdin))),
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
  activeWorker?.terminate();
  activeWorker = null;
  clearTimeout(deadline);
  els.stop.disabled = true;
  els.inputForm.hidden = true;
  promptId = null;
}

function run() {
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
  els.metrics.textContent = '';
  let url;
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
        deadline = setTimeout(() => {
          showMetrics(null, true);
          stop();
          tk.setStatus(els.status, 'Stopped at the 30-second execution limit. You can run again.', '');
        }, 30000);
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
        promptId = data.id;
        els.inputLabel.textContent = data.label;
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
    worker.postMessage({ type: 'run', language, runtimeURL: runtimeURLs[language], runtimeModule, code: els.code.value, stdin: els.stdin?.value || '' });
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
function previewExample() {
  pendingExample = null;
  els.exampleConfirm.hidden = true;
  const example = els.example.value === '' ? null : exampleData[Number(els.example.value)];
  els.exampleLoad.disabled = !example;
  els.exampleHint.textContent = example ? example.hint : 'Choose an example. Loading replaces the code and input, and pauses Auto-run.';
}
els.category.addEventListener('change', () => {
  els.example.replaceChildren(exampleOption('Choose an example…', ''));
  exampleData.forEach((example, index) => {
    if (!els.category.value || example.category === els.category.value) els.example.add(exampleOption(example.name, String(index)));
  });
  previewExample();
});
els.example.addEventListener('change', previewExample);
function loadExample(example) {
  els.auto.checked = false;
  clearTimeout(autoTimer);
  stop();
  const code = `${example.code.trimEnd()}\n`;
  if (editor) editor.setValue(code);
  els.code.value = code;
  if (els.stdin) els.stdin.value = example.stdin || '';
  baselineCode = code;
  baselineInput = els.stdin?.value || '';
  pendingExample = null;
  els.exampleConfirm.hidden = true;
  updateMeta();
  tk.setStatus(els.status, `${example.name} loaded. Press Run; Auto-run is paused.`, 'ok');
  if (editor) editor.focus(); else els.code.focus();
}
els.exampleLoad.addEventListener('click', () => {
  if (els.example.value === '') return;
  const example = exampleData[Number(els.example.value)];
  if (!example) return;
  if (els.code.value !== baselineCode || (els.stdin?.value || '') !== baselineInput) {
    pendingExample = example;
    els.exampleConfirm.hidden = false;
    els.exampleCancel.focus();
  } else loadExample(example);
});
els.exampleReplace.addEventListener('click', () => { if (pendingExample) loadExample(pendingExample); });
els.exampleCancel.addEventListener('click', () => {
  pendingExample = null;
  els.exampleConfirm.hidden = true;
  els.exampleLoad.focus();
});
els.suggestions.addEventListener('change', () => {
  editor?.updateOptions({
    quickSuggestions: els.suggestions.checked,
    suggestOnTriggerCharacters: els.suggestions.checked,
    wordBasedSuggestions: els.suggestions.checked ? 'currentDocument' : 'off',
    tabCompletion: els.suggestions.checked ? 'on' : 'off',
  });
});
els.inputForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!activeWorker || promptId === null) return;
  activeWorker.postMessage({ type: 'input', id: promptId, value: els.input.value });
  promptId = null;
  els.inputForm.hidden = true;
  tk.setStatus(els.status, 'Running…', '');
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
  baselineCode = '';
  baselineInput = '';
  pendingExample = null;
  els.exampleConfirm.hidden = true;
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
