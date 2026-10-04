import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { initSearchMascot } from '../../assets/js/search-mascot.js';

const markup = fs.readFileSync('layouts/partials/search-mascot.html', 'utf8');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function setup(saved, blocked = false, reduced = false, fetcher) {
  const dom = new JSDOM(markup, { url: 'https://example.com/', pretendToBeVisual: true });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  dom.window.matchMedia = () => ({ matches: reduced, addEventListener() {} });
  if (fetcher) dom.window.fetch = fetcher;
  if (saved) localStorage.setItem('ilham-search-companion-v1', saved);
  if (blocked) globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  let opens = 0;
  initSearchMascot(() => opens++);
  const root = document.querySelector('#search-mascot');
  const main = root.querySelector('.search-mascot-main');
  const art = root.querySelector('.search-mascot-art');
  art.getBoundingClientRect = () => ({ left: 100, top: 100, width: 72, height: 90 });
  main.setPointerCapture = () => {};
  const pointer = (type, x, y, target = main) => {
    const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
    Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true }, pointerType: { value: 'mouse' } });
    target.dispatchEvent(event);
  };
  const key = (value) => main.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true }));
  const close = () => { dom.window.dispatchEvent(new dom.window.Event('pagehide')); dom.window.close(); };
  return { dom, root, main, art, pointer, key, close, opens: () => opens };
}
let page = setup();
const bubble = page.root.querySelector('.search-mascot-bubble');
assert.equal(page.root.hidden, false);
assert.equal(page.root.querySelector('.search-mascot-hide'), null);
assert.equal(page.root.querySelector('.search-mascot-label'), null);
assert.equal(bubble.textContent, 'Want to search something?');
page.pointer('pointerenter', 900, 600);
assert.equal(bubble.textContent, 'Click me!');
page.pointer('pointerleave', 800, 500);
assert.equal(bubble.textContent, 'Want to search something?');
page.main.click();
assert.equal(page.opens(), 1);
page.key('h');
assert.equal(page.root.classList.contains('is-tucked'), true);
const hiddenState = localStorage.getItem('ilham-search-companion-v1');
page.root.getBoundingClientRect = () => ({ left: 900, right: 944, top: 600, bottom: 664 });
page.pointer('pointermove', 860, 620, document);
await pause(40);
assert.equal(page.root.classList.contains('is-near'), true, 'hidden companion responds before cursor reaches it');
assert.equal(bubble.textContent, 'Psst… click to bring me back!');
page.pointer('pointermove', 100, 100, document);
await pause(40);
assert.equal(page.root.classList.contains('is-near'), false, 'peek retracts when cursor leaves');
page.main.click();
assert.equal(page.opens(), 1, 'revealing is not searching');
assert.equal(page.root.classList.contains('is-tucked'), false);
page.key('ArrowLeft');
assert.equal(page.root.dataset.side, 'left');
page.pointer('pointerdown', 40, 200);
page.pointer('pointermove', 400, 250);
await pause(40);
assert.ok(page.art.style.transform.includes('rotate('), 'drag excites the spring');
assert.ok(page.root.style.transform.startsWith('translate3d('), 'drag uses a composited transform');
page.pointer('pointerup', 400, 250);
assert.equal(page.root.dataset.side, 'left', 'dock to nearest side');
assert.equal(page.root.classList.contains('is-docking'), true);
assert.ok(page.root.style.transform.includes('translate3d('), 'dock retains the release position before easing');
page.main.dispatchEvent(new window.MouseEvent('click', { detail: 1 }));
assert.equal(page.opens(), 1, 'drag must not open search');
await pause(1000);
assert.equal(page.root.classList.contains('is-docking'), false);
assert.equal(page.art.style.transform, '', 'spring settles and stops');
page.main.click();
assert.equal(page.opens(), 2, 'keyboard activation still works after drag');
page.pointer('pointerdown', 40, 200);
page.pointer('pointermove', 0, 200);
assert.equal(bubble.textContent, 'Release to hide!');
page.pointer('pointerup', 0, 200);
assert.equal(page.root.classList.contains('is-tucked'), true, 'outward drag hides');
page.main.click();
page.pointer('pointerdown', 40, 200);
page.pointer('pointermove', 0, 200);
page.pointer('pointercancel', 0, 200);
assert.equal(page.root.classList.contains('is-tucked'), false, 'cancelled gesture does not hide');
page.pointer('pointermove', 400, 150, document);
await pause(40);
const pupil = page.root.querySelector('.search-mascot-pupil');
assert.ok(pupil.getAttribute('transform').startsWith('translate('), 'eyes track cursor');
page.pointer('pointermove', -500, 150, document);
await pause(350);
assert.ok(parseFloat(pupil.getAttribute('transform').slice(10)) < -4, 'eyes visibly look left');
page.pointer('pointermove', 1500, 150, document);
await pause(350);
assert.ok(parseFloat(pupil.getAttribute('transform').slice(10)) > 4, 'eyes visibly look right');
page.pointer('pointerdown', 400, 300);
for (let i = 1; i <= 18; i++) {
  const t = i * Math.PI / 8;
  page.pointer('pointermove', 360 + 40 * Math.cos(t), 300 + 40 * Math.sin(t));
}
assert.equal(page.root.classList.contains('is-dizzy'), true, 'circular drag makes companion dizzy');
assert.equal(bubble.textContent, "Whoa... I'm dizzy!");
page.pointer('pointerup', 400, 300);
for (const width of [320, 375, 768, 1280]) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  window.dispatchEvent(new window.Event('resize'));
  const x = parseFloat(page.root.style.left);
  assert.ok(x >= 0 && x + 96 <= width, `fits ${width}px viewport`);
}
page.close();
page = setup(hiddenState);
assert.equal(page.root.classList.contains('is-tucked'), true, 'hidden preference survives navigation');
page.close();
for (const saved of ['broken json', '{"side":"other","level":100,"tucked":"true"}']) {
  page = setup(saved);
  assert.equal(page.root.hidden, false);
  assert.equal(page.root.dataset.side, 'right');
  assert.equal(page.root.classList.contains('is-tucked'), false);
  page.close();
}
page = setup(null, true, true);
page.pointer('pointermove', 400, 200, document);
page.pointer('pointerdown', 900, 200);
page.pointer('pointermove', 700, 220);
await pause(40);
assert.equal(page.art.style.transform, '', 'reduced motion disables spring');
assert.equal(page.root.querySelector('.search-mascot-pupil').getAttribute('transform'), null);
page.pointer('pointerup', 700, 220);
page.key('h');
assert.equal(page.root.classList.contains('is-tucked'), true, 'blocked storage still permits hide');
page.close();
const nativeTimeout = globalThis.setTimeout;
globalThis.setTimeout = (callback, delay, ...args) => nativeTimeout(callback,
  delay === 8000 ? 100 : delay >= 12000 && delay <= 20000 ? 300 : delay, ...args);
try {
  let requests = 0;
  page = setup(null, false, false, async () => {
    requests++;
    return { ok: true, json: async () => ({ quotes: [
      { quote: '<b>Learn one thing at a time.</b>', author: 'Example Author' },
      { quote: '<b>Keep trying.</b>', author: 'Another Author' },
    ] }) };
  });
  await pause(160);
  assert.equal(page.root.classList.contains('is-quote'), true, 'idle search prompt switches to a quote');
  assert.ok(page.root.querySelector('.search-mascot-author'));
  assert.equal(page.root.querySelector('.search-mascot-bubble b'), null, 'API text is never HTML');
  page.pointer('pointerenter', 900, 600);
  await pause(350);
  assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, 'Click me!', 'hover pauses rotation and takes priority');
  page.pointer('pointerleave', 800, 500);
  await pause(320);
  assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, 'Want to search something?', 'quote switches back to search');
  assert.equal(requests, 1, 'rotation does not repeatedly fetch');
  page.close();
} finally {
  globalThis.setTimeout = nativeTimeout;
}
console.log('Search companion: bubble/quote rotation, gaze, spring/settle, docking, dizzy, outward hide, proximity, persistence, keyboard, resize, reduced motion and blocked storage passed.');
