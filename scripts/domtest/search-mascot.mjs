import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { initSearchMascot } from '../../assets/js/search-mascot.js';

const markup = fs.readFileSync('layouts/partials/search-mascot.html', 'utf8');
function setup(saved, blocked = false) {
  const dom = new JSDOM(markup, { url: 'https://example.com/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  if (saved) localStorage.setItem('ilham-search-companion-v1', saved);
  if (blocked) globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  let opens = 0;
  initSearchMascot(() => opens++);
  const root = document.querySelector('#search-mascot');
  const main = root.querySelector('.search-mascot-main');
  main.setPointerCapture = () => {};
  const pointer = (type, x, y) => {
    const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
    Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
    main.dispatchEvent(event);
  };
  return { dom, root, main, pointer, opens: () => opens };
}
let page = setup();
assert.equal(page.root.hidden, false);
page.main.click();
assert.equal(page.opens(), 1);
page.root.querySelector('.search-mascot-hide').click();
assert.equal(page.root.classList.contains('is-tucked'), true);
assert.equal(document.activeElement, page.main);
assert.equal(page.main.getAttribute('aria-label'), 'Show search companion');
const hiddenState = localStorage.getItem('ilham-search-companion-v1');
page.main.click();
assert.equal(page.opens(), 1, 'revealing is not searching');
assert.equal(page.root.classList.contains('is-tucked'), false);
page.main.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' }));
assert.equal(page.root.dataset.side, 'left');
page.pointer('pointerdown', 20, 200);
page.pointer('pointermove', 3000, -2000);
assert.equal(parseFloat(page.root.style.top), 8);
page.pointer('pointerup', 3000, -2000);
page.main.dispatchEvent(new window.MouseEvent('click', { detail: 1 }));
assert.equal(page.opens(), 1, 'drag must not open search');
assert.equal(page.root.dataset.side, 'right');
assert.equal(page.root.classList.contains('is-dragging'), false);
page.main.click();
assert.equal(page.opens(), 2, 'keyboard activation still works after drag');
for (const width of [320, 375, 768, 1280]) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  window.dispatchEvent(new window.Event('resize'));
  const x = parseFloat(page.root.style.left);
  assert.ok(x >= 0 && x + 96 <= width, `fits ${width}px viewport`);
}
page.dom.window.close();
page = setup(hiddenState);
assert.equal(page.root.classList.contains('is-tucked'), true, 'hidden preference survives navigation');
page.dom.window.close();
for (const saved of ['broken json', '{"side":"other","level":100,"tucked":"true"}']) {
  page = setup(saved);
  assert.equal(page.root.hidden, false);
  assert.equal(page.root.dataset.side, 'right');
  assert.equal(page.root.classList.contains('is-tucked'), false);
  page.dom.window.close();
}
page = setup(null, true);
page.root.querySelector('.search-mascot-hide').click();
assert.equal(page.root.classList.contains('is-tucked'), true);
page.dom.window.close();
console.log('Search companion: click, hide/reveal, persistence, drag, keyboard, resize, unavailable storage passed.');
