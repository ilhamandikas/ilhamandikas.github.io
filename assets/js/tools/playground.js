// Snippets run in a disposable worker, never in the page's execution context.
import { format, workerMain } from './playground/worker.js';
import { openInputBridge } from './playground/input-bridge.js';
import { createEditor } from './playground/editor.js';
import { createConsole } from './playground/console.js';
import { createExamples } from './playground/examples.js';
import { createTerminal } from './playground/terminal.js';

const { tk } = window;

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
  options: document.querySelector('#jsp-options'),
  replaceDialog: document.querySelector('#jsp-replace-dialog'),
  replaceName: document.querySelector('#jsp-replace-name'),
  send: document.querySelector('#jsp-send'),
  terminalHint: document.querySelector('#jsp-terminal-hint'),
};

const language = els.workspace?.dataset.language || 'javascript';
const languageName = els.workspace.dataset.languageName || language;
const preparedInput = ['python', 'ruby', 'c', 'cpp'].includes(language);
// Monaco has no separate C language; its `cpp` grammar covers C too.
const monacoLanguage = language === 'c' ? 'cpp' : language;
const runtimeModule = els.workspace?.dataset.runtimeModule
  ? new URL(els.workspace.dataset.runtimeModule, location.href).href : null;
const runtimeURLs = {
  typescript: 'https://cdn.jsdelivr.net/npm/typescript@5.9.3/lib/typescript.js',
  python: 'https://cdn.jsdelivr.net/pyodide/v0.28.2/full/',
  ruby: 'https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.10.1/dist/ruby.wasm',
  c: 'https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/index.js',
  cpp: 'https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/index.js',
};

let activeWorker = null;
let deadline = null;
let autoTimer = null;
let promptId = null;
let runTiming = null;
let bridgeSession = null;
let runGeneration = 0;
let executionRemaining = 30000;
let executionResumedAt = null;

const output = createConsole({ els, preparedInput });
const { clear: clearOutput, append: appendOutput } = output;
const showMetrics = (data = null, stopped = false) => output.metrics(runTiming, data, stopped);
const terminal = createTerminal({ els, onSend: sendInput });
const editor = createEditor({ els, languageName, monacoLanguage, preparedInput,
  onChange: () => { updateMeta(); scheduleRun(); }, onRun: run, onMeta: updateMeta });
const autoLabel = els.auto.closest('label');
const autoParent = autoLabel.parentElement;
const autoNext = autoLabel.nextSibling;
const full = tk.fullscreen({ workspace: els.workspace, button: els.fullscreen,
  hint: els.fullscreenHint, options: els.options,
  onResize: () => editor.instance?.layout(),
  onError: (message) => tk.setStatus(els.status, message, 'err'),
  onChange: (active) => {
    if (active) els.options.querySelector('.tool-workspace-options-body').append(autoLabel);
    else autoParent.insertBefore(autoLabel, autoNext);
  },
});
const examples = createExamples({ els, getCode: () => editor.instance?.getValue() ?? els.code.value, onLoad: (example) => {
  els.auto.checked = false;
  clearTimeout(autoTimer);
  stop();
  const code = `${example.code.trimEnd()}\n`;
  editor.instance?.setValue(code);
  els.code.value = code;
  if (els.stdin) els.stdin.value = example.stdin || '';
  terminal.reset({ clear: true });
  updateMeta();
  tk.setStatus(els.status, `${example.name} loaded. Press Run; Auto-run is paused.`, 'ok');
  if (full.active) els.options.open = false;
  if (editor.instance) editor.instance.focus(); else els.code.focus();
} });

function updateMeta() {
  const value = els.code.value;
  const lines = value ? value.split('\n').length : 0;
  els.meta.textContent = `${lines} line${lines === 1 ? '' : 's'} · ${value.length} chars`;
}

function updateInputMode() {
  if (els.stdinField) els.stdinField.hidden = els.inputMode.value !== 'prepared';
  terminal.reset();
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
  terminal.reset();
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
      const session = await openInputBridge(new URL(els.workspace.dataset.inputWorkerUrl, location.href).href);
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
        terminal.wait(data);
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

function sendInput(value) {
  if (!activeWorker || promptId === null) return false;
  appendOutput('input', value === null ? '^D (EOF)' : value);
  if (bridgeSession) bridgeSession.controller.postMessage({ type: 'input', token: bridgeSession.token, id: promptId, value });
  else activeWorker.postMessage({ type: 'input', id: promptId, value });
  promptId = null;
  armExecutionDeadline();
  tk.setStatus(els.status, 'Running…', '');
  return true;
}
els.run.addEventListener('click', run);
els.stop.addEventListener('click', () => {
  clearTimeout(autoTimer);
  if (activeWorker) showMetrics(null, true);
  stop();
  tk.setStatus(els.status, 'Stopped.', '');
});
els.auto.addEventListener('change', scheduleRun);
els.clear.addEventListener('click', () => {
  stop();
  editor.instance?.setValue('');
  clearTimeout(autoTimer);
  els.code.value = '';
  if (els.stdin) els.stdin.value = '';
  terminal.reset({ clear: true });
  examples.reset();
  runTiming = null;
  els.metrics.textContent = '';
  updateMeta();
  clearOutput();
  tk.setStatus(els.status, 'Cleared.', '');
});
els.stdin?.addEventListener('input', scheduleRun);
window.addEventListener('pagehide', stop);
updateMeta();
