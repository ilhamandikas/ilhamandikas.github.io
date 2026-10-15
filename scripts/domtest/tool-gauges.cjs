const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '../..');
const bundle = (file) => buildSync({ entryPoints: [path.join(root, file)], bundle: true, format: 'iife', write: false }).outputFiles[0].text;
const toolkit = bundle('assets/js/toolkit.js');
function page(tool) {
  const html = tool ? fs.readFileSync(path.join(root, `layouts/partials/tools/body/${tool}.html`), 'utf8') : '<div id="track"></div>';
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.com/' });
  const w = dom.window;
  const frames = new Map();
  let next = 0;
  w.requestAnimationFrame = (callback) => { frames.set(++next, callback); return next; };
  w.cancelAnimationFrame = (id) => frames.delete(id);
  w.eval(toolkit);
  return { w, dom, frames, boot: () => w.eval(bundle(`assets/js/tools/${tool}.js`)), step() {
    const [id, callback] = frames.entries().next().value;
    frames.delete(id);
    callback();
  } };
}
const find = (p, selector) => p.w.document.querySelector(selector);
const finish = (p) => {
  assert.equal(p.w.document.querySelectorAll('[style], style').length, 0);
  p.w.dispatchEvent(new p.w.Event('pagehide'));
  assert.equal(p.frames.size, 0);
  p.dom.window.close();
};
const settle = () => new Promise((resolve) => setImmediate(resolve));

