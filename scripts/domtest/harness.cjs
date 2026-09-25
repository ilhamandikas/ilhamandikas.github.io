// Shared harness: boot a built tool page in jsdom and run its bundled JS.
//
// Not part of the site build. Run `npm install` once, then `npm run test:dom`.
// The published site and its CI never touch this directory.
//
// Tool bundles are IIFEs (esbuild via Hugo's js.Build), so they can be run with
// vm.runInThisContext. The catch is that the code then lives in the Node realm
// while the DOM belongs to jsdom -- so every browser global it might touch has
// to be borrowed from the jsdom window, otherwise Node's own Event/URL/...
// leak in and jsdom rejects them with confusing type errors.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..', 'public');
const TOOLS = path.join(ROOT, 'tools');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One listener for the whole process; each page points the sink at its own
// bucket while it boots. Per-page listeners hit Node's limit at ~10 pages.
let rejectionSink = null;
process.on('unhandledRejection', (e) => {
  // While a page boots, rejections belong to that page. Anywhere else they are
  // the test script's own bugs, and swallowing them hides real failures.
  if (rejectionSink) rejectionSink.push(String((e && e.message) || e));
  else {
    console.error('UNHANDLED REJECTION IN TEST SCRIPT:', e);
    process.exitCode = 1;
  }
});

function resolveScripts(html) {
  // Hugo's minifier emits unquoted attribute values, so handle both forms.
  return [...html.matchAll(/<script[^>]*\ssrc=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
    .map((m) => m[1] || m[2] || m[3])
    .filter((src) => src && src.startsWith('/js/'))
    .map((src) => path.join(ROOT, src));
}

function installGlobals(w) {
  globalThis.window = w;
  globalThis.document = w.document;
  globalThis.location = w.location;
  Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: w.localStorage, configurable: true, writable: true });

  const bindThese = /^(getComputedStyle|matchMedia|requestAnimationFrame|cancelAnimationFrame|structuredClone)$/;
  for (const name of [
    'Event', 'CustomEvent', 'MouseEvent', 'KeyboardEvent', 'InputEvent', 'FocusEvent',
    'Node', 'Element', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement',
    'DOMParser', 'XMLSerializer', 'XMLHttpRequest', 'FormData', 'File', 'FileReader',
    'Blob', 'Image', 'screen', 'getComputedStyle', 'requestAnimationFrame',
    'cancelAnimationFrame', 'ResizeObserver', 'IntersectionObserver', 'MutationObserver',
    'DataTransfer', 'ClipboardEvent', 'CSS', 'matchMedia', 'structuredClone',
  ]) {
    if (w[name] === undefined) continue;
    try {
      globalThis[name] = typeof w[name] === 'function' && bindThese.test(name) ? w[name].bind(w) : w[name];
    } catch { /* read-only, skip */ }
  }
  if (!w.getComputedStyle) w.getComputedStyle = () => ({ getPropertyValue: () => '' });

  // No real network in tests: tools must cope with a failing fetch.
  globalThis.fetch = () => Promise.reject(new Error('offline (harness)'));
  globalThis.URL.createObjectURL = () => 'blob:harness';
  globalThis.URL.revokeObjectURL = () => {};
  globalThis.alert = () => {};
  globalThis.confirm = () => true;
  globalThis.prompt = () => '';
  if (!w.matchMedia) w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });

  // jsdom implements neither execCommand nor the query* helpers; browsers do.
  w.document.execCommand = () => false;
  w.document.queryCommandState = () => false;
  w.document.queryCommandSupported = () => false;

  Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true });
}

// Boot one built tool page. Returns the window plus anything that threw at load time.
function loadPage(slug, options) {
  return loadFile(path.join(TOOLS, slug, 'index.html'), `https://ilham.dev/tools/${slug}/`, options);
}

// Same, for any built page (the catalog, the home page, ...).
function loadFile(htmlPath, url, { onConsole } = {}) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const entries = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => entries.push({ kind: 'jsdomError', text: e.detail ? String(e.detail.message || e.detail) : String(e.message) }));
  vc.on('error', (...a) => entries.push({ kind: 'error', text: a.map(String).join(' ') }));
  vc.on('warn', (...a) => entries.push({ kind: 'warn', text: a.map(String).join(' ') }));

  const dom = new JSDOM(html, {
    url,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const w = dom.window;
  installGlobals(w);

  const thrown = [];
  const rejections = [];
  rejectionSink = rejections;

  const scripts = resolveScripts(html);
  for (const file of scripts) {
    const code = fs.readFileSync(file, 'utf8');
    try {
      vm.runInThisContext(`(function(){${code}\n})();`, { filename: file });
    } catch (error) {
      thrown.push(`${path.basename(file)}: ${error.message}`);
    }
  }

  if (onConsole) onConsole(entries);

  const finish = () => {
    rejectionSink = null;
    const console_ = entries.filter((c) => c.kind !== 'warn');
    const limits = console_.filter((c) => c.kind === 'jsdomError' && /Not implemented|Could not parse CSS|navigation/i.test(c.text));
    const errors = console_
      .filter((c) => c.kind === 'error' || (c.kind === 'jsdomError' && !/Not implemented|Could not parse CSS|navigation/i.test(c.text)))
      .map((c) => c.text);
    return {
      w,
      thrown,
      errors,
      limits: limits.length,
      rejections: rejections.filter((r) => !/offline \(harness\)/.test(r)),
    };
  };

  return { w, dom, scripts, thrown, finish, read: (sel) => read(w, sel), fire: (sel, type) => fire(w, sel, type), set: (sel, value) => set(w, sel, value) };
}

function read(w, sel) {
  const el = w.document.querySelector(sel);
  if (!el) return null;
  return 'value' in el ? el.value : el.textContent;
}

function fire(w, sel, type) {
  const el = w.document.querySelector(sel);
  if (!el) throw new Error(`no element for ${sel}`);
  el.dispatchEvent(new w.Event(type, { bubbles: true }));
}

function set(w, sel, value) {
  const el = w.document.querySelector(sel);
  if (!el) throw new Error(`no element for ${sel}`);
  // The sort control is a cycling button, so "set" means click until it matches.
  if (el.classList.contains('tool-sort-btn')) {
    for (let i = 0; i < 4 && el.dataset.sort !== value; i += 1) {
      el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    }
    if (el.dataset.sort !== value) throw new Error(`could not cycle ${sel} to ${value}`);
    return;
  }
  if (el.type === 'checkbox' || el.type === 'radio') el.checked = Boolean(value);
  else el.value = value;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
}

function click(w, sel) {
  const el = w.document.querySelector(sel);
  if (!el) throw new Error(`no element for ${sel}`);
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
}

function bodyText(w) {
  const body = w.document.querySelector('.tool-body') || w.document.body;
  return body.textContent.replace(/\s+/g, ' ').trim();
}

function errorStatuses(w) {
  return [...w.document.querySelectorAll('.tool-status.err')].map((el) => el.textContent.trim()).filter(Boolean);
}

module.exports = { ROOT, TOOLS, sleep, resolveScripts, installGlobals, loadPage, loadFile, read, fire, set, click, bodyText, errorStatuses };
