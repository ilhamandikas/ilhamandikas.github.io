// Hash or verify text with bcrypt.
import bcrypt from '../vendor/bcrypt.js';
const { tk } = window;

const mode = document.querySelector('#bc-mode');
const rounds = document.querySelector('#bc-rounds');
const input = document.querySelector('#bc-input');
const hashField = document.querySelector('#bc-hash');
const output = document.querySelector('#bc-output');
const status = document.querySelector('#bc-status');

document.querySelector('#bc-run').addEventListener('click', () => {
  try {
    if (input.value === '') throw new Error('Enter some text first');
    if (mode.value === 'hash') {
      const cost = Math.max(4, Math.min(15, Number(rounds.value) || 10));
      output.value = bcrypt.hashSync(input.value, bcrypt.genSaltSync(cost));
      tk.setStatus(status, `Hashed with cost ${cost}`, 'ok');
    } else {
      if (hashField.value.trim() === '') throw new Error('Paste a bcrypt hash to compare against');
      const match = bcrypt.compareSync(input.value, hashField.value.trim());
      output.value = match ? 'match' : 'no match';
      tk.setStatus(status, match ? 'The text matches the hash' : 'The text does not match', match ? 'ok' : 'err');
    }
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message, 'err');
  }
});
