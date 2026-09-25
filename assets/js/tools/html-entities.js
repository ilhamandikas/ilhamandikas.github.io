// HTML entity encoder/decoder. Encode via a text node, decode via DOMParser
// (inert, so nothing in the input can execute or load).
const { tk } = window;

const input = document.querySelector('#he-input');
const decode = document.querySelector('#he-decode');
const scratch = document.createElement('div');

tk.transform({
  watch: [input, decode],
  output: document.querySelector('#he-output'),
  status: document.querySelector('#he-status'),
  fn: () => {
    if (decode.checked) {
      return new DOMParser().parseFromString(input.value, 'text/html').documentElement.textContent;
    }
    scratch.textContent = input.value;
    return scratch.innerHTML;
  },
});
