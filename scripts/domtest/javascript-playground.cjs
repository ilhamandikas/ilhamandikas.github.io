// Worker-thread adapter tests the actual serialized runner; not a browser layout test.
const { JSDOM } = require('jsdom');
const { Worker } = require('node:worker_threads');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'public/tools/javascript-playground/index.html'), 'utf8'), { runScripts: 'outside-only' });
const w = dom.window;
const { mockDialogs } = require('./browser-stubs.cjs');
const { buildSync } = require('esbuild');
const bundle = (entry) => buildSync({ entryPoints: [path.join(root, entry)], bundle: true, format: 'iife', write: false }).outputFiles[0].text;
const toolkitSource = bundle('assets/js/toolkit.js');
const playgroundSource = bundle('assets/js/tools/javascript-playground.js');
function setupToolkit(window) { mockDialogs(window); window.eval(toolkitSource); }
setupToolkit(w);
const sources = new Map();
let next = 0;
w.Blob = class { constructor(parts) { this.source = parts.join(''); } };
w.URL.createObjectURL = (blob) => { const id = `blob:${++next}`; sources.set(id, blob.source); return id; };
w.URL.revokeObjectURL = (id) => sources.delete(id);
w.Worker = class {
  constructor(url) {
    this.worker = new Worker(`const { parentPort } = require('node:worker_threads');
      global.self = global;
      self.postMessage = (data) => parentPort.postMessage(data);
      self.addEventListener = () => {};
      ${sources.get(url)}
      parentPort.on('message', (data) => self.onmessage({ data }));`, { eval: true });
    this.worker.on('message', (data) => this.onmessage?.({ data }));
    this.worker.on('error', (error) => this.onerror?.({ message: error.message }));
  }
  postMessage(data) { this.worker.postMessage(data); }
  terminate() { this.worker.terminate(); }
};
w.eval(playgroundSource);
const el = (id) => w.document.querySelector(`#jsp-${id}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(test) {
  for (let i = 0; i < 100; i++) { if (test()) return; await sleep(20); }
  throw new Error('Timed out waiting for playground state');
}
function run(code) { el('code').value = code; el('run').click(); }
(async () => {
  for (const file of ['assets/js/toolkit.js', 'assets/js/tool-ui.js', 'assets/js/tools/javascript-playground.js',
    ...fs.readdirSync(path.join(root, 'assets/js/tools/playground')).map((name) => `assets/js/tools/playground/${name}`)]) {
    assert(!/\.style\s*[.\[]|setAttribute\(\s*['"]style['"]/.test(fs.readFileSync(path.join(root, file), 'utf8')), `${file} must not author inline CSS`);
  }
  assert(!/\bstyle\s*=|<style\b/.test(fs.readFileSync(path.join(root, 'layouts/partials/tools/playground.html'), 'utf8')));
  assert(!/\.tool-fullscreen\s+\.btn/.test(fs.readFileSync(path.join(root, 'assets/css/components/tool-workspace.css'), 'utf8')));
  assert.equal(el('input-form').hidden, false);
  assert.equal(el('send').disabled, true);
  el('input').focus();
  assert.equal(w.document.activeElement, el('input'));
  el('input').value = 'Draft café 😀';
  el('input-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  assert.equal(el('input').value, 'Draft café 😀');
  run("await new Promise(r => setTimeout(r, 50)); return await prompt('Draft?');");
  await until(() => !el('send').disabled);
  assert.equal(el('input').value, 'Draft café 😀');
  el('input-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  await until(() => el('output').textContent.includes('resultDraft café 😀'));
  assert.equal(el('input').value, '');
  el('stop').click();
  run("console.log('first'); await new Promise(r => setTimeout(r, 300)); return 42;");
  await until(() => el('output').textContent.includes('first'));
  assert(!el('output').textContent.includes('42'));
  await until(() => el('output').textContent.includes('42'));
  await until(() => el('metrics').textContent.includes('Main code:'));
  assert(el('metrics').textContent.includes('Preparation:'));
  assert(!el('metrics').textContent.includes('memory'));
  const elapsed = Number(el('metrics').textContent.match(/Main code: (\d+) ms/)[1]);
  assert(elapsed >= 250 && elapsed < 2000);
  run("const name = await prompt('Name?', 'Ilham'); console.log(name); return 'done';");
  await until(() => !el('send').disabled);
  assert.equal(el('input-label').textContent, 'Name?');
  el('input').value = '<img src=x onerror=alert(1)>';
  el('input-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  await until(() => el('output').textContent.includes('done'));
  assert.equal(el('output').querySelector('img'), null);
  run("return await prompt('EOF?');");
  await until(() => !el('send').disabled);
  el('eof').click();
  await until(() => el('output').textContent.includes('resultnull'));
  assert(el('output').textContent.includes('^D (EOF)'));
  run("console.log('blank:', JSON.stringify(await prompt('Blank?'))); console.log(await prompt('Unicode?'));");
  await until(() => !el('send').disabled);
  el('input').value = '';
  el('input-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  await until(() => el('input-label').textContent === 'Unicode?');
  el('input').value = 'café 😀';
  el('input-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  await until(() => [...el('output').querySelectorAll('.tool-console-line')].some((row) => row.querySelector('.tool-console-tag')?.textContent === 'log' && row.textContent.includes('café 😀')));
  assert(el('output').textContent.includes('blank: ""'));
  run("throw new Error('boom')");
  await until(() => el('status').textContent.includes('Threw'));
  assert(el('output').textContent.includes('boom'));
  run("return typeof document;");
  await until(() => el('output').textContent.includes('undefined'));
  run('while (true) {}');
  await sleep(100);
  el('stop').click();
  assert.equal(el('stop').disabled, true);
  assert(el('metrics').textContent.includes('Elapsed execution until Stop:'));
  run("setTimeout(() => console.log('late'), 100); return 'early';");
  await until(() => el('output').textContent.includes('late'));
  el('clear-output').click();
  assert.equal(el('output').textContent, '(no output)');
  assert(el('code').value.includes('setTimeout'));
  el('auto').checked = true;
  el('code').value = "return 'automatic';";
  el('code').dispatchEvent(new w.Event('input'));
  await until(() => el('output').textContent.includes('automatic'));
  el('clear').click();
  assert.equal(el('code').value, '');
  el('code').value = "console.log('keep me');\nreturn 1;";
  el('auto').checked = true;
  const examples = JSON.parse(el('examples').textContent);
  const pyramidIndex = examples.findIndex((item) => item.name === 'Centered pyramid');
  w.confirm = () => assert.fail('Do not use the unstyled browser confirmation');
  el('example').value = String(pyramidIndex);
  el('example').dispatchEvent(new w.Event('change'));
  assert.equal(el('replace-dialog').open, true);
  assert.equal(el('replace-name').textContent, examples[pyramidIndex].name);
  assert.equal(w.document.activeElement, el('replace-cancel'));
  el('replace-cancel').click();
  assert.equal(el('replace-dialog').open, false);
  assert.equal(el('example').value, '');
  assert.equal(el('code').value, "console.log('keep me');\nreturn 1;");
  assert.equal(el('auto').checked, true);
  el('example').value = String(pyramidIndex);
  el('example').dispatchEvent(new w.Event('change'));
  assert.equal(el('replace-dialog').open, true);
  el('replace-accept').click();
  await sleep(0);
  assert.equal(el('replace-dialog').open, false);
  assert(!el('code').value.includes("console.log('keep me');"));
  assert.equal(el('auto').checked, false);
  await sleep(800);
  assert.equal(el('output').textContent, '(no output)');
  el('clear').click();
  el('code').value = "console.log('one line');\n";
  el('example').value = String(pyramidIndex);
  el('example').dispatchEvent(new w.Event('change'));
  assert.equal(el('replace-dialog').open, false);
  assert.equal(el('code').value, `${examples[pyramidIndex].code.trimEnd()}\n`);
  el('run').click();
  await until(() => el('status').textContent.includes('Main code finished'));
  assert.deepEqual([...el('output').querySelectorAll('.tool-console-line > span:last-child')].map((row) => row.textContent), ['    *', '   ***', '  *****', ' *******', '*********']);
  run("await Promise.all([prompt('one'), prompt('two')]);");
  await until(() => el('status').textContent.includes('Concurrent prompts'));
  assert.equal(el('input-form').hidden, false);
  assert.equal(el('send').disabled, true);
  assert.equal(el('stop').disabled, true);
  el('category').value = examples[pyramidIndex].category;
  el('category').dispatchEvent(new w.Event('change'));
  assert.equal(el('example').value, '');
  for (const option of [...el('example').options].slice(1)) assert.equal(examples[Number(option.value)].category, el('category').value);
  el('category').value = '';
  el('category').dispatchEvent(new w.Event('change'));
  assert.equal(el('example').options.length, examples.length + 1);
  run('');
  assert.equal(el('metrics').textContent, '');

  for (const lang of ['typescript', 'python', 'ruby', 'c', 'cpp']) {
    const other = new JSDOM(fs.readFileSync(path.join(root, `public/tools/${lang}-playground/index.html`), 'utf8'), { runScripts: 'outside-only', url: `https://example.com/tools/${lang}-playground/` });
    const window = other.window;
    setupToolkit(window);
    const field = (id) => window.document.querySelector(`#jsp-${id}`);
    let worker;
    window.URL.createObjectURL = () => 'blob:test';
    window.URL.revokeObjectURL = () => {};
    window.Worker = class {
      constructor() { worker = this; }
      postMessage() {}
      terminate() {}
    };
    window.eval(playgroundSource);
    if (field('input-mode')) {
      assert.equal(field('input-mode').value, 'prepared');
      assert.equal(field('stdin-field').hidden, false);
      assert.equal(field('input-mode').querySelector('[value="interactive"]').disabled, true);
    }
    const items = JSON.parse(field('examples').textContent);
    const sample = items.findIndex((item) => item.stdin);
    if (sample >= 0) {
      field('stdin').value = 'my answer';
      const originalCode = field('code').value;
      field('example').value = String(sample);
      field('example').dispatchEvent(new window.Event('change'));
      assert.equal(field('replace-dialog').open, true);
      field('replace-cancel').click();
      assert.equal(field('example').value, '');
      assert.equal(field('code').value, originalCode);
      assert.equal(field('stdin').value, 'my answer');
      field('example').value = String(sample);
      field('example').dispatchEvent(new window.Event('change'));
      field('replace-accept').click();
      await sleep(0);
      assert.equal(field('stdin').value, items[sample].stdin);
      assert.equal(field('code').value, `${items[sample].code.trimEnd()}\n`);
    }
    field('run').click();
    worker.onmessage({ data: { type: 'started', preparation: 1500 } });
    worker.onmessage({ data: { type: 'done', preparation: 1500, execution: 125, memory: ['c', 'cpp'].includes(lang) ? 33554432 : null } });
    assert(field('metrics').textContent.includes('Preparation: 1.50 s'));
    assert(field('metrics').textContent.includes(lang === 'typescript' ? 'Main code: 125 ms' : 'Execution: 125 ms'));
    assert.equal(field('metrics').textContent.includes('WASM linear memory: 32.00 MiB'), ['c', 'cpp'].includes(lang));
    field('stop').click();
    field('run').click();
    worker.onmessage({ data: { type: 'failed', preparation: 500, execution: null, memory: null } });
    assert.equal(field('metrics').textContent, 'Preparation: 500 ms');
    assert.equal(field('stop').disabled, true);
    other.window.close();
  }

  // Full-size fallback keeps state and restores focus and surrounding controls.
  const outside = w.document.createElement('button');
  w.document.body.append(outside);
  const alreadyInert = w.document.createElement('div');
  alreadyInert.setAttribute('inert', '');
  w.document.body.append(alreadyInert);
  el('code').focus();
  const beforeFullscreen = el('code').value;
  assert.equal(el('options').open, true);
  el('fullscreen').click();
  assert(el('workspace').classList.contains('tool-fullscreen'));
  assert(w.document.body.classList.contains('tool-focus-open'));
  assert.equal(el('fullscreen').textContent, 'Exit full screen');
  assert.equal(el('fullscreen').getAttribute('aria-pressed'), 'true');
  assert.equal(el('options').open, false);
  w.innerHeight = 600;
  w.dispatchEvent(new w.Event('resize'));
  assert.equal(el('workspace').getAttribute('style'), null);
  el('options').open = true;
  el('options').querySelector('summary').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(el('options').open, false);
  assert(el('workspace').classList.contains('tool-fullscreen'));
  assert(outside.hasAttribute('inert'));
  assert.equal(w.document.activeElement, el('options').querySelector('summary'));
  el('fullscreen').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert(!el('workspace').classList.contains('tool-fullscreen'));
  assert.equal(el('options').open, true);
  assert.equal(el('workspace').getAttribute('style'), null);
  assert(!outside.hasAttribute('inert'));
  assert(alreadyInert.hasAttribute('inert'));
  assert.equal(w.document.activeElement, el('code'));
  assert.equal(el('code').value, beforeFullscreen);

  let fullscreenElement = null;
  Object.defineProperty(w.document, 'fullscreenElement', { get: () => fullscreenElement });
  el('workspace').requestFullscreen = async () => {
    fullscreenElement = el('workspace');
    w.document.dispatchEvent(new w.Event('fullscreenchange'));
  };
  w.document.exitFullscreen = async () => {
    fullscreenElement = null;
    w.document.dispatchEvent(new w.Event('fullscreenchange'));
  };
  el('fullscreen').click();
  await sleep(0);
  assert.equal(fullscreenElement, el('workspace'));
  el('fullscreen').click();
  await sleep(0);
  assert.equal(fullscreenElement, null);
  assert.equal(el('fullscreen').getAttribute('aria-pressed'), 'false');
  el('fullscreen').click();
  await sleep(0);
  fullscreenElement = null;
  w.document.dispatchEvent(new w.Event('fullscreenchange'));
  assert(!el('workspace').classList.contains('tool-fullscreen'));
  el('workspace').requestFullscreen = async () => { throw new Error('Denied'); };
  el('fullscreen').click();
  await sleep(0);
  assert(el('workspace').classList.contains('tool-fullscreen'));
  assert.equal(el('fullscreen').disabled, false);
  el('fullscreen').click();
  await sleep(0);
  assert(!outside.hasAttribute('inert'));
  outside.remove();
  alreadyInert.remove();

  // Verify the on-demand Monaco configuration without downloading its CDN bundle.
  const defaults = () => ({
    diagnostics: null, compiler: {}, libs: [],
    setDiagnosticsOptions(value) { this.diagnostics = value; },
    getCompilerOptions() { return this.compiler; },
    setCompilerOptions(value) { this.compiler = value; },
    addExtraLib(value) { this.libs.push(value); },
  });
  const jsDefaults = defaults();
  const tsDefaults = defaults();
  let options;
  const mockEditor = {
    getValue: () => el('code').value,
    onDidChangeModelContent() {}, addCommand() {}, layout() {},
    updateOptions(value) { Object.assign(options, value); },
  };
  w.monaco = {
    languages: { typescript: { javascriptDefaults: jsDefaults, typescriptDefaults: tsDefaults, ScriptTarget: { ES2022: 9 } } },
    editor: { create(container, value) { options = value; return mockEditor; } },
    KeyMod: { CtrlCmd: 1 }, KeyCode: { Enter: 2 },
  };
  w.require = (modules, resolve) => resolve();
  w.require.config = () => {};
  el('load').click();
  await until(() => el('badge').textContent === 'Monaco');
  assert.equal(options.quickSuggestions, true);
  assert.equal(options.wordBasedSuggestions, 'currentDocument');
  assert.equal(jsDefaults.compiler.checkJs, true);
  assert.deepEqual([...jsDefaults.compiler.lib], ['es2022', 'webworker']);
  assert.equal(tsDefaults.diagnostics.noSemanticValidation, false);
  assert(jsDefaults.libs[0].includes('Promise<string | null>'));
  el('suggestions').checked = false;
  el('suggestions').dispatchEvent(new w.Event('change'));
  assert.equal(options.quickSuggestions, false);
  assert.equal(options.wordBasedSuggestions, 'off');
  el('suggestions').checked = true;
  el('suggestions').dispatchEvent(new w.Event('change'));
  assert.equal(options.tabCompletion, 'on');
  console.log('PASS JavaScript playground: execution, timing, isolation, automatic examples, fullscreen/fallback recovery, and Monaco suggestion/diagnostic configuration');
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => { el('stop').click(); w.close(); });
