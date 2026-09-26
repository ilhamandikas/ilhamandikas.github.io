const { tk } = window;

const input = document.querySelector('#waf-input');
const preview = document.querySelector('#waf-preview');
const status = document.querySelector('#waf-status');
const buttons = document.querySelectorAll('[data-wa]');

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (char) => ESCAPES[char]);
}

// WhatsApp's markers are plain characters, so escape the text first and only
// then turn the markers into tags.
function toHtml(text) {
  let html = escapeHtml(text);
  html = html.replace(/```([\s\S]+?)```/g, '<code>$1</code>');
  html = html.replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  html = html.replace(/~([^~\n]+)~/g, '<del>$1</del>');
  return html.replace(/\n/g, '<br>');
}

function render() {
  preview.innerHTML = toHtml(input.value);
  tk.setStatus(status, '');
}

// jsdom does not implement setRangeText, so splice the string directly.
function replaceRange(value, start, end, text) {
  return value.slice(0, start) + text + value.slice(end);
}

function wrap(marker) {
  const { selectionStart: start, selectionEnd: end, value } = input;
  input.value = replaceRange(value, start, end, marker + value.slice(start, end) + marker);
  const caret = end === start ? start + marker.length : start + marker.length * 2 + (end - start);
  input.setSelectionRange(caret, caret);
  render();
}

function list(marker) {
  const { selectionStart: start, selectionEnd: end, value } = input;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = value.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = value.length;
  const block = value.slice(lineStart, lineEnd);
  const updated = block
    .split('\n')
    .map((line, index) => `${marker === '1.' ? `${index + 1}. ` : `${marker} `}${line}`)
    .join('\n');
  input.value = replaceRange(value, lineStart, lineEnd, updated);
  render();
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.waList) list(button.dataset.wa);
    else wrap(button.dataset.wa);
  });
});

input.addEventListener('input', render);
render();
