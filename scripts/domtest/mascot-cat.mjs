import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createMascotCatPass } from '../../assets/js/mascot-cat.js';

const dom = new JSDOM('<div id="cat" hidden></div>');
const cat = dom.window.document.querySelector('#cat');
const pending = new Map();
let nextId = 0;
const environment = {
  setTimeout(callback, delay) { const id = ++nextId; pending.set(id, { callback, delay }); return id; },
  clearTimeout(id) { pending.delete(id); },
};
function fire(delay) {
  const entry = [...pending].find(([, task]) => task.delay === delay);
  assert.ok(entry, `expected a ${delay}ms timer`);
  pending.delete(entry[0]);
  entry[1].callback();
}
let allowed = true;
let blocked = false;
const pass = createMascotCatPass(cat, () => allowed, () => blocked, environment);
pass.sync();
pass.sync();
assert.equal(pending.size, 1, 'repeated updates do not restart the delay');
assert.equal(cat.hidden, true);
blocked = true;
fire(60000);
assert.equal(cat.hidden, true, 'a dialog or drag delays the pass');
blocked = false;
fire(5000);
assert.equal(cat.hidden, false);
assert.equal(cat.classList.contains('is-running'), true);
const end = new dom.window.Event('animationend');
Object.defineProperty(end, 'animationName', { value: 'nyan-cat-pass' });
cat.dispatchEvent(end);
assert.equal(cat.hidden, true, 'animation completion removes the cat');
assert.equal(pending.size, 0, 'completion clears the fallback timer');
pass.sync();
assert.equal(pending.size, 0, 'the cat passes only once per page');

const second = createMascotCatPass(cat, () => allowed, () => false, environment);
second.sync();
allowed = false;
second.sync();
assert.equal(pending.size, 0, 'a hidden tab or reduced motion cancels the delay');
allowed = true;
second.sync();
fire(60000);
fire(8500);
assert.equal(cat.hidden, true, 'fallback cleanup works without animationend');
assert.equal(pending.size, 0);
second.stop();
const absent = createMascotCatPass(null, () => true, () => false, environment);
absent.sync();
absent.stop();
dom.window.close();
console.log('Cat pass: delay, dialog/drag deferral, once per page, reduced motion/visibility cancellation and cleanup passed.');
