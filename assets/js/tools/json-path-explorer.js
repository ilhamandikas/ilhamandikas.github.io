// JSON Path Explorer: evaluate a JSONPath expression against a pasted JSON
// document, list every match with its path, and browse the document as a tree
// whose keys build the expression for you. The JSONPath engine is vendored, so
// everything runs in the page.
import { JSONPath } from '../vendor/jsonpath.js';

const { tk } = window;

const els = {
  input: document.querySelector('#jpe-input'),
  path: document.querySelector('#jpe-path'),
  run: document.querySelector('#jpe-run'),
  summary: document.querySelector('#jpe-summary'),
  results: document.querySelector('#jpe-results'),
  result: document.querySelector('#jpe-result'),
  tree: document.querySelector('#jpe-tree'),
  status: document.querySelector('#jpe-status'),
};

let lastJson = null;

const isIdentifier = (key) => /^[A-Za-z_$][\w$]*$/.test(key);

function childPath(base, key, isIndex) {
  if (isIndex) return `${base}[${key}]`;
  if (isIdentifier(key)) return `${base}.${key}`;
  return `${base}['${String(key).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`;
}

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function leafNode(value, path, key) {
  const row = document.createElement('div');
  row.className = 'jpe-leaf';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'jpe-key';
  btn.textContent = key === null ? path : String(key);
  btn.title = `Use ${path}`;
  btn.addEventListener('click', () => setPath(path));
  const sep = document.createElement('span');
  sep.className = 'jpe-sep';
  sep.textContent = ': ';
  const val = document.createElement('span');
  val.className = `jpe-value jpe-${typeOf(value)}`;
  val.textContent = JSON.stringify(value);
  row.append(btn, sep, val);
  return row;
}

function branchNode(value, path, key) {
  const isArray = Array.isArray(value);
  const entries = isArray ? value.map((_, index) => index) : Object.keys(value);
  const details = document.createElement('details');
  details.className = 'jpe-node';
  details.open = path === '$';

  const summary = document.createElement('summary');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'jpe-key';
  btn.textContent = key === null ? path : String(key);
  btn.title = `Use ${path}`;
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    setPath(path);
  });
  const meta = document.createElement('span');
  meta.className = 'jpe-meta';
  meta.textContent = isArray ? `[${value.length}]` : `{${entries.length}}`;
  summary.append(btn, meta);
  details.append(summary);

  const children = document.createElement('div');
  children.className = 'jpe-children';
  for (const childKey of entries) {
    const childValue = value[childKey];
    const child = childValue !== null && typeof childValue === 'object'
      ? branchNode(childValue, childPath(path, childKey, isArray), childKey)
      : leafNode(childValue, childPath(path, childKey, isArray), childKey);
    children.append(child);
  }
  details.append(children);
  return details;
}

function renderTree(data) {
  els.tree.replaceChildren();
  els.tree.append(data !== null && typeof data === 'object'
    ? branchNode(data, '$', null)
    : leafNode(data, '$', null));
}

function showJsonError(error) {
  tk.setStatus(els.status, `JSON error: ${error.message}`, 'err');
  els.summary.textContent = '';
  els.results.replaceChildren();
  els.result.value = '';
  els.tree.replaceChildren();
  lastJson = null;
}

function evaluate() {
  let data;
  try {
    data = JSON.parse(els.input.value);
  } catch (error) {
    showJsonError(error);
    return;
  }

  if (els.input.value !== lastJson) {
    renderTree(data);
    lastJson = els.input.value;
  }

  const path = els.path.value.trim();
  if (!path) {
    tk.setStatus(els.status, '', '');
    els.summary.textContent = 'Enter a JSONPath expression.';
    els.results.replaceChildren();
    els.result.value = '';
    return;
  }

  let matches;
  try {
    matches = JSONPath({ path, json: data, resultType: 'all' });
  } catch (error) {
    tk.setStatus(els.status, `Path error: ${error.message}`, 'err');
    els.summary.textContent = '';
    els.results.replaceChildren();
    els.result.value = '';
    return;
  }

  const label = `${matches.length} match${matches.length === 1 ? '' : 'es'}`;
  els.summary.textContent = `${label} for ${path}`;
  els.result.value = JSON.stringify(matches.map((match) => match.value), null, 2);
  tk.setStatus(els.status, `${label}.`, matches.length ? 'ok' : '');

  els.results.replaceChildren();
  if (!matches.length) {
    const note = document.createElement('p');
    note.className = 'tool-note';
    note.textContent = 'No matches. Check the expression, or click a key in the tree below.';
    els.results.append(note);
    return;
  }

  matches.forEach((match, index) => {
    const row = document.createElement('div');
    row.className = 'jpe-match';
    const head = document.createElement('div');
    head.className = 'jpe-match-head';
    const badge = document.createElement('span');
    badge.className = 'jpe-index';
    badge.textContent = `#${index + 1}`;
    const pathEl = document.createElement('code');
    pathEl.className = 'jpe-match-path';
    pathEl.textContent = match.path;
    head.append(badge, pathEl);
    const value = document.createElement('pre');
    value.className = 'jpe-match-value';
    value.textContent = typeof match.value === 'string' ? match.value : JSON.stringify(match.value, null, 2);
    row.append(head, value);
    els.results.append(row);
  });
}

function setPath(path) {
  els.path.value = path;
  evaluate();
  tk.setStatus(els.status, `Path set to ${path}`, 'ok');
}

els.input.addEventListener('input', tk.debounce(evaluate, 250));
els.path.addEventListener('input', tk.debounce(evaluate, 150));
els.run.addEventListener('click', evaluate);
document.querySelectorAll('[data-path]').forEach((btn) => {
  btn.addEventListener('click', () => {
    els.path.value = btn.dataset.path;
    evaluate();
  });
});

evaluate();
