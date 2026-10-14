const CDN = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';
// Monaco resolves worker ids like `vs/.../tsWorker.js` against `baseUrl`, so it
// must be the directory that contains `vs/`.
const BASE = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min';

function suggestionOptions(enabled) {
  return { quickSuggestions: enabled, suggestOnTriggerCharacters: enabled,
    wordBasedSuggestions: enabled ? 'currentDocument' : 'off', tabCompletion: enabled ? 'on' : 'off' };
}

export function createEditor({ els, languageName, monacoLanguage, preparedInput, onChange, onRun, onMeta }) {
  const { tk } = window;
  let editor = null;
  let loading = false;
  function syncToTextarea() { els.code.value = editor.getValue(); onChange(); }
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
        const inputStyle = window.getComputedStyle(els.code);
        editor = window.monaco.editor.create(els.container, {
          value: els.code.value,
          language: monacoLanguage,
          ariaLabel: `${languageName} code`,
          theme: 'vs',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: Number.parseFloat(inputStyle.fontSize) || undefined,
          fontFamily: inputStyle.fontFamily || undefined,
          tabSize: 2,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          padding: { top: Number.parseFloat(inputStyle.paddingTop) || 0, bottom: Number.parseFloat(inputStyle.paddingBottom) || 0 },
          folding: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true, highlightActiveIndentation: true },
          renderLineHighlight: 'all',
          occurrencesHighlight: 'singleFile',
          colorDecorators: true,
          stickyScroll: { enabled: true },
          unicodeHighlight: { ambiguousCharacters: true, invisibleCharacters: true },
          ...suggestionOptions(els.suggestions.checked),
          acceptSuggestionOnEnter: 'smart',
          renderValidationDecorations: 'on',
          cursorSmoothCaretAnimation: 'off',
          smoothScrolling: false,
          lineNumbersMinChars: 3,
        });
        editor.onDidChangeModelContent(syncToTextarea);
        // Ctrl/Cmd + Enter keeps working once the text area is hidden.
        editor.addCommand(window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter, onRun);
        els.code.hidden = true;
        els.container.hidden = false;
        els.load.textContent = 'Monaco ready';
        els.badge.textContent = 'Monaco';
        els.badge.classList.add('is-on');
        tk.setStatus(els.status, 'Monaco editor ready.', 'ok');
        onMeta();
      })
      .catch((error) => {
        loading = false;
        els.load.disabled = false;
        tk.setStatus(els.status, `${error.message} The plain editor still works.`, '');
      });
  }

  els.suggestions.addEventListener('change', () => {
    editor?.updateOptions(suggestionOptions(els.suggestions.checked));
  });
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

  els.code.addEventListener('input', onChange);
  els.code.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); onRun(); }
  });
  return { get instance() { return editor; } };
}
