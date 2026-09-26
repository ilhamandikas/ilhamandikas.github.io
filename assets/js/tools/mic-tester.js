// Open the microphone, draw its loudness on a bar, and record a clip that can be
// played back. Everything stays in the page: the level is measured in memory and
// the recording is a blob that is never uploaded.
const { tk } = window;

const els = {
  start: document.querySelector('#mic-start'),
  stop: document.querySelector('#mic-stop'),
  status: document.querySelector('#mic-status'),
  meter: document.querySelector('#mic-meter'),
  bar: document.querySelector('#mic-bar'),
  peak: document.querySelector('#mic-peak'),
  level: document.querySelector('#mic-level'),
  peakValue: document.querySelector('#mic-peak-value'),
  device: document.querySelector('#mic-device'),
  record: document.querySelector('#mic-record'),
  recordStop: document.querySelector('#mic-record-stop'),
  recordStatus: document.querySelector('#mic-record-status'),
  time: document.querySelector('#mic-time'),
  result: document.querySelector('#mic-result'),
  audio: document.querySelector('#mic-audio'),
  length: document.querySelector('#mic-length'),
  size: document.querySelector('#mic-size'),
  type: document.querySelector('#mic-type'),
  download: document.querySelector('#mic-download'),
  discard: document.querySelector('#mic-discard'),
};

// The meter spans this many decibels below full scale.
const FLOOR = -60;
const CLIP = -1;
const EXTENSIONS = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3' };
const PREFERRED = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

let stream = null;
let context = null;
let analyser = null;
let samples = null;
let frame = 0;
let peakDb = FLOOR;
let recorder = null;
let chunks = [];
let startedAt = 0;
let timer = 0;
let clip = null;
let clipUrl = '';

function canListen() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function canRecord() {
  return typeof window.MediaRecorder === 'function';
}

function clock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function percent(db) {
  return Math.max(0, Math.min(100, ((db - FLOOR) / -FLOOR) * 100));
}

function show(db, clipping) {
  els.bar.style.width = `${percent(db).toFixed(1)}%`;
  els.peak.style.left = `${percent(peakDb).toFixed(1)}%`;
  els.level.textContent = `${db.toFixed(1)} dBFS`;
  els.peakValue.textContent = `${peakDb.toFixed(1)} dBFS`;
  els.meter.classList.toggle('mic-clip', clipping);
}

function measure() {
  analyser.getByteTimeDomainData(samples);
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = (samples[i] - 128) / 128;
    sum += value * value;
  }
  const rms = Math.sqrt(sum / samples.length);
  const db = Math.max(FLOOR, rms > 0 ? 20 * Math.log10(rms) : FLOOR);
  peakDb = Math.max(peakDb, db);
  show(db, peakDb >= CLIP);
  frame = requestAnimationFrame(measure);
}

// A clip is only ever a blob in this tab, so the object url behind the player has
// to be handed back when the clip is replaced or dropped.
function forgetClip() {
  if (clipUrl) URL.revokeObjectURL(clipUrl);
  clipUrl = '';
  clip = null;
  els.audio.removeAttribute('src');
  els.result.hidden = true;
}

function stopTimer() {
  if (timer) window.clearInterval(timer);
  timer = 0;
}

function finish() {
  stopTimer();
  const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  els.time.textContent = clock(seconds);
  els.record.disabled = false;
  els.recordStop.disabled = true;

  const mime = (recorder && recorder.mimeType) || 'audio/webm';
  const blob = new Blob(chunks, { type: mime });
  chunks = [];
  recorder = null;

  if (!blob.size) {
    tk.setStatus(els.recordStatus, 'Nothing was captured. Check the input device and try again.');
    return;
  }

  forgetClip();
  clip = blob;
  clipUrl = URL.createObjectURL(blob);
  els.audio.src = clipUrl;
  els.result.hidden = false;
  els.length.textContent = clock(seconds);
  els.size.textContent = tk.formatBytes(blob.size);
  els.type.textContent = mime.replace(/^audio\//, '').replace(';codecs=', ' · ');
  tk.setStatus(els.recordStatus, `Recorded ${clock(seconds)}. Play it back below.`, 'ok');
}

function startRecording() {
  if (!stream || !canRecord()) return;
  const mimeType = PREFERRED.find((type) => window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported(type));
  try {
    recorder = mimeType ? new window.MediaRecorder(stream, { mimeType }) : new window.MediaRecorder(stream);
  } catch {
    recorder = new window.MediaRecorder(stream);
  }
  chunks = [];
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data && event.data.size) chunks.push(event.data);
  });
  recorder.addEventListener('stop', finish);
  recorder.start();
  startedAt = Date.now();
  els.time.textContent = '0:00';
  timer = window.setInterval(() => {
    els.time.textContent = clock(Math.floor((Date.now() - startedAt) / 1000));
  }, 500);
  els.record.disabled = true;
  els.recordStop.disabled = false;
  tk.setStatus(els.recordStatus, 'Recording. The clip stays in this tab.');
}

