// TOML → YAML.
import { stringify as toYaml } from '../vendor/yaml.js';
import { parse as parseToml } from '../vendor/toml.js';
const { tk } = window;

const input = document.querySelector('#t2y-input');

tk.transform({
  watch: input,
  output: document.querySelector('#t2y-output'),
  status: document.querySelector('#t2y-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    return toYaml(parseToml(raw), { lineWidth: 0 });
  },
});
