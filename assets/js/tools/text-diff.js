// Line-by-line text diff using a longest common subsequence.
const { tk } = window;

const left = document.querySelector('#td-left');
const right = document.querySelector('#td-right');
const output = document.querySelector('#td-diff');
const status = document.querySelector('#td-status');

function diffLines(a, b) {
  const n = a.length;
  const m = b.length;
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push([' ', a[i]]); i += 1; j += 1; }
    else if (table[i + 1][j] >= table[i][j + 1]) { out.push(['-', a[i]]); i += 1; }
    else { out.push(['+', b[j]]); j += 1; }
  }
  while (i < n) { out.push(['-', a[i]]); i += 1; }
  while (j < m) { out.push(['+', b[j]]); j += 1; }
  return out;
}

document.querySelector('#td-run').addEventListener('click', () => {
  const a = left.value.split('\n');
  const b = right.value.split('\n');
  const lines = diffLines(a, b);
  const added = lines.filter(([sign]) => sign === '+').length;
  const removed = lines.filter(([sign]) => sign === '-').length;

  output.replaceChildren(
    ...lines.map(([sign, text]) => {
      const line = document.createElement('div');
      line.className = `tool-diff-line ${sign === '+' ? 'add' : sign === '-' ? 'del' : 'same'}`;
      line.textContent = `${sign} ${text}`;
      return line;
    }),
  );
  tk.setStatus(status, `+${added}  −${removed}`, added + removed ? 'ok' : '');
});
