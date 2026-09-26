// YAML → JSON.
import { parse as parseYaml } from '../vendor/yaml.js';
const { tk } = window;

const input = document.querySelector('#y2j-input');

tk.transform({
  watch: input,
  output: document.querySelector('#y2j-output'),
  status: document.querySelector('#y2j-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    return JSON.stringify(parseYaml(raw), null, 2);
  },
});
