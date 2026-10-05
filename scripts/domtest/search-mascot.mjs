import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { initSearchMascot } from '../../assets/js/search-mascot.js';

// Strip Go template delimiters so the raw partial parses as plain HTML in jsdom.
const markup = fs.readFileSync('layouts/partials/search-mascot.html', 'utf8').replace(/\{\{[^{}]*\}\}/g, '');
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function setup(saved, blocked = false, reduced = false, fetcher, options = {}) {
  const dom = new JSDOM(markup, { url: 'https://example.com/', pretendToBeVisual: true });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  dom.window.matchMedia = () => ({ matches: reduced, addEventListener() {} });
  if (options.width) Object.defineProperty(dom.window, 'innerWidth', { value: options.width, configurable: true });
  if (options.height) Object.defineProperty(dom.window, 'innerHeight', { value: options.height, configurable: true });
  if (options.viewport) dom.window.visualViewport = options.viewport;
  if (fetcher) dom.window.fetch = fetcher;
  dom.window.document.querySelector('#search-mascot').dataset.pageKind = options.pageKind || 'home';
  // The raw Go template leaks its guide attributes when parsed as plain HTML,
  // so only keep them for the guide scenario.
  const guideRoot = dom.window.document.querySelector('#search-mascot');
  if (options.guide) {
    guideRoot.dataset.guideUrl = options.guide.url;
    guideRoot.dataset.guideTitle = options.guide.title;
  } else {
    delete guideRoot.dataset.guideUrl;
    delete guideRoot.dataset.guideTitle;
    guideRoot.querySelector('.search-mascot-guide-link')?.remove();
  }
  if (options.clock) dom.window.performance.now = options.clock;
  if (options.modal) {
    const dialog = dom.window.document.createElement('div');
    dialog.id = 'global-search';
    dialog.hidden = true;
    dom.window.document.body.append(dialog);
  }
  if (saved) localStorage.setItem('ilham-search-companion-v1', saved);
  if (blocked) globalThis.localStorage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  let opens = 0;
  initSearchMascot(() => opens++);
  const root = document.querySelector('#search-mascot');
  const main = root.querySelector('.search-mascot-main');
  const art = root.querySelector('.search-mascot-art');
  art.getBoundingClientRect = () => ({ left: 100, top: 100, width: 72, height: 90 });
  main.setPointerCapture = () => {};
  const pointer = (type, x, y, target = main, pointerType = 'mouse') => {
    const event = new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 });
    Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true }, pointerType: { value: pointerType } });
    target.dispatchEvent(event);
  };
  const key = (value) => main.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true }));
  const close = () => { dom.window.dispatchEvent(new dom.window.Event('pagehide')); dom.window.close(); };
  return { dom, root, main, art, pointer, key, close, opens: () => opens };
}
let page = setup();
const bubble = page.root.querySelector('.search-mascot-bubble');
assert.equal(page.root.hidden, false);
assert.equal(page.root.classList.contains('is-arriving'), true, 'companion animates in on first paint');
assert.equal(page.root.querySelector('.search-mascot-main').getAttribute('aria-keyshortcuts'),
  'ArrowLeft ArrowRight ArrowUp ArrowDown H', 'keyboard shortcuts are exposed to assistive technology');
