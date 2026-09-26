// TOML → JSON.
import { parse as parseToml } from '../vendor/toml.js';
const { tk } = window;

const input = document.querySelector('#t2j-input');

tk.transform({
  watch: input,
  output: document.querySelector('#t2j-output'),
  status: document.querySelector('#t2j-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    return JSON.stringify(parseToml(raw), null, 2);
  },
});
