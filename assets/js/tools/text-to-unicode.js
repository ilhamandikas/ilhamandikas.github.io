// Text <-> Unicode code points.
const { tk } = window;

const input = document.querySelector('#uni-input');
const direction = document.querySelector('#uni-dir');

const encode = (text) =>
  [...text].map((ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ');

const TOKEN = /^(?:U\+([0-9a-f]{1,6})|\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|0x([0-9a-f]{1,6}))$/i;
const ANY = /U\+([0-9a-f]{1,6})|\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|0x([0-9a-f]{1,6})/gi;

const pointOf = (match) => String.fromCodePoint(parseInt(match[1] || match[2] || match[3] || match[4], 16));

const decode = (text) => {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length && tokens.every((token) => TOKEN.test(token))) {
    return tokens.map((token) => pointOf(token.match(TOKEN))).join('');
  }
  return text.replace(ANY, (...args) => pointOf(args));
};

tk.transform({
  watch: [input, direction],
  output: document.querySelector('#uni-output'),
  status: document.querySelector('#uni-status'),
  fn: () => (direction.value === 'encode' ? encode(input.value) : decode(input.value)),
});
