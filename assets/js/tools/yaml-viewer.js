// Explore a YAML document as a collapsible tree.
import { parse as parseYaml } from '../vendor/yaml.js';
const { tk } = window;

const input = document.querySelector('#yv-input');
const tree = document.querySelector('#yv-tree');
const status = document.querySelector('#yv-status');

function render() {
  const raw = input.value.trim();
  if (raw === '') {
    tree.replaceChildren();
    tk.setStatus(status, '');
    return;
  }
  try {
    tk.tree(tree, parseYaml(raw));
    tk.setStatus(status, 'Parsed', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live(input, render);
