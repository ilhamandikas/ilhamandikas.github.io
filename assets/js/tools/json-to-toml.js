// JSON → TOML.
import { stringify as toToml } from '../vendor/toml.js';
const { tk } = window;

const input = document.querySelector('#j2t-input');

tk.transform({
  watch: input,
  output: document.querySelector('#j2t-output'),
  status: document.querySelector('#j2t-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error('TOML documents need a JSON object at the top level');
    }
    return toToml(data);
  },
});
