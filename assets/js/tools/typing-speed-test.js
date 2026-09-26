// Typing speed test: time or word goal, live WPM/accuracy, per-character feedback.
const { tk } = window;

const WORDS =
  'the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been has had said each she which do their time will about if up out many then them these so some her would make like into him has two more very what know just first also new because day most us'.split(/\s+/);

const PUNCT = ['.', ',', '!', '?', ';', ':'];
const NUMBER = () => {
  const n = Math.random();
  if (n < 0.5) return String(Math.floor(Math.random() * 1000));
  if (n < 0.8) return `${Math.floor(Math.random() * 200)}%`;
  return `${Math.floor(Math.random() * 90) + 10}.${Math.floor(Math.random() * 9)}`;
};

const els = {
  mode: document.querySelector('#ty-mode'),
  punct: document.querySelector('#ty-punct'),
  numbers: document.querySelector('#ty-numbers'),
  restart: document.querySelector('#ty-restart'),
  status: document.querySelector('#ty-status'),
  wpm: document.querySelector('#ty-wpm'),
  acc: document.querySelector('#ty-acc'),
  time: document.querySelector('#ty-time'),
  timeLabel: document.querySelector('#ty-time-label'),
  words: document.querySelector('#ty-words'),
  input: document.querySelector('#ty-input'),
  result: document.querySelector('#ty-result'),
};

let words = [];
let wordEls = [];
let targetStr = '';
let mode = 'time';
let goal = 30;
let running = false;
let finished = false;
let startedAt = 0;
let elapsed = 0;
let raf = null;
let lastValue = '';
let lastCur = 0;
let keyTotal = 0;
let keyErrors = 0;
let samples = [];

function parseMode(value) {
  const [kind, amount] = String(value).split(':');
  return { mode: kind === 'words' ? 'words' : 'time', goal: Number(amount) || 30 };
}

function generate(count, punctuation, numbers) {
  const out = [];
  for (let i = 0; i < count; i += 1) {
    let word = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (numbers && Math.random() < 0.14) word = NUMBER();
    if (punctuation && Math.random() < 0.2) {
      word = Math.random() < 0.35 ? `${word}${PUNCT[Math.floor(Math.random() * PUNCT.length)]}` : word;
    }
    if (punctuation && Math.random() < 0.12) word = word[0].toUpperCase() + word.slice(1);
    out.push(word);
  }
  return out;
}

function paintWord(index, typed, isCurrent) {
  const el = wordEls[index];
  if (!el) return;
  const target = words[index] || '';
  const value = typed === undefined ? '' : typed;
  el.className = 'ty-word';
  if (isCurrent) el.classList.add('is-current');
  else if (value === target) el.classList.add('is-done');
  else if (value) el.classList.add('is-bad');

  const fragment = document.createDocumentFragment();
  const length = Math.max(target.length, value.length);
  for (let j = 0; j <= length; j += 1) {
    if (isCurrent && j === value.length) {
      const caret = document.createElement('span');
      caret.className = 'ty-caret';
      fragment.appendChild(caret);
    }
    if (j === length) break;
    const span = document.createElement('span');
    span.className = 'ty-char';
    if (j < value.length) {
      const ok = j < target.length && value[j] === target[j];
      span.classList.add(ok ? 'is-ok' : 'is-bad');
      span.textContent = j < target.length ? target[j] : value[j];
    } else {
      span.textContent = target[j];
    }
    fragment.appendChild(span);
  }
  el.replaceChildren(fragment);
}

function paint() {
  const typedWords = els.input.value.split(' ');
  const current = Math.min(typedWords.length - 1, words.length - 1);
  const from = Math.max(0, Math.min(lastCur, current) - 1);
  const to = Math.max(lastCur, current);
  for (let i = from; i <= to && i < words.length; i += 1) {
    paintWord(i, typedWords[i], i === current && !finished);
  }
  lastCur = current;
  const active = wordEls[current];
  if (active) {
    const target = active.offsetTop - els.words.clientHeight / 2 + active.clientHeight / 2;
    els.words.scrollTop = Math.max(0, target);
  }
}

