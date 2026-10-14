export function format(value) {
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

// This function is serialized into a Blob; it must not depend on page globals.
export function workerMain() {
  const send = self.postMessage.bind(self);
  let count = 0;
  let nextPrompt = 0;
  const prompts = new Map();
  const write = (kind, args) => {
    if (++count > 500) return;
    send({ type: 'line', kind, text: args.map(format).join(' ').slice(0, 20000) });
  };
  // One streaming decoder for every byte-oriented runtime. Keep partial UTF-8
  // and lines until the next chunk, then flush unterminated print() output.
  const outputStream = (kind) => {
    const decoder = new TextDecoder();
    let pending = '';
    const push = (text) => {
      const lines = (pending + text).split('\n');
      pending = lines.pop().slice(0, 20000);
      for (const line of lines) write(kind, [line.replace(/\r$/, '')]);
    };
    return {
      write(bytes) { push(decoder.decode(bytes, { stream: true })); return bytes.length; },
      flush() { push(decoder.decode()); if (pending) write(kind, [pending]); pending = ''; },
    };
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
        const stdout = outputStream('log');
        const stderr = outputStream('error');
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
        const stdout = outputStream('log');
        const stderr = outputStream('error');
        wasi.fds[0] = data.inputURL
          ? terminalFd(OpenFile, File, () => { stdout.flush(); stderr.flush(); })
          : new OpenFile(new File(new TextEncoder().encode(data.stdin)));
        wasi.fds[1] = new ConsoleStdout(stdout.write);
        wasi.fds[2] = new ConsoleStdout(stderr.write);
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
        const stdout = outputStream('log');
        const stderr = outputStream('error');
        const wasi = new WASI([], [], [
          data.inputURL
            ? terminalFd(OpenFile, File, () => { stdout.flush(); stderr.flush(); })
            : new OpenFile(new File(new TextEncoder().encode(data.stdin))),
          new ConsoleStdout(stdout.write),
          new ConsoleStdout(stderr.write),
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