assert.equal(page.root.querySelector('.search-mascot-hide'), null);
assert.equal(page.root.querySelector('.search-mascot-label'), null);
assert.equal(bubble.textContent, 'Want to search something?');
page.pointer('pointerenter', 900, 600);
assert.equal(bubble.textContent, 'Click me!');
assert.equal(page.root.dataset.expression, 'curious');
page.pointer('pointerleave', 800, 500);
assert.equal(bubble.textContent, 'Want to search something?');
page.main.click();
assert.equal(page.opens(), 1);
assert.equal(page.root.dataset.expression, 'excited', 'search click has an immediate happy expression');
page.key('h');
assert.equal(page.root.classList.contains('is-tucked'), true);
const hiddenState = localStorage.getItem('ilham-search-companion-v1');
page.root.getBoundingClientRect = () => ({ left: 900, right: 944, top: 600, bottom: 664 });
page.pointer('pointermove', 860, 620, document);
await pause(40);
assert.equal(page.root.classList.contains('is-near'), true, 'hidden companion responds before cursor reaches it');
assert.equal(page.root.classList.contains('is-peeking'), false, 'eyes look first, body waits');
await pause(200);
assert.equal(page.root.classList.contains('is-peeking'), true, 'body follows the eyes after a short pause');
assert.equal(bubble.textContent, 'Psst… click to bring me back!');
page.pointer('pointermove', 100, 100, document);
await pause(40);
assert.equal(page.root.classList.contains('is-near'), false, 'peek retracts when cursor leaves');
assert.equal(page.root.classList.contains('is-peeking'), false, 'body also retracts');
page.main.click();
assert.equal(page.opens(), 1, 'revealing is not searching');
assert.equal(page.root.classList.contains('is-tucked'), false);
page.key('ArrowLeft');
assert.equal(page.root.dataset.side, 'left');
const originalWire = page.root.querySelector('.search-mascot-wire').getAttribute('d');
page.pointer('pointerdown', 40, 200);
page.pointer('pointermove', 400, 250);
await pause(120);
assert.ok(page.art.style.transform.includes('rotate('), 'drag excites the spring');
assert.equal(page.root.classList.contains('is-wobbling'), true, 'the spring marks itself as animating');
assert.notEqual(page.root.querySelector('.search-mascot-wire').getAttribute('d'), originalWire, 'lower wire bends independently of the head');
assert.equal(page.root.querySelector('.search-mascot-wire').getAttribute('d'), page.root.querySelector('.search-mascot-wire-core').getAttribute('d'), 'metal outline and core stay aligned');
assert.ok(page.root.style.transform.startsWith('translate3d('), 'drag uses a composited transform');
page.pointer('pointerup', 400, 250);
assert.equal(page.root.dataset.side, 'left', 'dock to nearest side');
assert.equal(page.root.classList.contains('is-docking'), true);
assert.ok(page.root.style.transform.includes('translate3d('), 'dock retains the release position before easing');
page.main.dispatchEvent(new window.MouseEvent('click', { detail: 1 }));
assert.equal(page.opens(), 1, 'drag must not open search');
await pause(1600);
assert.equal(page.root.classList.contains('is-docking'), false);
assert.equal(page.root.classList.contains('is-wobbling'), false, 'idle companion stops advertising animation');
assert.equal(page.art.style.transform, '', 'spring settles and stops');
assert.equal(page.root.querySelector('.search-mascot-wire').getAttribute('d'), originalWire, 'flexible wire returns to its original shape');
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
page.pointer('pointerdown', 400, 300);
page.pointer('pointermove', 400, 400);
await pause(120);
assert.notEqual(page.root.querySelector('.search-mascot-wire').getAttribute('d'), originalWire, 'vertical drag also flexes the lower wire');
page.pointer('pointercancel', 400, 400);
assert.equal(page.root.querySelector('.search-mascot-wire').getAttribute('d'), originalWire, 'cancelling restores the wire');
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
assert.equal(page.root.classList.contains('is-arriving'), false, 'reduced motion skips the entrance animation');
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
const view = new EventTarget();
Object.assign(view, { width: 320, height: 700, offsetLeft: 0, offsetTop: 0 });
page = setup(null, false, false, undefined, { width: 320, height: 700, viewport: view });
assert.ok(parseFloat(page.root.style.top) < 450, 'new mobile position stays above the bottom action area');
const startY = parseFloat(page.root.style.top) + 44;
page.pointer('pointerdown', 270, startY, page.main, 'touch');
page.pointer('pointermove', 301, startY, page.main, 'touch');
assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, 'Release to hide!', 'touch gets a wider edge zone');
page.pointer('pointerup', 301, startY, page.main, 'touch');
assert.equal(page.root.classList.contains('is-tucked'), true);
page.pointer('pointerdown', 290, startY, page.main, 'touch');
page.main.dispatchEvent(new window.MouseEvent('click', { detail: 1, bubbles: true }));
assert.equal(page.root.classList.contains('is-tucked'), false, 'first genuine tap after a touch drag reveals the companion');
view.height = 330;
view.offsetTop = 180;
view.dispatchEvent(new Event('resize'));
const mobileY = parseFloat(page.root.style.top);
assert.ok(mobileY >= 188 && mobileY + 88 <= 510, 'companion stays in the visible viewport when a keyboard opens');
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
  }, { pageKind: 'guides' });
  await pause(160);
  assert.equal(page.root.classList.contains('is-quote'), true, 'idle search prompt switches to a quote');
  assert.ok(page.root.querySelector('.search-mascot-author'));
  assert.equal(page.root.querySelector('.search-mascot-bubble b'), null, 'API text is never HTML');
  page.pointer('pointerenter', 900, 600);
  await pause(350);
  assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, 'Click me!', 'hover pauses rotation and takes priority');
  page.pointer('pointerleave', 800, 500);
  await pause(320);
  assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, 'Need a guide for your next step?', 'quote switches to a page-specific prompt');
  await pause(95);
  assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, 'Want to search something?', 'context prompt switches back to search');
  assert.equal(requests, 1, 'rotation does not repeatedly fetch');
  page.close();
} finally {
  globalThis.setTimeout = nativeTimeout;
}
globalThis.setTimeout = (callback, delay, ...args) => nativeTimeout(callback,
  delay >= 21500 && delay <= 22500 ? 70 : delay >= 44000 && delay <= 45000 ? 140 : delay, ...args);
