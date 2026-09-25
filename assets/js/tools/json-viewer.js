// Inspect a JSON document as a collapsible tree.
const { tk } = window;

const input = document.querySelector('#jv-input');
const sort = document.querySelector('#jv-sort');
const tree = document.querySelector('#jv-tree');
const status = document.querySelector('#jv-status');

function count(value) {
  if (value === null || typeof value !== 'object') return 0;
  return Object.values(value).reduce((total, child) => total + 1 + count(child), 0);
}

function render() {
  const raw = input.value.trim();
  if (raw === '') {
    tree.replaceChildren();
    tk.setStatus(status, '');
    return;
  }
  try {
    const data = tk.sortDeep(JSON.parse(raw), sort.value);
    tk.tree(tree, data, { openDepth: 1 });
    const nodes = count(data);
    tk.setStatus(status, `Valid JSON — ${nodes} nested value${nodes === 1 ? '' : 's'}`, 'ok');
  } catch (error) {
    tree.replaceChildren();
    tk.setStatus(status, error.message, 'err');
  }
}

document.querySelector('#jv-expand').addEventListener('click', () => tk.treeOpenAll(tree, true));
document.querySelector('#jv-collapse').addEventListener('click', () => tk.treeOpenAll(tree, false));

tk.live([input, sort], render);
