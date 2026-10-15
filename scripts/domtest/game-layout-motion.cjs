const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '../..');
const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const toolkit = buildSync({ entryPoints: [path.join(root, 'assets/js/toolkit.js')], bundle: true, format: 'iife', write: false }).outputFiles[0].text;
const settle = () => new Promise((resolve) => setImmediate(resolve));
function page(tool, html) {
  const dom = new JSDOM(html || source(`layouts/partials/tools/body/${tool}.html`), { url: 'https://example.com/posts/', runScripts: 'outside-only' });
  const w = dom.window;
  const timers = new Map(); let next = 0;
  w.setTimeout = (fn) => { timers.set(++next, fn); return next; };
  w.clearTimeout = (id) => timers.delete(id);
  w.eval(toolkit);
  return { dom, w, timers, boot() { w.eval(source(`assets/js/tools/${tool}.js`)); } };
}
const find = (p, selector) => p.w.document.querySelector(selector);
function finish(p) {
  assert.equal(p.w.document.querySelectorAll('[style], style').length, 0);
  p.w.dispatchEvent(new p.w.Event('pagehide'));
  p.dom.window.close();
}
function drain(p) {
  for (let step = 0; p.timers.size && step < 30; step++) {
    const [id, fn] = p.timers.entries().next().value;
    p.timers.delete(id); fn();
  }
  assert.equal(p.timers.size, 0);
}
(async () => {
  const tools = ['memory-match', 'minesweeper', 'snake', 'tetris', 'random-generator'];
  for (const file of [...tools.map((tool) => `assets/js/tools/${tool}.js`), 'assets/js/infinite-posts.js']) {
    assert(!/\.style\s*[.\[]|\bstyle\s*=|<style\b/.test(source(file)), `${file} authors inline CSS`);
  }
  for (const [tool, prefix, levels] of [
    ['memory-match', 'mm', [['easy', 4, 16], ['medium', 6, 24], ['hard', 6, 36]]],
    ['minesweeper', 'ms', [['easy', 9, 81], ['medium', 12, 144], ['hard', 16, 256]]],
  ]) {
    const p = page(tool); p.boot();
    for (const [level, columns, count] of [...levels, levels[0]]) {
      find(p, `#${prefix}-level`).value = level;
      find(p, `#${prefix}-level`).dispatchEvent(new p.w.Event('change'));
      const board = find(p, `#${prefix}-board`);
      assert.equal(board.dataset.columns, String(columns));
      assert.equal(board.children.length, count);
      board.children[0].click();
      if (prefix === 'ms') assert(!find(p, '#ms-status').textContent.includes('Boom'));
      find(p, `#${prefix}-new`).click();
      assert.equal(board.children.length, count);
      assert.equal(find(p, `#${prefix}-time`).textContent, '0s');
    }
    finish(p);
  }
  {
    const p = page('snake'); p.boot();
    assert.equal(find(p, '#snake-board').children.length, 400);
    assert.equal(p.w.document.querySelectorAll('.snake-cell.is-snake').length, 3);
    find(p, '#snake-new').click();
    assert.equal(find(p, '#snake-board').children.length, 400);
    finish(p);
  }
  {
    const p = page('tetris'); p.w.Math.random = () => 0.99; p.boot();
    assert.equal(find(p, '#tetris-board').children.length, 200);
    const sizes = new Set();
    for (let i = 0; i < 7; i++) {
      const preview = find(p, '#tetris-next');
      const columns = Number(preview.dataset.columns);
      assert.equal(preview.children.length, columns * columns);
      sizes.add(columns);
      p.w.document.dispatchEvent(new p.w.KeyboardEvent('keydown', { key: ' ' }));
    }
    assert.deepEqual([...sizes].sort(), [2, 3, 4]);
    find(p, '#tetris-new').click();
    p.w.document.dispatchEvent(new p.w.KeyboardEvent('keydown', { key: 'c' }));
    const hold = find(p, '#tetris-hold');
    assert.equal(hold.children.length, Number(hold.dataset.columns) ** 2);
    find(p, '#tetris-new').click();
    assert.equal(hold.children.length, 0);
    assert.equal(hold.hasAttribute('data-columns'), false);
    finish(p);
  }
  {
    const p = page('random-generator'); p.boot(); drain(p);
    find(p, '#rnd-items').value = Array.from({ length: 25 }, (_, i) => `Item ${i}`).join('\n');
    find(p, '#rnd-count').value = '999';
    find(p, '#rnd-go').click(); drain(p);
    const items = [...find(p, '#rnd-results').children];
    assert.equal(items.length, 20);
    assert.equal(new Set(items.map((item) => item.textContent)).size, 20);
    items.forEach((item, i) => assert(item.classList.contains(`stagger-step-${i}`)));
    find(p, '#rnd-count').value = '1'; find(p, '#rnd-go').click(); drain(p);
    assert.equal(find(p, '#rnd-results').children.length, 1);
    assert.equal(find(p, '#rnd-results').firstElementChild.className, 'stagger-step-0');
    find(p, '#rnd-items').value = ''; find(p, '#rnd-go').click();
    assert.equal(find(p, '#rnd-results').children.length, 0);
    finish(p);
  }
  {
    const html = '<ul data-infinite-list><li class="post-item">Existing</li></ul><nav data-infinite-pager><a data-infinite-next href="/posts/page/2/">Load more posts</a><span data-infinite-status></span></nav>';
    const p = page(null, html);
    let intersect, disconnected = 0, calls = 0;
    p.w.IntersectionObserver = class {
      constructor(callback) { intersect = callback; }
      observe() {}
      disconnect() { disconnected++; }
    };
    p.w.fetch = async (url) => {
      calls++;
      const count = calls === 1 ? 8 : 2;
      const next = calls === 1 ? '<a data-infinite-next href="../3/">Next</a>' : '';
      return { ok: true, url, text: async () => `<ul data-infinite-list>${Array.from({ length: count }, (_, i) => `<li class="post-item">Batch ${calls}: ${i}</li>`).join('')}</ul>${next}` };
    };
    p.w.eval(source('assets/js/infinite-posts.js'));
    find(p, '[data-infinite-next]').click();
    intersect([{ isIntersecting: true }]); await settle();
    assert.equal(calls, 1, 'concurrent triggers must not fetch twice');
    const batch = [...p.w.document.querySelectorAll('.infinite-new-item')];
    assert.equal(batch.length, 8);
    batch.forEach((node, i) => assert(node.classList.contains(`stagger-step-${Math.min(i, 5)}`)));
    assert.equal(find(p, '[data-infinite-next]').href, 'https://example.com/posts/page/3/');
    intersect([{ isIntersecting: true }]); await settle();
    assert.equal(calls, 2);
    assert.equal(p.w.document.querySelectorAll('.post-item').length, 11);
    assert.equal(find(p, '[data-infinite-list]').lastElementChild.className, 'post-item infinite-new-item stagger-step-1');
    assert.equal(find(p, '[data-infinite-next]'), null);
    assert.equal(find(p, '[data-infinite-status]').textContent, 'All posts loaded.');
    assert.equal(disconnected, 1);
    finish(p);
  }
  const css = source('assets/css/styles.css');
  for (let i = 0; i < 20; i++) assert(css.includes(`.stagger-step-${i} { --stagger-step: ${i}; }`));
  assert(css.includes('animation-delay: calc(var(--stagger-step, 0) * 28ms)'));
  assert(source('assets/css/components/tool-interactive-panels.css').includes('animation-delay: calc(var(--stagger-step, 0) * 55ms)'));
  for (const file of ['assets/css/styles.css', 'assets/css/components/tool-interactive-panels.css']) assert(source(file).includes('@media (prefers-reduced-motion: no-preference)'));
  console.log('PASS game layouts/motion: all levels, fixed boards, all Tetris preview sizes/hold reset, random 1–20 results, infinite batches/concurrency, bounded CSS classes and no inline CSS');
})().catch((error) => { console.error(error); process.exitCode = 1; });
