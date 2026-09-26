// Slugify — strip accents, keep alphanumerics, collapse separators.
const { tk } = window;

const input = document.querySelector('#slug-input');
const separator = document.querySelector('#slug-sep');
const lower = document.querySelector('#slug-lower');

function slugify(text, sep, toLower) {
  const base = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // drop combining accents
    .replace(/[^a-zA-Z0-9]+/g, sep);
  const collapsed = base.split(sep).filter(Boolean).join(sep);
  return toLower ? collapsed.toLowerCase() : collapsed;
}

tk.transform({
  watch: [input, separator, lower],
  output: document.querySelector('#slug-output'),
  status: document.querySelector('#slug-status'),
  fn: () => slugify(input.value, separator.value, lower.checked),
});
