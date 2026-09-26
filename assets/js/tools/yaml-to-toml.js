// YAML → TOML (via JSON, which both formats can represent).
import { parse as parseYaml } from '../vendor/yaml.js';
import { stringify as toToml } from '../vendor/toml.js';
const { tk } = window;

const input = document.querySelector('#y2t-input');

tk.transform({
  watch: input,
  output: document.querySelector('#y2t-output'),
  status: document.querySelector('#y2t-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const data = parseYaml(raw);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('TOML documents need a mapping at the top level');
    }
    return toToml(data);
  },
});
