// Lorem ipsum generator.
const { tk } = window;

const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et ' +
  'dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo ' +
  'consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint ' +
  'occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

const CLASSIC = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const count = document.querySelector('#lorem-count');
const unit = document.querySelector('#lorem-unit');
const classic = document.querySelector('#lorem-classic');
const output = document.querySelector('#lorem-output');

const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

function sentence() {
  const length = 8 + Math.floor(Math.random() * 10);
  const words = Array.from({ length }, pick);
  return `${capitalise(words.join(' '))}.`;
}

function paragraph() {
  const length = 3 + Math.floor(Math.random() * 3);
  return Array.from({ length }, sentence).join(' ');
}

function generate() {
  const amount = Math.max(1, Math.min(100, Number(count.value) || 1));
  let text;
  if (unit.value === 'words') {
    text = Array.from({ length: amount }, pick).join(' ');
    if (classic.checked) text = `${CLASSIC.split(' ').slice(0, amount).join(' ')}`;
  } else if (unit.value === 'sentences') {
    text = Array.from({ length: amount }, sentence).join(' ');
  } else {
    text = Array.from({ length: amount }, paragraph).join('\n\n');
  }
  if (classic.checked && unit.value === 'paragraphs') {
    text = `${CLASSIC}\n\n${text}`;
  }
  output.value = text;
}

document.querySelector('#lorem-generate').addEventListener('click', generate);
[count, unit, classic].forEach((el) => el.addEventListener('change', generate));
generate();
