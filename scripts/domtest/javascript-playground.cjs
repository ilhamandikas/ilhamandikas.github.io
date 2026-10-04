// Worker-thread adapter tests the actual serialized runner; not a browser layout test.
const { JSDOM } = require('jsdom');
const { Worker } = require('node:worker_threads');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'public/tools/javascript-playground/index.html'), 'utf8'), { runScripts: 'outside-only' });
const w = dom.window;
w.tk = { setStatus: (el, message) => { el.textContent = message; } };
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
w.eval(fs.readFileSync(path.join(root, 'assets/js/tools/javascript-playground.js'), 'utf8'));
const el = (id) => w.document.querySelector(`#jsp-${id}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(test) {
  for (let i = 0; i < 100; i++) { if (test()) return; await sleep(20); }
  throw new Error('Timed out waiting for playground state');
}
function run(code) { el('code').value = code; el('run').click(); }
(async () => {
  run("console.log('first'); await new Promise(r => setTimeout(r, 300)); return 42;");
  await until(() => el('output').textContent.includes('first'));
  assert(!el('output').textContent.includes('42'));
  await until(() => el('output').textContent.includes('42'));
  run("const name = await prompt('Name?', 'Ilham'); console.log(name); return 'done';");
  await until(() => !el('input-form').hidden);
  assert.equal(el('input-label').textContent, 'Name?');
  el('input').value = '<img src=x onerror=alert(1)>';
  el('input-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  await until(() => el('output').textContent.includes('done'));
  assert.equal(el('output').querySelector('img'), null);
  run("throw new Error('boom')");
  await until(() => el('status').textContent.includes('Threw'));
  assert(el('output').textContent.includes('boom'));
  run("return typeof document;");
  await until(() => el('output').textContent.includes('undefined'));
  run('while (true) {}');
  await sleep(100);
  el('stop').click();
  assert.equal(el('stop').disabled, true);
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
  el('code').value = "console.log('keep me');";
  el('auto').checked = true;
  const examples = JSON.parse(el('examples').textContent);
  const pyramidIndex = examples.findIndex((item) => item.name === 'Centered pyramid');
  w.document.querySelector(`[data-jsp-example="${pyramidIndex}"]`).click();
  assert(el('code').value.includes("console.log('keep me');"));
  assert.equal(el('auto').checked, false);
  await sleep(800);
  assert.equal(el('output').textContent, '(no output)');
  el('clear').click();
  w.document.querySelector(`[data-jsp-example="${pyramidIndex}"]`).click();
  el('run').click();
  await until(() => el('status').textContent.includes('Ran in'));
  assert.deepEqual([...el('output').querySelectorAll('.jsp-line > span:last-child')].map((row) => row.textContent), ['    *', '   ***', '  *****', ' *******', '*********']);
  run("await Promise.all([prompt('one'), prompt('two')]);");
  await until(() => el('status').textContent.includes('Concurrent prompts'));
  assert.equal(el('input-form').hidden, true);
  assert.equal(el('stop').disabled, true);
  console.log('PASS JavaScript playground: streaming, prompt/error recovery, DOM isolation, infinite-loop stop, timers, clear, auto-run and non-destructive pyramid examples');
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => { el('stop').click(); w.close(); });