(async () => {
  for (const file of ['assets/js/tool-charts.js', ...['mic-tester', 'gamepad-tester', 'devops-tycoon'].flatMap((tool) => [
    `assets/js/tools/${tool}.js`, `layouts/partials/tools/body/${tool}.html`,
  ])]) {
    assert(!/\.style\s*[.\[]|\bstyle\s*=|<style\b/.test(fs.readFileSync(path.join(root, file), 'utf8')), `${file} authors inline CSS`);
  }
  {
    const p = page();
    for (const marker of ['none', 'line', 'dot']) {
      const gauge = p.w.tk.gauge(find(p, '#track'), { marker, center: marker === 'dot' });
      assert.equal(gauge.element.namespaceURI, 'http://www.w3.org/2000/svg');
      assert.equal(gauge.element.getAttribute('aria-hidden'), 'true');
      for (const [value, expected] of [[-10, '0%'], [0, '0%'], [50.25, '50.25%'], [100, '100%'], [150, '100%'], [NaN, '0%'], [Infinity, '0%']]) {
        gauge.set(value, value);
        const node = gauge.element.querySelector(marker === 'dot' ? '.tool-gauge-dot' : '.tool-gauge-fill');
        assert.equal(node.getAttribute(marker === 'dot' ? 'x' : 'width'), expected);
        if (marker === 'line') {
          assert.equal(gauge.element.querySelector('line').getAttribute('x1'), expected);
          assert.equal(gauge.element.querySelector('line').getAttribute('x2'), expected);
        }
      }
    }
    finish(p);
  }
  {
    const p = page('mic-tester');
    let sample = 128, requests = 0, stopped = 0, closed = 0, revoked = 0;
    const track = { label: 'Test microphone', stop: () => { stopped++; } };
    Object.defineProperty(p.w.navigator, 'mediaDevices', { value: { getUserMedia: async () => {
      requests++;
      return { getTracks: () => [track], getAudioTracks: () => [track] };
    } } });
    p.w.AudioContext = class {
      state = 'running';
      createAnalyser() { return { getByteTimeDomainData: (samples) => samples.fill(sample) }; }
      createMediaStreamSource() { return { connect() {} }; }
      close() { closed++; this.state = 'closed'; }
    };
    p.w.MediaRecorder = class extends p.w.EventTarget {
      static isTypeSupported() { return true; }
      mimeType = 'audio/webm';
      start() {}
      stop() {
        const event = new p.w.Event('dataavailable');
        event.data = new p.w.Blob(['test audio']);
        this.dispatchEvent(event);
        this.dispatchEvent(new p.w.Event('stop'));
      }
    };
    p.w.URL.createObjectURL = () => 'blob:test-recording';
    p.w.URL.revokeObjectURL = () => { revoked++; };
    p.boot();
    assert.equal(requests, 0, 'permission must remain opt-in');
    find(p, '#mic-start').click(); await settle();
    assert.equal(find(p, '#mic-level').textContent, '-60.0 dBFS');
    sample = 192; p.step();
    assert.equal(find(p, '#mic-level').textContent, '-6.0 dBFS');
    assert.equal(find(p, '.tool-gauge-fill').getAttribute('width'), '90%');
    sample = 128; p.step();
    assert.equal(find(p, '.tool-gauge-fill').getAttribute('width'), '0%');
    assert.equal(find(p, '.tool-gauge-marker').getAttribute('x1'), '90%');
    sample = 255; p.step();
    assert(find(p, '.tool-gauge').classList.contains('is-critical'));
    sample = 128; p.step();
    assert(find(p, '.tool-gauge').classList.contains('is-critical'), 'clipping remains peak-held');
    find(p, '#mic-record').click();
    find(p, '#mic-stop').click();
    assert.equal(stopped, 1); assert.equal(closed, 1);
    assert.equal(find(p, '#mic-result').hidden, false, 'stopping keeps the captured clip');
    assert.equal(find(p, '.tool-gauge-fill').getAttribute('width'), '0%');
    assert.equal(find(p, '.tool-gauge-marker').getAttribute('x1'), '0%');
    assert(!find(p, '.tool-gauge').classList.contains('is-critical'));
    assert.equal(find(p, '#mic-level').textContent, '—');
    find(p, '#mic-discard').click(); assert.equal(revoked, 1);
    find(p, '#mic-start').click(); await settle();
    assert.equal(requests, 2);
    finish(p);
    assert.equal(stopped, 2); assert.equal(closed, 2);
  }
  {
    const p = page('mic-tester');
    Object.defineProperty(p.w.navigator, 'mediaDevices', { value: { getUserMedia: async () => { throw { name: 'NotAllowedError' }; } } });
    p.boot(); find(p, '#mic-start').click(); await settle();
    assert.match(find(p, '#mic-status').textContent, /blocked/);
    assert.equal(find(p, '#mic-start').disabled, false);
    finish(p);
  }
  {
    const p = page('gamepad-tester');
    const pad = { index: 0, id: 'Test controller', mapping: 'standard', axes: [-1, 0, 1], buttons: [{ value: 0, pressed: false }] };
    let pads = [pad];
    p.w.navigator.getGamepads = () => pads;
    p.boot();
    const positions = () => [...p.w.document.querySelectorAll('.tool-gauge-dot')].map((node) => node.getAttribute('x'));
    assert.deepEqual(positions(), ['0%', '50%', '100%']);
    assert.equal(p.w.document.querySelectorAll('.tool-gauge-center').length, 3);
    pad.axes[1] = 0.5; pad.buttons[0] = { value: 1, pressed: true }; p.step();
    assert.deepEqual(positions(), ['0%', '75%', '100%']);
    assert.equal(find(p, '#gpd-last').textContent, 'A / Cross');
    assert(find(p, '.gpd-button').classList.contains('gpd-button-on'));
    pads = []; p.w.dispatchEvent(new p.w.Event('gamepaddisconnected')); p.step();
    assert.equal(p.w.document.querySelectorAll('.gpd-pad').length, 0);
    pads = [pad]; p.step(); assert.equal(positions().length, 3);
    finish(p);
  }
  {
    const p = page('devops-tycoon'); p.boot();
    const api = p.w.__devopsTycoon;
    const state = api.getState();
    state.money = 1e12;
    for (const value of [0, 70, 70.1, 90, 90.1, 140, -10]) {
      state.disk = value; api.buy('cpu');
      const gauge = find(p, '#dt-disk-bar .tool-gauge');
      assert.equal(gauge.querySelector('rect').getAttribute('width'), `${Math.max(0, Math.min(100, value))}%`);
      assert.equal(gauge.classList.contains('is-warn'), value > 70 && value <= 90);
      assert.equal(gauge.classList.contains('is-critical'), value > 90);
    }
    api.reset();
    assert.equal(find(p, '#dt-disk-bar rect').getAttribute('width'), '20%');
    assert(!find(p, '#dt-disk-bar svg').classList.contains('is-critical'));
    finish(p);
  }
  console.log('PASS shared gauges: SVG bounds/peak/axes, microphone permission/recording/Stop/restart, gamepad reconnect, DevOps thresholds/reset, no inline CSS');
})().catch((error) => { console.error(error); process.exitCode = 1; });
