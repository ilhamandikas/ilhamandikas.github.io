// Opt-in read-aloud for posts, built on the browser's own speech synthesis.
//
// Nothing is stored, and the page never sends the article text anywhere on its
// own. Speech is produced by the browser/operating system; an on-device voice is
// preferred when one exists, but some browsers may use a networked voice. The
// control only appears when speech synthesis exists and the post is long enough
// to be worth listening to.

const CHUNK_MAX = 180;
const IDLE_LABEL = 'Listen';
const SPEAKING_LABEL = 'Pause';
const PAUSED_LABEL = 'Resume';

// Split text into speakable chunks. Some browsers cut off a single long
// utterance, so sentences are packed up to `max` characters and only very long
// sentences are hard-split on word boundaries.
export function splitForSpeech(text, max = CHUNK_MAX) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [clean];
  const chunks = [];
  let current = '';
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (!current) current = sentence;
    else if (`${current} ${sentence}`.length <= max) current += ` ${sentence}`;
    else {
      chunks.push(current);
      current = sentence;
    }
    while (current.length > max) {
      const cut = current.lastIndexOf(' ', max);
      const at = cut > max * 0.4 ? cut : max;
      chunks.push(current.slice(0, at).trim());
      current = current.slice(at).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// Prefer an on-device voice for the page language; fall back to any match.
export function pickVoice(voices, lang) {
  const list = Array.isArray(voices) ? voices : [];
  const prefix = String(lang || 'en').slice(0, 2).toLowerCase();
  const matching = list.filter((voice) => String(voice?.lang || '').toLowerCase().startsWith(prefix));
  return matching.find((voice) => voice.localService) || matching[0]
    || list.find((voice) => voice.localService) || list[0] || null;
}

// Read the visual text but skip code and other content that reads badly aloud.
// Block elements are separated with a space so minified HTML cannot glue two
// headings or list items into one spoken word.
export function readableText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('pre, code, script, style, [aria-hidden="true"], .kbd-help')
    .forEach((element) => element.remove());
  clone.querySelectorAll('br').forEach((element) => element.replaceWith(' '));
  clone.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, table, ul, ol, article, section, div')
    .forEach((element) => element.after(' '));
  return clone.textContent || '';
}

export function initReadAloud(root, environment = window) {
  const toggle = root.querySelector('[data-read-toggle]');
  const stopButton = root.querySelector('[data-read-stop]');
  const label = root.querySelector('[data-read-label]');
  const status = root.querySelector('[data-read-status]');
  const document = environment.document;
  const speech = environment.speechSynthesis;
  const Utterance = environment.SpeechSynthesisUtterance;
  if (!toggle || !speech || typeof speech.speak !== 'function' || typeof Utterance !== 'function') return null;

  const source = document?.querySelector(root.dataset.readSource || '.post .prose');
  const chunks = source ? splitForSpeech(readableText(source)) : [];
  if (chunks.length < 2) return null;

  const lang = document?.documentElement?.lang || 'en';
  let index = 0;
  let paused = false;
  let speaking = false;

  function setStatus(text) {
    if (status) status.textContent = text;
  }
  function render() {
    if (label) label.textContent = speaking ? (paused ? PAUSED_LABEL : SPEAKING_LABEL) : IDLE_LABEL;
    toggle.setAttribute('aria-pressed', String(speaking && !paused));
    if (stopButton) stopButton.hidden = !speaking;
    root.dataset.state = speaking ? (paused ? 'paused' : 'speaking') : 'idle';
  }
  function reset(statusText = '') {
    speaking = false;
    paused = false;
    index = 0;
    render();
    setStatus(statusText);
  }
  function speakCurrent() {
    const utterance = new Utterance(chunks[index]);
    utterance.lang = lang;
    const voice = pickVoice(speech.getVoices?.() || [], lang);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (!speaking) return;
      index += 1;
      if (index >= chunks.length) {
        reset('Finished reading');
        return;
      }
      speakCurrent();
    };
    utterance.onerror = () => reset('Reading stopped');
    speech.speak(utterance);
  }
  function start() {
    speech.cancel?.();
    speaking = true;
    paused = false;
    index = 0;
    render();
    setStatus('Reading post');
    speakCurrent();
  }
  function stop(statusText = '') {
    speech.cancel?.();
    reset(statusText);
  }

  toggle.addEventListener('click', () => {
    if (!speaking) {
      start();
    } else if (paused) {
      paused = false;
      speech.resume?.();
      render();
      setStatus('Reading post');
    } else {
      paused = true;
      speech.pause?.();
      render();
      setStatus('Paused');
    }
  });
  stopButton?.addEventListener('click', () => stop('Reading stopped'));
  // Leaving the page should never keep talking in the background.
  environment.addEventListener('pagehide', () => stop());
  environment.addEventListener('beforeunload', () => stop());

  root.hidden = false;
  render();
  return { start, stop, toggle, get state() { return { speaking, paused, index, chunks: chunks.length }; } };
}

if (typeof document !== 'undefined') {
  const root = document.querySelector('[data-read-aloud]');
  if (root) initReadAloud(root);
}