try {
  let clock = 0;
  page = setup(null, false, false, undefined, { clock: () => clock });
  await pause(10);
  clock = 22100;
  await pause(100);
  assert.equal(page.root.dataset.expression, 'drowsy', 'quiet companion gets drowsy before falling asleep');
  clock = 45500;
  await pause(120);
  assert.equal(page.root.dataset.expression, 'sleepy', 'quiet companion becomes sleepy');
  page.pointer('pointermove', 400, 200, document);
  assert.notEqual(page.root.dataset.expression, 'sleepy', 'pointer activity wakes it up');
  assert.notEqual(page.root.dataset.expression, 'drowsy', 'waking clears the drowsy stage too');
  page.close();
  clock = 0;
  page = setup(null, false, false, undefined, { clock: () => clock, modal: true });
  const dialog = document.querySelector('#global-search');
  dialog.hidden = false;
  await pause(20);
  assert.equal(page.root.dataset.expression, 'excited', 'keyboard-opened search also makes it happy');
  assert.equal(page.root.querySelector('.search-mascot-bubble').textContent, "Let's find it!");
  clock = 50000;
  await pause(120);
  assert.equal(page.root.dataset.expression, 'excited', 'open search prevents sleeping');
  dialog.hidden = true;
  await pause(20);
  assert.equal(page.root.dataset.expression, 'neutral', 'closing search restores the idle expression');
  page.close();
} finally { globalThis.setTimeout = nativeTimeout; }
page = setup();
assert.equal(page.root.classList.contains('is-arriving'), true, 'arrival animation starts on first paint');
page.pointer('pointerdown', 40, 200);
assert.equal(page.root.classList.contains('is-arriving'), false, 'interaction cancels the entrance animation before it fights a drag');
page.pointer('pointerup', 40, 200);
page.close();
// An occasional hop breaks up long stretches of stillness.
globalThis.setTimeout = (callback, delay, ...args) => nativeTimeout(callback,
  delay >= 14000 && delay <= 20000 ? 80 : delay, ...args);
try {
  page = setup();
  await pause(120);
  assert.equal(page.root.classList.contains('is-hopping'), true, 'idle companion hops now and then');
  const end = new window.Event('animationend', { bubbles: true });
  Object.defineProperty(end, 'animationName', { value: 'companion-hop' });
  page.main.dispatchEvent(end);
  assert.equal(page.root.classList.contains('is-hopping'), false, 'hop clears when its animation ends');
  page.pointer('pointerdown', 40, 200);
  assert.equal(page.root.classList.contains('is-hopping'), false, 'a drag stops any hop');
  page.pointer('pointerup', 40, 200);
  page.close();
} finally { globalThis.setTimeout = nativeTimeout; }
// Eyes glance down or up with the scroll direction, then ease back.
page = setup(null, false, false, undefined, { width: 1280, height: 900 });
page.pointer('pointermove', 136, 145, document);
await pause(60);
const gazePupil = page.root.querySelector('.search-mascot-pupil');
const pupilY = () => parseFloat(gazePupil.getAttribute('transform').replace(/.*\s([-\d.]+)\)$/, '$1'));
const neutralY = pupilY();
Object.defineProperty(window, 'scrollY', { value: 400, configurable: true });
window.dispatchEvent(new window.Event('scroll'));
await pause(90);
const downY = pupilY();
assert.ok(downY > neutralY + 0.5, `eyes look down while scrolling down (${neutralY} -> ${downY})`);
Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
window.dispatchEvent(new window.Event('scroll'));
await pause(90);
assert.ok(pupilY() < downY - 0.5, 'eyes look up when scrolling back up');
page.close();
// Tool pages with a matching guide invite the reader into it, in the bubble itself.
page = setup(null, false, false, undefined, { pageKind: 'tools', guide: { url: '/guides/example/', title: 'Example Guide' } });
const guideBubble = page.root.querySelector('.search-mascot-bubble');
const guideMessage = page.root.querySelector('.search-mascot-message');
const guideLink = page.root.querySelector('.search-mascot-guide-link');
assert.equal(guideMessage.textContent, 'There’s a guide for this tool.', 'a tool page with a guide invites the reader');
assert.equal(guideLink.hidden, false, 'the guide link is offered inside the bubble');
assert.equal(page.root.classList.contains('has-guide-link'), true);
assert.equal(guideBubble.getAttribute('aria-hidden'), 'false', 'the interactive bubble is exposed to assistive technology');
page.pointer('pointerenter', 900, 600);
assert.equal(guideMessage.textContent, 'Click me!', 'hover still wins over the guide invitation');
assert.equal(guideLink.hidden, true, 'the link is not clickable mid-hover');
page.pointer('pointerleave', 800, 500);
assert.equal(guideMessage.textContent, 'There’s a guide for this tool.', 'the invitation returns after hover');
assert.equal(guideLink.hidden, false);
page.key('h');
assert.equal(guideLink.hidden, true, 'a tucked companion does not offer the link');
page.close();
page = setup(null, false, false, undefined, { pageKind: 'tools' });
assert.equal(page.root.querySelector('.search-mascot-message').textContent, 'Want to search something?',
  'a tool page without a guide uses the normal prompt');
assert.equal(page.root.querySelector('.search-mascot-guide-link'), null, 'no guide means no link');
page.close();
console.log('Search companion: flexible wire, expressions/drowsy/sleep, staged peek, contextual quotes, scroll gaze, docking, hide, keyboard, resize, entrance animation, idle hop, guide invitation and reduced motion passed.');
