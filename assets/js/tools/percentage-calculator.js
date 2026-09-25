// Percentage calculator — the common relationships between two values.
const { tk } = window;

const a = document.querySelector('#pct-a');
const b = document.querySelector('#pct-b');
const results = document.querySelector('#pct-results');

const round = (n) => (Number.isFinite(n) ? Number(n.toFixed(4)) : NaN);

function render() {
  const x = Number(a.value);
  const y = Number(b.value);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    results.replaceChildren();
    return;
  }
  const change = x === 0 ? NaN : ((y - x) / Math.abs(x)) * 100;
  const rows = [
    [`${x}% of ${y}`, round((x / 100) * y)],
    [`${x} is what % of ${y}`, round((x / y) * 100) + '%'],
    [`${y} is what % of ${x}`, round((y / x) * 100) + '%'],
    [`Change from ${x} to ${y}`, Number.isFinite(change) ? round(change) + '%' : '—'],
    ['Sum', round(x + y)],
    ['Difference', round(x - y)],
    ['Ratio', round(x / y)],
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

tk.live([a, b], render);
