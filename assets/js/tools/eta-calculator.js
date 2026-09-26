// Estimate the time remaining from progress so far.
const { tk } = window;

const total = document.querySelector('#eta-total');
const done = document.querySelector('#eta-done');
const elapsed = document.querySelector('#eta-elapsed');
const results = document.querySelector('#eta-results');

function human(seconds) {
  if (!Number.isFinite(seconds)) return '—';
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(' ');
}

function render() {
  const n = Number(total.value);
  const d = Number(done.value);
  const e = Number(elapsed.value);
  if (!Number.isFinite(n) || !Number.isFinite(d) || !Number.isFinite(e) || n <= 0 || d <= 0 || e <= 0 || d > n) {
    results.replaceChildren();
    return;
  }
  const perItem = e / d;
  const remaining = n - d;
  const eta = perItem * remaining;
  const finish = new Date(Date.now() + eta * 1000);

  const rows = [
    ['Progress', `${((d / n) * 100).toFixed(1)}%`],
    ['Time per item', human(perItem)],
    ['Items remaining', remaining],
    ['Remaining time', human(eta)],
    ['Estimated finish', finish.toLocaleString()],
  ];
  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
      return row;
    }),
  );
}

tk.live([total, done, elapsed], render);
