// Minify JSON.
const { tk } = window;

const input = document.querySelector('#jmin-input');

tk.transform({
  watch: input,
  output: document.querySelector('#jmin-output'),
  status: document.querySelector('#jmin-status'),
  ok: 'Valid JSON',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    return JSON.stringify(JSON.parse(raw));
  },
});