function stats() {
  const typedWords = els.input.value.split(' ');
  let correct = 0;
  let total = 0;
  for (let i = 0; i < typedWords.length; i += 1) {
    const target = words[i] || '';
    const typed = typedWords[i];
    for (let j = 0; j < typed.length; j += 1) {
      total += 1;
      if (j < target.length && typed[j] === target[j]) correct += 1;
    }
  }
  const minutes = elapsed / 60;
  return {
    wpm: minutes > 0 ? Math.round(correct / 5 / minutes) : 0,
    raw: minutes > 0 ? Math.round(total / 5 / minutes) : 0,
    accuracy: keyTotal > 0 ? Math.round(((keyTotal - keyErrors) / keyTotal) * 100) : 100,
    correct,
    wrong: total - correct,
    typed: total,
  };
}

function live() {
  const s = stats();
  els.wpm.textContent = String(s.wpm);
  els.acc.textContent = `${s.accuracy}%`;
  if (mode === 'time') {
    els.time.textContent = String(Math.max(0, Math.ceil(goal - elapsed)));
    els.timeLabel.textContent = 'seconds left';
  } else {
    els.time.textContent = String(Math.floor(elapsed));
    els.timeLabel.textContent = 'seconds';
  }
}

function loop() {
  if (!running) return;
  elapsed = (performance.now() - startedAt) / 1000;
  const second = Math.floor(elapsed);
  if (samples.length <= second) samples[second] = stats().raw;
  live();
  if (mode === 'time' && elapsed >= goal) {
    finish();
    return;
  }
  raf = requestAnimationFrame(loop);
}

function start() {
  running = true;
  startedAt = performance.now();
  raf = requestAnimationFrame(loop);
}

function consistency(rawValues) {
  const values = rawValues.filter((value) => value > 0);
  if (values.length < 2) return 100;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.max(0, Math.round((1 - Math.sqrt(variance) / mean) * 100));
}

function finish() {
  finished = true;
  running = false;
  cancelAnimationFrame(raf);
  elapsed = mode === 'time' ? goal : elapsed;
  live();
  const s = stats();
  const rows = [
    ['Net WPM', String(s.wpm)],
    ['Raw WPM', String(s.raw)],
    ['Accuracy', `${s.accuracy}%`],
    ['Consistency', `${consistency(samples)}%`],
    ['Characters', `${s.correct} correct · ${s.wrong} wrong`],
    ['Keystrokes', `${keyTotal} total · ${keyErrors} wrong`],
    ['Time', `${elapsed.toFixed(1)}s`],
    ['Mode', mode === 'time' ? `${goal}s time` : `${goal} words`],
  ];
  els.result.replaceChildren(
    ...rows.map(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }),
  );
  tk.setStatus(els.status, 'Test complete — press Enter to go again', 'ok');
}

function newTest() {
  running = false;
  finished = false;
  cancelAnimationFrame(raf);
  const config = parseMode(els.mode.value);
  mode = config.mode;
  goal = config.goal;
  words = generate(mode === 'time' ? 260 : goal, els.punct.checked, els.numbers.checked);
  targetStr = words.join(' ');
  wordEls = words.map((word) => {
    const el = document.createElement('span');
    el.className = 'ty-word';
    for (const ch of word) {
      const span = document.createElement('span');
      span.className = 'ty-char';
      span.textContent = ch;
      el.appendChild(span);
    }
    return el;
  });
  els.words.replaceChildren(...wordEls);
  els.words.scrollTop = 0;
  els.input.value = '';
  lastValue = '';
  lastCur = 0;
  keyTotal = 0;
  keyErrors = 0;
  elapsed = 0;
  samples = [];
  paintWord(0, '', true);
  els.result.replaceChildren();
  els.wpm.textContent = '0';
  els.acc.textContent = '100%';
  live();
  tk.setStatus(els.status, '');
  els.input.focus({ preventScroll: true });
}

els.input.addEventListener('input', () => {
  if (finished) return;
  const value = els.input.value;
  if (!running && value.length > 0) start();
  if (value.length > lastValue.length) {
    for (let i = lastValue.length; i < value.length; i += 1) {
      keyTotal += 1;
      if (value[i] !== targetStr[i]) keyErrors += 1;
    }
  }
  lastValue = value;
  paint();
  if (value.length >= targetStr.length) finish();
});

els.input.addEventListener('keydown', (event) => {
  if (finished && event.key === 'Enter') {
    event.preventDefault();
    newTest();
  }
});

els.mode.addEventListener('change', newTest);
els.punct.addEventListener('change', newTest);
els.numbers.addEventListener('change', newTest);
els.restart.addEventListener('click', newTest);

newTest();
