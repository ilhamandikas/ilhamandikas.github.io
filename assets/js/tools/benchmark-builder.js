// Measure how long a snippet takes. Runs in the visitor's own browser.
const { tk } = window;

const code = document.querySelector('#bench-code');
const iterations = document.querySelector('#bench-iter');
const results = document.querySelector('#bench-results');
const status = document.querySelector('#bench-status');

function row(key, value) {
  const el = document.createElement('div');
  el.className = 'tool-result-row';
  el.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
  return el;
}

document.querySelector('#bench-run').addEventListener('click', () => {
  results.replaceChildren();
  const runs = Math.max(1, Math.min(10000000, Number(iterations.value) || 1));
  let fn;
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function(code.value);
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
    return;
  }

  try {
    fn(); // warm-up / syntax check
    const start = performance.now();
    for (let i = 0; i < runs; i += 1) fn();
    const total = performance.now() - start;
    const avg = total / runs;
    const ops = avg > 0 ? 1000 / avg : Infinity;

    results.replaceChildren(
      row('Total time', `${total.toFixed(2)} ms`),
      row('Iterations', runs.toLocaleString()),
      row('Average', `${avg.toFixed(4)} ms`),
      row('Throughput', `${Math.round(ops).toLocaleString()} ops/s`),
    );
    tk.setStatus(status, 'Done', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});
