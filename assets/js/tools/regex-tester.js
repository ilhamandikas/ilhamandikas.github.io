// Regular expression tester with live highlighting and capture groups.
const { tk } = window;

const patternInput = document.querySelector('#re-pattern');
const flagsInput = document.querySelector('#re-flags');
const textInput = document.querySelector('#re-text');
const highlight = document.querySelector('#re-highlight');
const matches = document.querySelector('#re-matches');
const status = document.querySelector('#re-status');

const escapeHtml = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function render() {
  const pattern = patternInput.value;
  const text = textInput.value;
  matches.replaceChildren();
  highlight.textContent = text;

  if (pattern === '') {
    tk.setStatus(status, '');
    return;
  }

  let regex;
  try {
    regex = new RegExp(pattern, flagsInput.value);
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
    return;
  }

  const found = [];
  if (regex.global || regex.sticky) {
    let match;
    let guard = 0;
    while ((match = regex.exec(text)) !== null && guard < 5000) {
      found.push(match);
      if (match[0] === '') regex.lastIndex += 1;
      guard += 1;
    }
  } else {
    const match = regex.exec(text);
    if (match) found.push(match);
  }

  if (found.length === 0) {
    // "No matches" is a result, not a mistake — keep it neutral.
    tk.setStatus(status, 'No matches');
    return;
  }

  // Highlight
  let out = '';
  let cursor = 0;
  for (const match of found) {
    if (match.index < cursor) continue;
    out += escapeHtml(text.slice(cursor, match.index));
    out += `<mark>${escapeHtml(match[0])}</mark>`;
    cursor = match.index + match[0].length;
  }
  out += escapeHtml(text.slice(cursor));
  highlight.innerHTML = out;

  // Match list
  matches.replaceChildren(
    ...found.map((match, index) => {
      const item = document.createElement('div');
      item.className = 'tool-cheat-item';
      const groups = match.slice(1).map((g, i) => `$${i + 1}=${g === undefined ? '—' : g}`).join('  ');
      item.innerHTML = `<code>#${index + 1} @${match.index}</code><span>${escapeHtml(match[0]) || '(empty)'}${groups ? `   ·   ${escapeHtml(groups)}` : ''}</span>`;
      return item;
    }),
  );
  tk.setStatus(status, `${found.length} match${found.length === 1 ? '' : 'es'}`, 'ok');
}

tk.live([patternInput, flagsInput, textInput], render);
