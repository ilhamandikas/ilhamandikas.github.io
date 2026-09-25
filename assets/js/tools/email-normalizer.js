// Normalise email addresses (one per line).
const { tk } = window;

const input = document.querySelector('#email-input');

function normalise(address) {
  const trimmed = address.trim();
  if (trimmed === '') return '';
  const at = trimmed.lastIndexOf('@');
  if (at < 1) return trimmed;
  let local = trimmed.slice(0, at).toLowerCase();
  let domain = trimmed.slice(at + 1).toLowerCase();

  // Provider-specific canonicalisation.
  if (['gmail.com', 'googlemail.com'].includes(domain)) {
    domain = 'gmail.com';
    local = local.split('+')[0].replace(/\./g, '');
  } else {
    local = local.split('+')[0];
  }
  return `${local}@${domain}`;
}

tk.transform({
  watch: input,
  output: document.querySelector('#email-output'),
  status: document.querySelector('#email-status'),
  fn: () => input.value.split('\n').map(normalise).join('\n'),
});
