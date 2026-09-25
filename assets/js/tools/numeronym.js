// Turn words into numeronyms (internationalization -> i18n).
const { tk } = window;

const input = document.querySelector('#num-input');

function numeronym(word) {
  const letters = [...word];
  if (letters.length <= 3) return word;
  return `${letters[0]}${letters.length - 2}${letters[letters.length - 1]}`;
}

tk.transform({
  watch: input,
  output: document.querySelector('#num-output'),
  status: document.querySelector('#num-status'),
  fn: () => input.value.split(/(\s+)/).map((token) => (/^[\p{L}]+$/u.test(token) ? numeronym(token) : token)).join(''),
});
