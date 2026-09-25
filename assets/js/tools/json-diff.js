// Structural JSON diff.
const { tk } = window;

const left = document.querySelector('#jd-left');
const right = document.querySelector('#jd-right');
const output = document.querySelector('#jd-diff');
const status = document.querySelector('#jd-status');

const typeOf = (value) => (Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value);

function diff(a, b, path, out) {
  if (typeOf(a) !== typeOf(b)) {
    out.push({ kind: 'change', path, from: a, to: b });
    return;
  }
  if (typeOf(a) === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of [...keys].sort()) {
      const child = path ? `${path}.${key}` : key;
      if (!(key in a)) out.push({ kind: 'add', path: child, to: b[key] });
      else if (!(key in b)) out.push({ kind: 'remove', path: child, from: a[key] });
      else diff(a[key], b[key], child, out);
    }
    return;
  }
  if (typeOf(a) === 'array') {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i += 1) {
      const child = `${path}[${i}]`;
      if (i >= a.length) out.push({ kind: 'add', path: child, to: b[i] });
      else if (i >= b.length) out.push({ kind: 'remove', path: child, from: a[i] });
      else diff(a[i], b[i], child, out);
    }
    return;
  }
  if (a !== b) out.push({ kind: 'change', path, from: a, to: b });
}

const show = (value) => JSON.stringify(value);

document.querySelector('#jd-run').addEventListener('click', () => {
  output.replaceChildren();
  let a;
  let b;
  try {
    a = left.value.trim() ? JSON.parse(left.value) : {};
    b = right.value.trim() ? JSON.parse(right.value) : {};
  } catch (error) {
    tk.setStatus(status, `Invalid JSON: ${error.message}`, 'err');
    return;
  }

  const changes = [];
  diff(a, b, '', changes);

  if (changes.length === 0) {
    tk.setStatus(status, 'Identical', 'ok');
    return;
  }

  output.replaceChildren(
    ...changes.map((change) => {
      const line = document.createElement('div');
      line.className = `tool-diff-line ${change.kind === 'remove' ? 'del' : 'add'}`;
      if (change.kind === 'add') line.textContent = `+ ${change.path}: ${show(change.to)}`;
      else if (change.kind === 'remove') line.textContent = `- ${change.path}: ${show(change.from)}`;
      else line.textContent = `~ ${change.path}: ${show(change.from)} → ${show(change.to)}`;
      return line;
    }),
  );
  tk.setStatus(status, `${changes.length} difference${changes.length === 1 ? '' : 's'}`, 'ok');
});
