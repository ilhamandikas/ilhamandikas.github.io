// Spell text with the NATO phonetic alphabet, and back.
const { tk } = window;

const NATO = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf',
  H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November',
  O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform',
  V: 'Victor', W: 'Whiskey', X: 'Xray', Y: 'Yankee', Z: 'Zulu',
  0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four',
  5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner',
};
const REVERSE = Object.fromEntries(Object.entries(NATO).map(([key, word]) => [word.toLowerCase(), key]));

const input = document.querySelector('#nato-input');
const direction = document.querySelector('#nato-dir');

const encode = (text) => [...text.toUpperCase()].map((ch) => NATO[ch] ?? ch).join(' ');
const decode = (text) => text.split(/\s+/).filter(Boolean).map((word) => REVERSE[word.toLowerCase()] ?? word).join('');

tk.transform({
  watch: [input, direction],
  output: document.querySelector('#nato-output'),
  status: document.querySelector('#nato-status'),
  fn: () => (direction.value === 'encode' ? encode(input.value) : decode(input.value)),
});
