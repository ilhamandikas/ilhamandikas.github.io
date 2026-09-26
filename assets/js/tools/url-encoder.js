// URL encoder/decoder — native encodeURIComponent / decodeURIComponent.
const { tk } = window;

const input = document.querySelector('#url-input');
const decode = document.querySelector('#url-decode');

tk.transform({
  watch: [input, decode],
  output: document.querySelector('#url-output'),
  status: document.querySelector('#url-status'),
  ok: 'Valid',
  fn: () => (decode.checked ? decodeURIComponent(input.value) : encodeURIComponent(input.value)),
});
