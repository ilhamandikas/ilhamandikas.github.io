import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
const { mockColorCanvas } = createRequire(import.meta.url)('./browser-stubs.cjs');
const source = fs.readFileSync('assets/js/tools/color-converter.js', 'utf8');
assert(!/\.style\b|setProperty\s*\(|insertRule\s*\(|<style\b/.test(source), 'parser must not author inline CSS');
function fixture(available = true) {
  const dom = new JSDOM('<!doctype html><style>body {color: #123456}</style><textarea id="color-input"></textarea><textarea id="color-output"></textarea><p id="color-status"></p>');
  const { window } = dom;
  const { document } = window;
  mockColorCanvas(window);
  const original = document.createElement.bind(document);
  let creates = 0, contexts = 0, fn;
  document.createElement = (tag, ...args) => {
    const element = original(tag, ...args);
    if (tag === 'canvas') {
      creates++;
      const getContext = element.getContext.bind(element);
      element.getContext = (...options) => { contexts++; return available ? getContext(...options) : null; };
    }
    return element;
  };
  window.tk = { transform(config) { fn = config.fn; } };
  vm.runInNewContext(source, { window, document, getComputedStyle: window.getComputedStyle.bind(window) });
  const count = document.body.children.length;
  return { dom, document, counts: () => [creates, contexts], run(value) {
    document.querySelector('#color-input').value = value;
    try { return fn(); }
    finally {
      assert.equal(document.querySelector('#color-input').value, value, 'errors preserve input');
      assert.equal(document.body.children.length, count, 'no color probe/canvas is attached');
      assert.equal(document.querySelectorAll('[style]').length, 0);
    }
  } };
}
const f = fixture();
assert.equal(f.run(' \n '), '');
assert.deepEqual(f.counts(), [0, 0], 'empty input does not allocate a canvas');
for (const input of ['#f00', '#ff0000', 'red', 'rgb(255,0,0)', 'hsl(0,100%,50%)']) {
  assert.match(f.run(input), /^HEX:   #FF0000\nRGB:   rgb\(255, 0, 0\)/);
  assert.match(f.run(input), /HSL:   hsl\(0, 100%, 50%\)\nCMYK:  cmyk\(0%, 100%, 100%, 0%\)$/);
}
for (const input of ['#010203', '#040506']) assert(f.run(input).includes(input.toUpperCase()), 'sentinel colors remain valid');
assert.match(f.run('rgba(12,34,56,0.5)'), /RGBA:  rgba\(12, 34, 56, 0.5\)/);
assert.match(f.run('transparent'), /RGBA:  rgba\(0, 0, 0, 0\)/);
assert.match(f.run('rgba(255,0,0,0)'), /RGBA:  rgba\(255, 0, 0, 0\)/, 'do not lose transparent RGB channels via a pixel readback');
assert.match(f.run('black'), /CMYK:  cmyk\(0%, 0%, 0%, 100%\)/);
assert.match(f.run('white'), /CMYK:  cmyk\(0%, 0%, 0%, 0%\)/);
for (const input of ['inherit', 'unset', 'revert', 'revert-layer', 'currentColor']) assert.match(f.run(input), /HEX:   #123456/);
assert.match(f.run('initial'), /HEX:   #000000/);
for (const input of ['nonsense', '#12', 'url(https://example.com/color)', '<img src=x>', 'var(--accent)']) assert.throws(() => f.run(input), /Unrecognised color.*Use HEX/);
assert.match(f.run('blue'), /HEX:   #0000FF/, 'an error does not poison later conversions');
assert.deepEqual(f.counts(), [1, 1], 'reuse a single context');
f.dom.window.close();
const unavailable = fixture(false);
assert.equal(unavailable.run(''), '');
assert.throws(() => unavailable.run('red'), /Canvas color parsing is unavailable/);
unavailable.dom.window.close();
console.log('PASS Color Converter: serialized RGB/alpha, transparent channels, sentinels, CSS-wide keywords, invalid/recovery/empty input, no DOM probes or inline CSS; Canvas serialization is mocked in jsdom.');
