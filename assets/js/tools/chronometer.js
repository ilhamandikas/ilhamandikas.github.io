// Stopwatch with laps.
const { tk } = window;

const display = document.querySelector('#chrono-display');
const toggle = document.querySelector('#chrono-toggle');
const lapButton = document.querySelector('#chrono-lap');
const reset = document.querySelector('#chrono-reset');
const laps = document.querySelector('#chrono-laps');

let running = false;
let startedAt = 0;
let accumulated = 0;
let timer = null;
let lapCount = 0;

function current() {
  return accumulated + (running ? performance.now() - startedAt : 0);
}

function format(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function paint() {
  display.textContent = format(current());
}

function tick() {
  paint();
  timer = requestAnimationFrame(tick);
}

toggle.addEventListener('click', () => {
  if (running) {
    accumulated = current();
    running = false;
    cancelAnimationFrame(timer);
    toggle.textContent = 'Resume';
  } else {
    startedAt = performance.now();
    running = true;
    tick();
    toggle.textContent = 'Pause';
  }
  paint();
});

lapButton.addEventListener('click', () => {
  lapCount += 1;
  const row = document.createElement('div');
  row.className = 'tool-result-row';
  row.innerHTML = `<dt>Lap ${lapCount}</dt><dd>${format(current())}</dd>`;
  laps.prepend(row);
});

reset.addEventListener('click', () => {
  running = false;
  cancelAnimationFrame(timer);
  accumulated = 0;
  lapCount = 0;
  toggle.textContent = 'Start';
  laps.replaceChildren();
  paint();
});

paint();
