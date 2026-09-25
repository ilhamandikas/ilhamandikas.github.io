// JSON → YAML.
import { stringify as toYaml } from '../vendor/yaml.js';
const { tk } = window;

const input = document.querySelector('#j2y-input');

tk.transform({
  watch: input,
  output: document.querySelector('#j2y-output'),
  status: document.querySelector('#j2y-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    return toYaml(JSON.parse(raw), { lineWidth: 0 });
  },
});
