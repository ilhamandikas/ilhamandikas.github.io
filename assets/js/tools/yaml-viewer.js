// Explore a YAML document as a collapsible tree.
import { parse as parseYaml } from '../vendor/yaml.js';
const { tk } = window;

const input = document.querySelector('#yv-input');
const tree = document.querySelector('#yv-tree');
const status = document.querySelector('#yv-status');

function node(key, value, depth) {
  const isObject = value !== null && typeof value === 'object';
  if (!isObject) {
    const row = document.createElement('div');
    row.className = 'tree-leaf';
    row.innerHTML = `<span class="tree-key">${key === null ? '' : `${key}:`}</span> <span class="tree-value">${JSON.stringify(value)}</span>`;
    return row;
  }
  const details = document.createElement('details');
  details.open = depth < 2;
  const summary = document.createElement('summary');
  const entries = Array.isArray(value) ? value.map((item, i) => [i, item]) : Object.entries(value);
  summary.innerHTML = `<span class="tree-key">${key === null ? '' : `${key}:`}</span> <span class="tree-type">${Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}</span>`;
  details.appendChild(summary);
  const inner = document.createElement('div');
  inner.className = 'tree-children';
  for (const [childKey, childValue] of entries) inner.appendChild(node(childKey, childValue, depth + 1));
  details.appendChild(inner);
  return details;
}

function render() {
  tree.replaceChildren();
  const raw = input.value.trim();
  if (raw === '') { tk.setStatus(status, ''); return; }
  try {
    const data = parseYaml(raw);
    tree.appendChild(node(null, data, 0));
    tk.setStatus(status, 'Parsed', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live(input, render);
