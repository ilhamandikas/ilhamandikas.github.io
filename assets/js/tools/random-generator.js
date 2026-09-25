const { tk } = window;

const itemsInput = document.querySelector('#rnd-items');
const mode = document.querySelector('#rnd-mode');
const countInput = document.querySelector('#rnd-count');
const unique = document.querySelector('#rnd-unique');
const go = document.querySelector('#rnd-go');
const visual = document.querySelector('#rnd-visual');
const results = document.querySelector('#rnd-results');
const status = document.querySelector('#rnd-status');

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
  results.replaceChildren();
  for (const value of out) {
    const li = document.createElement('li');
    li.textContent = value;
    results.append(li);
  }
}

function animate(out, all) {
  const chosen = out[0] || '?';
  visual.className = `random-visual ${mode.value} spin`;
  visual.textContent = mode.value === 'dice' ? String(rand(6) + 1) : all[rand(all.length)] || '?';
  let ticks = 0;
  const timer = setInterval(() => {
    ticks += 1;
    visual.textContent = mode.value === 'dice' ? String(rand(6) + 1) : all[rand(all.length)] || '?';
    if (ticks >= 16) {
      clearInterval(timer);
      visual.className = `random-visual ${mode.value}`;
      visual.textContent = chosen;
      render(out);
      tk.setStatus(status, `Picked ${out.length} item${out.length === 1 ? '' : 's'}`, 'ok');
    }
  }, 60);
}

function generate() {
  const list = items();
  if (list.length === 0) {
    render([]);
    visual.textContent = '?';
    tk.setStatus(status, 'Add at least one item', 'err');
    return;
  }
  const count = Math.max(1, Math.min(20, Number(countInput.value) || 1));
  countInput.value = String(count);
  const out = pick(list, count, unique.checked);
  animate(out, list);
}

go.addEventListener('click', generate);
tk.live([mode], () => { visual.className = `random-visual ${mode.value}`; });
generate();
