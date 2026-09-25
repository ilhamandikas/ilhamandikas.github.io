const { tk } = window;

const patternField = document.querySelector('#rr-pattern');
const flagsField = document.querySelector('#rr-flags');
const replaceField = document.querySelector('#rr-replace');
const textField = document.querySelector('#rr-text');
const preview = document.querySelector('#rr-preview');
const output = document.querySelector('#rr-output');
const status = document.querySelector('#rr-status');

const escapeHtml = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function render() {
  const pattern = patternField.value;
  const text = textField.value;
  output.value = '';
  preview.textContent = text;
  if (!pattern) {
    tk.setStatus(status, '');
    return;
  }
  let regex;
  try {
    regex = new RegExp(pattern, flagsField.value);
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
    return;
  }

  let replaced;
  try {
    replaced = text.replace(regex, replaceField.value);
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
    return;
  }
  output.value = replaced;

  const matches = [];
  if (regex.global || regex.sticky) {
    const scan = new RegExp(pattern, flagsField.value.includes('g') ? flagsField.value : `${flagsField.value}g`);
    let match;
    let guard = 0;
    while ((match = scan.exec(text)) !== null && guard < 5000) {
      matches.push(match);
      if (match[0] === '') scan.lastIndex += 1;
      guard += 1;
    }
  } else {
    const match = regex.exec(text);
    if (match) matches.push(match);
  }

  let out = '';
  let cursor = 0;
  for (const match of matches) {
    if (match.index < cursor) continue;
    out += escapeHtml(text.slice(cursor, match.index));
    out += `<mark>${escapeHtml(match[0]) || '(empty)'}</mark>`;
    cursor = match.index + match[0].length;
  }
  out += escapeHtml(text.slice(cursor));
  preview.innerHTML = out;
  tk.setStatus(status, matches.length ? `${matches.length} replacement${matches.length === 1 ? '' : 's'}` : 'No matches', matches.length ? 'ok' : '');
}

tk.live([patternField, flagsField, replaceField, textField], render);
