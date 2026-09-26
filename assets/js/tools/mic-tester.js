// Open the microphone, measure its loudness and draw the level on a bar.
// Nothing is recorded: the analyser reads the audio graph as it passes through.
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
};

// The meter spans this many decibels below full scale.
const FLOOR = -60;
const CLIP = -1;

let stream = null;
let context = null;
let analyser = null;
let samples = null;
let frame = 0;
let peakDb = FLOOR;

function supported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
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

function release() {
  cancelAnimationFrame(frame);
  frame = 0;
  if (stream) stream.getTracks().forEach((track) => track.stop());
  if (context && context.state !== 'closed') context.close();
  stream = null;
  context = null;
  analyser = null;
  samples = null;
  els.start.disabled = false;
  els.stop.disabled = true;
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
  if (!supported()) return;
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
    peakDb = FLOOR;
    show(FLOOR, false);
    tk.setStatus(els.status, 'Listening. Speak and watch the bar move.', 'ok');
    measure();
  } catch (error) {
    release();
    tk.setStatus(els.status, reasonFor(error), 'err');
  }
}

if (!supported()) {
  // Leave a note rather than a dead button, and never as an error: nothing has
  // been attempted yet.
  els.start.disabled = true;
  tk.setStatus(els.status, 'This browser does not offer a microphone to the page.');
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
  tk.setStatus(els.status, 'Stopped. The microphone is released and the level is back at rest.');
});

// Releasing the tracks matters: a held stream keeps the browser's recording
// indicator on after the tab is gone.
window.addEventListener('pagehide', release);
