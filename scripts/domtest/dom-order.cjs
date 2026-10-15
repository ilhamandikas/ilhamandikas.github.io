const { JSDOM } = require('jsdom');
const { buildSync } = require('esbuild');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '../..');
for (const file of ['assets/js/dom-order.js', 'assets/js/tools-nav.js', 'assets/js/tools-catalog.js',
  'assets/js/tools/hash-text.js', 'assets/js/tools/case-converter.js',
  'layouts/partials/tools/body/json-diff.html', 'layouts/partials/tools/body/text-diff.html', 'layouts/partials/tools/body/csv-viewer.html']) {
  assert(!/\.style\s*[.\[]|\bstyle\s*=|<style\b/.test(fs.readFileSync(path.join(root, file), 'utf8')), `${file} must not author inline CSS`);
}
const dom = new JSDOM('<h2>Heading</h2><section id="first"><button id="a">A</button> text <button id="b">B</button></section><section id="second"><button id="c">C</button></section><ul id="results"></ul>', { runScripts: 'outside-only' });
const w = dom.window;
w.eval(buildSync({ entryPoints: [path.resolve(__dirname, '../../assets/js/dom-order.js')], bundle: true, format: 'iife', globalName: 'ordering', write: false }).outputFiles[0].text);
const nodes = ['a', 'b', 'c'].map((id) => w.document.getElementById(id));
const order = w.ordering.createDomOrder(nodes);
const results = w.document.getElementById('results');
nodes[0].focus();
order.set([nodes[2], nodes[0]], results);
assert.deepEqual([...results.children].map((node) => node.id), ['c', 'a']);
assert.equal(w.document.activeElement, nodes[0]);
for (let i = 0; i < 20; i++) {
  order.restore();
  assert.deepEqual([...w.document.querySelectorAll('section button')].map((node) => node.id), ['a', 'b', 'c']);
  assert.equal(w.document.getElementById('first').textContent, 'A text B');
  order.set([nodes[1], nodes[0]]);
  assert.deepEqual([...w.document.getElementById('first').children].map((node) => node.id), ['b', 'a']);
}
order.restore();
assert.equal(w.document.querySelectorAll('[style]').length, 0);
assert.equal(w.document.activeElement, nodes[0]);
dom.window.close();
console.log('PASS DOM ordering: ranking, original parents/siblings, repeated restore, focus, and no inline CSS');
