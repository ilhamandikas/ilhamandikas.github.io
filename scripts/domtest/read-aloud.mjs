import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { splitForSpeech, pickVoice, readableText, initReadAloud } from '../../assets/js/read-aloud.js';

// --- text preparation -----------------------------------------------------
assert.deepEqual(splitForSpeech('   '), []);
assert.deepEqual(splitForSpeech('One short line.'), ['One short line.']);
const packed = splitForSpeech('First sentence here. Second one is short. Third one too.');
assert.ok(packed.length <= 2 && packed.join(' ').includes('Third one too.'), 'short sentences are packed together');
const long = splitForSpeech(`${'word '.repeat(120)}end.`, 180);
assert.ok(long.length > 1, 'very long sentences are split');
assert.ok(long.every((chunk) => chunk.length <= 180), 'chunks stay within the speech limit');
assert.equal(long.join(' ').replace(/\s+/g, ' '), `${'word '.repeat(120)}end.`.replace(/\s+/g, ' '), 'no words are lost');

const local = { lang: 'en-US', localService: true };
const remote = { lang: 'en-US', localService: false };
const indo = { lang: 'id-ID', localService: true };
assert.equal(pickVoice([remote, local, indo], 'en-GB'), local, 'on-device voice for the page language wins');
assert.equal(pickVoice([remote, indo], 'en'), remote, 'falls back to a matching remote voice');
assert.equal(pickVoice([], 'en'), null);

const dom = new JSDOM('<article class="post"><div class="prose"><p>Hello reader.</p><pre>const a = 1;</pre></div></article>');
assert.ok(readableText(dom.window.document.querySelector('.prose')).includes('Hello reader.'));
assert.ok(!readableText(dom.window.document.querySelector('.prose')).includes('const a'), 'code is skipped when reading aloud');
dom.window.close();

const minified = new JSDOM('<div class="prose"><h2>Setup</h2><p>First step.</p><ul><li>Alpha</li><li>Beta</li></ul></div>');
const words = readableText(minified.window.document.querySelector('.prose')).replace(/\s+/g, ' ').trim();
assert.equal(words, 'Setup First step. Alpha Beta', 'block elements are separated even without source whitespace');
minified.window.close();

// --- controller -----------------------------------------------------------
function makeDom() {
  const page = new JSDOM(`<article class="post"><div class="prose">${'Sentence number one. '.repeat(20)}</div></article>
    <div data-read-aloud hidden>
      <button data-read-toggle aria-pressed="false"><span data-read-label>Listen</span></button>
      <button data-read-stop hidden></button>
      <span data-read-status></span>
    </div>`, { url: 'https://example.com/post/' });
  const spoken = [];
  const calls = { speak: 0, cancel: 0, pause: 0, resume: 0 };
  page.window.speechSynthesis = {
    speak(utterance) { calls.speak++; spoken.push(utterance); },
    cancel() { calls.cancel++; },
    pause() { calls.pause++; },
    resume() { calls.resume++; },
    getVoices: () => [{ lang: 'en-US', localService: true }],
  };
  page.window.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; this.onend = null; this.onerror = null; }
  };
  return { page, spoken, calls };
}
function controller(dom, { disableSynth = false } = {}) {
  const root = dom.page.window.document.querySelector('[data-read-aloud]');
  if (disableSynth) dom.page.window.speechSynthesis = undefined;
  const api = initReadAloud(root, dom.page.window);
  return { root, api, toggle: root.querySelector('[data-read-toggle]'), label: root.querySelector('[data-read-label]'), stop: root.querySelector('[data-read-stop]'), status: root.querySelector('[data-read-status]') };
}

{
  const dom = makeDom();
  const { root, api, toggle, label, stop } = controller(dom);
  assert.ok(api, 'controller starts when speech synthesis is available');
  assert.equal(root.hidden, false, 'control is revealed only when it can work');
  assert.equal(label.textContent, 'Listen');
  assert.equal(stop.hidden, true);
  toggle.click();
  assert.equal(dom.calls.speak, 1);
  assert.equal(label.textContent, 'Pause');
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(stop.hidden, false);
  dom.spoken[0].onend();
  assert.equal(dom.calls.speak, 2, 'next chunk is queued when the previous one ends');
  toggle.click();
  assert.equal(dom.calls.pause, 1);
  assert.equal(label.textContent, 'Resume');
  assert.equal(toggle.getAttribute('aria-pressed'), 'false');
  toggle.click();
  assert.equal(dom.calls.resume, 1);
  assert.equal(label.textContent, 'Pause');
  const cancelsBeforeStop = dom.calls.cancel;
  stop.click();
  assert.ok(dom.calls.cancel > cancelsBeforeStop, 'stop cancels the current utterance');
  assert.equal(label.textContent, 'Listen');
  assert.equal(stop.hidden, true);
  toggle.click();
  dom.page.window.dispatchEvent(new dom.page.window.Event('pagehide'));
  assert.equal(label.textContent, 'Listen', 'leaving the page stops playback');
  dom.page.window.close();
}
{
  const dom = makeDom();
  const { root, api } = controller(dom, { disableSynth: true });
  assert.equal(api, null, 'no speech synthesis means no control');
  assert.equal(root.hidden, true);
  dom.page.window.close();
}
{
  const short = new JSDOM(`<article class="post"><div class="prose">One sentence only.</div></article>
    <div data-read-aloud hidden><button data-read-toggle></button><span data-read-label></span></div>`);
  const root = short.window.document.querySelector('[data-read-aloud]');
  short.window.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [] };
  short.window.SpeechSynthesisUtterance = class {};
  assert.equal(initReadAloud(root, short.window), null, 'a one-line post does not show the control');
  assert.equal(root.hidden, true);
  short.window.close();
}

console.log('Read aloud: chunking, voice choice, code skipping, play/pause/stop, unsupported and short posts passed.');