function release() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (recorder) recorder.stop();
  stopTimer();
  if (stream) stream.getTracks().forEach((track) => track.stop());
  if (context && context.state !== 'closed') context.close();
  stream = null;
  context = null;
  analyser = null;
  samples = null;
  els.start.disabled = false;
  els.stop.disabled = true;
  els.record.disabled = true;
  els.recordStop.disabled = true;
  els.meter.classList.remove('mic-clip');
}

function reasonFor(error) {
  const name = String((error && error.name) || '');
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'The microphone was blocked. Allow it for this site in the browser settings, then try again.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No microphone was found on this device.';
  if (name === 'NotReadableError') return 'The microphone is already in use by another program.';
  return 'The microphone could not be started.';
}

async function start() {
  if (!canListen()) return;
  els.start.disabled = true;
  tk.setStatus(els.status, 'Asking for permission to use the microphone.');

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    context = new AudioCtor();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.6;
    samples = new Uint8Array(analyser.fftSize);
    context.createMediaStreamSource(stream).connect(analyser);

    const track = stream.getAudioTracks()[0];
    els.device.textContent = track && track.label ? track.label : 'Default input';
    els.stop.disabled = false;
    els.record.disabled = !canRecord();
    peakDb = FLOOR;
    show(FLOOR, false);
    tk.setStatus(els.status, 'Listening. Speak and watch the bar move.', 'ok');
    if (canRecord()) tk.setStatus(els.recordStatus, '');
    else tk.setStatus(els.recordStatus, 'This browser cannot record audio, so the meter is all it can do.');
    measure();
  } catch (error) {
    release();
    tk.setStatus(els.status, reasonFor(error), 'err');
  }
}

if (!canListen()) {
  // Leave a note rather than a dead button, and never as an error: nothing has
  // been attempted yet.
  els.start.disabled = true;
  tk.setStatus(els.status, 'This browser does not offer a microphone to the page.');
} else if (!canRecord()) {
  els.record.title = 'This browser cannot record audio.';
}

els.start.addEventListener('click', start);

els.stop.addEventListener('click', () => {
  release();
  peakDb = FLOOR;
  els.device.textContent = '—';
  els.level.textContent = '—';
  els.peakValue.textContent = '—';
  els.bar.style.width = '0%';
  els.peak.style.left = '0%';
  els.time.textContent = '0:00';
  tk.setStatus(els.status, 'Stopped. The microphone is released and the level is back at rest.');
});

els.record.addEventListener('click', startRecording);
els.recordStop.addEventListener('click', () => {
  if (recorder) recorder.stop();
});

els.discard.addEventListener('click', () => {
  forgetClip();
  els.time.textContent = '0:00';
  els.length.textContent = '—';
  els.size.textContent = '—';
  els.type.textContent = '—';
  tk.setStatus(els.recordStatus, 'Discarded. Nothing was written to disk.');
});

els.download.addEventListener('click', () => {
  if (!clip) return;
  const mime = clip.type || 'audio/webm';
  const extension = EXTENSIONS[mime] || 'webm';
  const name = `recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${extension}`;
  tk.download(name, clip, mime);
  tk.setStatus(els.recordStatus, `Saved ${name}.`, 'ok');
});

// Releasing the tracks matters: a held stream keeps the browser's recording
// indicator on after the tab is gone.
window.addEventListener('pagehide', () => {
  release();
  stopTimer();
  if (clipUrl) URL.revokeObjectURL(clipUrl);
  clipUrl = '';
});
