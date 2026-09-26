const { tk } = window;

const itemsInput = document.querySelector('#rnd-items');
const mode = document.querySelector('#rnd-mode');
const countInput = document.querySelector('#rnd-count');
const unique = document.querySelector('#rnd-unique');
const go = document.querySelector('#rnd-go');
const visual = document.querySelector('#rnd-visual');
const results = document.querySelector('#rnd-results');
const status = document.querySelector('#rnd-status');

// Ticks get further apart towards the end, so the stage slows down and lands
// instead of stopping mid-flicker.
const TICKS = 16;
const FIRST_GAP = 40;
const GAP_GROWTH = 7;

let spin = null;
let last = [];

function items() {
  return itemsInput.value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function rand(max) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
}

function pick(list, count, noDuplicates) {
  if (list.length === 0) return [];
  const pool = [...list];
  const out = [];
  const limit = noDuplicates ? Math.min(count, pool.length) : count;
  for (let i = 0; i < limit; i += 1) {
    const index = rand(pool.length);
    out.push(pool[index]);
    if (noDuplicates) pool.splice(index, 1);
  }
  return out;
}

function render(out) {
  results.replaceChildren(
    ...out.map((value, index) => {
      const li = document.createElement('li');
      li.textContent = value;
      li.style.setProperty('--random-i', String(index));
      return li;
    }),
  );
}

function show() {
  visual.classList.remove('spin');
  visual.classList.add('done');
  visual.textContent = last[0] || '?';
}

function stop() {
  if (spin) clearTimeout(spin);
  spin = null;
}

function animate(out, all) {
  stop();
  last = out;
  const chosen = out[0] || '?';
  const name = mode.value;
  let ticks = 0;
  let gap = FIRST_GAP;

  visual.className = `random-visual ${name} spin`;
  results.replaceChildren();
  tk.setStatus(status, 'Choosing an item.');

  const step = () => {
    ticks += 1;
    if (ticks >= TICKS) {
      spin = null;
      show();
      render(out);
      tk.setStatus(status, `Picked ${out.length} item${out.length === 1 ? '' : 's'}`, 'ok');
      return;
    }
    visual.textContent = name === 'dice' ? String(rand(6) + 1) : all[rand(all.length)] || '?';
    gap += GAP_GROWTH;
    spin = setTimeout(step, gap);
  };
  step();
}

function generate() {
  const list = items();
  if (list.length === 0) {
    stop();
    last = [];
    render([]);
    visual.className = 'random-visual ' + mode.value;
    visual.textContent = '?';
    tk.setStatus(status, 'Add at least one item to pick from', 'err');
    return;
  }
  const count = Math.max(1, Math.min(20, Number(countInput.value) || 1));
  countInput.value = String(count);
  animate(pick(list, count, unique.checked), list);
}

mode.addEventListener('change', () => {
  // Changing the mode mid-spin should settle on what was already drawn.
  stop();
  visual.className = `random-visual ${mode.value}`;
  if (last.length) show();
});

go.addEventListener('click', generate);
window.addEventListener('pagehide', stop);

generate();
