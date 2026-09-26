// Filter docker compose logs the way grep would, with context lines.
const { tk } = window;

const input = document.querySelector('#dlg-input');
const pattern = document.querySelector('#dlg-pattern');
const mode = document.querySelector('#dlg-mode');
const before = document.querySelector('#dlg-before');
const after = document.querySelector('#dlg-after');
const regexOn = document.querySelector('#dlg-regex');
const icase = document.querySelector('#dlg-icase');
const word = document.querySelector('#dlg-word');
const numbers = document.querySelector('#dlg-numbers');
const output = document.querySelector('#dlg-output');
const meta = document.querySelector('#dlg-meta');
const status = document.querySelector('#dlg-status');

function matcher() {
  const raw = pattern.value;
  if (raw === '') return { test: () => true };
  // With regex off, escape everything so a dot or a bracket is a literal.
  let source = regexOn.checked ? raw : raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (word.checked) source = `\\b(?:${source})\\b`;
  const re = new RegExp(source, icase.checked ? 'i' : '');
  return { test: (line) => re.test(line) };
}

const pad = (n, width) => String(n).padStart(width);
const lineLabel = (i, width, isMatch) => (numbers.checked ? `${pad(i + 1, width)}${isMatch ? ':' : '-'}` : '');

function render() {
  const text = input.value;
  if (text === '') {
    output.value = '';
    meta.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  try {
    const lines = text.split(/\r?\n/);
    const test = matcher().test;
    const hits = [];
    for (let i = 0; i < lines.length; i += 1) if (test(lines[i])) hits.push(i);
    const hitSet = new Set(hits);
    const width = String(lines.length).length;
    const kind = mode.value;
    let out = '';

    if (kind === 'count') {
      out = `${hits.length} matching line${hits.length === 1 ? '' : 's'}\n${lines.length} lines scanned`;
    } else if (kind === 'only') {
      out = hits.map((i) => `${lineLabel(i, width, true)}${lines[i]}`).join('\n');
    } else if (kind === 'invert') {
      out = lines
        .map((line, i) => ({ line, i }))
        .filter(({ i }) => !hitSet.has(i))
        .map(({ line, i }) => `${lineLabel(i, width, true)}${line}`)
        .join('\n');
    } else if (kind === 'unique') {
      const counts = new Map();
      for (const i of hits) counts.set(lines[i], (counts.get(lines[i]) || 0) + 1);
      out = [...counts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([line, count]) => `${pad(count, 4)}  ${line}`)
        .join('\n');
    } else {
      const b = Math.max(0, Number(before.value) || 0);
      const a = Math.max(0, Number(after.value) || 0);
      const keep = new Set();
      for (const i of hits) {
        for (let j = Math.max(0, i - b); j <= Math.min(lines.length - 1, i + a); j += 1) keep.add(j);
      }
      const groups = [];
      let group = null;
      for (const i of [...keep].sort((x, y) => x - y)) {
        if (!group || i > group[group.length - 1] + 1) {
          group = [];
          groups.push(group);
        }
        group.push(i);
      }
      out = groups
        .map((g) => g.map((i) => `${lineLabel(i, width, hitSet.has(i))}${lines[i]}`).join('\n'))
        .join('\n--\n');
    }

    output.value = out;
    meta.textContent = `${hits.length} match${hits.length === 1 ? '' : 'es'} · ${lines.length} lines scanned`;
    tk.setStatus(status, hits.length ? `Found ${hits.length} matching line${hits.length === 1 ? '' : 's'}` : 'No matches', hits.length ? 'ok' : '');
  } catch (error) {
    output.value = '';
    meta.textContent = '';
    tk.setStatus(status, error.message, 'err');
  }
}

document.querySelector('#dlg-clear').addEventListener('click', () => {
  input.value = '';
  pattern.value = '';
  output.value = '';
  meta.textContent = '';
  tk.setStatus(status, '');
});

tk.live([input, pattern, mode, before, after, regexOn, icase, word, numbers], render);
