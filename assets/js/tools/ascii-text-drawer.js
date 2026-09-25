// Draw text as ASCII art.
import figlet from '../vendor/figlet.js';
const { tk } = window;

const text = document.querySelector('#atd-text');
const font = document.querySelector('#atd-font');
const width = document.querySelector('#atd-width');
const output = document.querySelector('#atd-output');
const status = document.querySelector('#atd-status');

function render() {
  const value = text.value;
  if (value.trim() === '') { output.textContent = ''; tk.setStatus(status, ''); return; }
  try {
    output.textContent = figlet.textSync(value, {
      font: font.value,
      width: Math.max(20, Math.min(200, Number(width.value) || 80)),
    });
    tk.setStatus(status, 'Ready', 'ok');
  } catch (error) {
    output.textContent = '';
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live([text, font, width], render);
