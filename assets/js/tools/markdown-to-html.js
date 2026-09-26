// Markdown → HTML with a live preview.
import { marked } from '../vendor/marked.js';
const { tk } = window;

const input = document.querySelector('#md-input');
const preview = document.querySelector('#md-preview');
const output = document.querySelector('#md-output');

marked.setOptions({ gfm: true, breaks: true });

function render() {
  const raw = input.value;
  if (raw.trim() === '') {
    preview.replaceChildren();
    output.value = '';
    return;
  }
  const html = marked.parse(raw);
  output.value = html;
  preview.innerHTML = html;
}

tk.live(input, render);
