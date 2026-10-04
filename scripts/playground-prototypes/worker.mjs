// Local feasibility probe, not a security sandbox or a production runner.
let execute;
let outputRows = 0;
const send = self.postMessage.bind(self);
const write = (kind, value) => {
  if (outputRows++ < 500) send({ type: 'output', kind, text: String(value).slice(0, 20000) });
};
const packageURL = (name, file) => new URL(`./node_modules/${name}/${file}`, import.meta.url).href;
const encoder = new TextEncoder();

async function initialize(language) {
  if (language === 'javascript' || language === 'typescript') {
    const ts = language === 'typescript'
      ? (await import('./node_modules/.cache/typescript.mjs')).default : null;
    execute = async (code, input) => {
      if (ts) {
        const result = ts.transpileModule(code, {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
          reportDiagnostics: true,
        });
        const errors = result.diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error);
        if (errors.length) throw new Error(errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
        code = result.outputText;
      }
      const lines = input.split('\n');
      const console = Object.fromEntries(['log', 'info', 'warn', 'error'].map((kind) => [
        kind, (...args) => write(kind, args.join(' ')),
      ]));
      send({ type: 'running' });
      // Execution is the purpose of this probe and is confined to a Worker.
      const fn = new Function('console', 'prompt', `return (async () => {\n${code}\n})();`);
      const result = await fn(console, async () => lines.shift() ?? '');
      if (result !== undefined) write('result', result);
    };
  } else if (language === 'python') {
    const { loadPyodide } = await import(packageURL('pyodide', 'pyodide.mjs'));
    const py = await loadPyodide({ indexURL: packageURL('pyodide', '') });
    py.setStdout({ batched: (text) => write('stdout', text) });
    py.setStderr({ batched: (text) => write('stderr', text) });
    execute = async (code, input) => {
      const lines = input.split('\n');
      py.setStdin({ stdin: () => lines.shift() });
      send({ type: 'running' });
      const result = await py.runPythonAsync(code);
      result?.destroy?.();
    };
  } else if (language === 'php') {
    const { PHP, loadPHPRuntime, loader } = await import('./node_modules/.cache/php.mjs');
    const runtime = await loadPHPRuntime(loader, {
      locateFile: (file) => new URL(file, new URL('./node_modules/.cache/', import.meta.url)).href,
    });
    const php = new PHP(runtime);
    execute = async (code, input) => {
      // The web SAPI has no CLI STDIN constant. Emulate prepared stdin with a file.
      php.writeFile('/input.txt', input);
      php.writeFile('/snippet.php', code);
      php.writeFile('/entry.php', "<?php define('STDIN', fopen('/input.txt', 'r')); require '/snippet.php';");
      send({ type: 'running' });
      const response = await php.run({ scriptPath: '/entry.php' });
      if (response.text) write('stdout', response.text);
      if (response.errors) write('stderr', response.errors);
      if (response.exitCode !== 0 || response.httpStatusCode >= 400) {
        throw new Error(`PHP failed (status ${response.exitCode}). See output.`);
      }
    };
  } else if (language === 'ruby') {
    const { DefaultRubyVM } = await import('./node_modules/.cache/ruby.mjs');
    const { File, OpenFile, ConsoleStdout } = await import(packageURL('@bjorn3/browser_wasi_shim', 'dist/index.js'));
    const response = await fetch(packageURL('@ruby/3.4-wasm-wasi', 'dist/ruby.wasm'));
    if (!response.ok) throw new Error('Ruby runtime could not be loaded.');
    const module = await WebAssembly.compileStreaming(response);
    const { vm, wasi } = await DefaultRubyVM(module, { consolePrint: false });
    wasi.fds[1] = ConsoleStdout.lineBuffered((text) => write('stdout', text));
    wasi.fds[2] = ConsoleStdout.lineBuffered((text) => write('stderr', text));
    vm.eval('$stdout.sync = true; $stderr.sync = true');
    execute = async (code, input) => {
      wasi.fds[0] = new OpenFile(new File(encoder.encode(input)));
      send({ type: 'running' });
      vm.eval(code);
    };
  } else if (language === 'c' || language === 'cpp') {
    const { compile } = await import(packageURL('browsercc', 'dist/index.js'));
    const { WASI, File, OpenFile, ConsoleStdout } = await import(packageURL('@bjorn3/browser_wasi_shim', 'dist/index.js'));
    execute = async (code, input) => {
      send({ type: 'compiling' });
      const result = await compile({
        source: code, fileName: language === 'c' ? 'main.c' : 'main.cpp',
        flags: language === 'c' ? ['--driver-mode=gcc', '-std=c17', '-O0'] : ['-std=c++20', '-fno-exceptions', '-O0'],
      });
      if (result.compileOutput) write('compiler', result.compileOutput);
      if (!result.module) throw new Error('Compilation failed. See compiler output.');
      const wasi = new WASI([], [], [
        new OpenFile(new File(encoder.encode(input))),
        new ConsoleStdout((bytes) => write('stdout', new TextDecoder().decode(bytes))),
        new ConsoleStdout((bytes) => write('stderr', new TextDecoder().decode(bytes))),
      ]);
      const instance = await WebAssembly.instantiate(result.module, { wasi_snapshot_preview1: wasi.wasiImport });
      send({ type: 'running' });
      const exitCode = wasi.start(instance);
      if (exitCode !== 0) throw new Error(`Program exited with status ${exitCode}.`);
    };
  } else {
    throw new Error(`No local adapter for ${language}.`);
  }
}

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      await initialize(data.language);
      send({ type: 'ready', isolated: self.crossOriginIsolated });
    } else if (data.type === 'run') {
      if (!execute) throw new Error('Initialize the runtime first.');
      outputRows = 0;
      await execute(data.code, data.input || '');
      send({ type: 'done' });
    }
  } catch (error) {
    send({ type: 'error', text: error?.stack || String(error) });
  }
};
