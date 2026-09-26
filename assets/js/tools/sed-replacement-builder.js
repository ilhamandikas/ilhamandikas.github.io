const { tk } = window;

const mode = document.querySelector('#sed-mode');
const pattern = document.querySelector('#sed-pattern');
const replacement = document.querySelector('#sed-replacement');
const replacementField = document.querySelector('#sed-replacement-field');
const files = document.querySelector('#sed-files');
const delim = document.querySelector('#sed-delim');
const global = document.querySelector('#sed-global');
const ignore = document.querySelector('#sed-ignore');
const extended = document.querySelector('#sed-extended');
const inplace = document.querySelector('#sed-inplace');
const backup = document.querySelector('#sed-backup');
const quiet = document.querySelector('#sed-quiet');
const out = document.querySelector('#sed-out');
const status = document.querySelector('#sed-status');

// A delimiter inside the pattern or replacement has to be escaped, or sed reads
// it as the end of the expression.
function escapeDelim(text, char) {
  return text.split(char).join('\\' + char);
}

function syncMode() {
  replacementField.hidden = mode.value !== 'sub';
}

function build() {
  const type = mode.value;
  const rawPattern = pattern.value;
  const rawReplacement = replacement.value;
  const fileList = files.value.trim();

  if (!rawPattern && !rawReplacement && !fileList) {
    out.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  if (!rawPattern) {
    out.textContent = '';
    tk.setStatus(status, 'Enter a pattern to match.', 'err');
    return;
  }
  if (inplace.checked && !fileList) {
    out.textContent = '';
    tk.setStatus(status, 'In-place editing needs at least one file.', 'err');
    return;
  }

  const d = delim.value;
  const shape = escapeDelim(rawPattern, d);
  let expression;
  let quietFlag = false;
  if (type === 'sub') {
    // -n on its own would print nothing, so pair it with the p flag.
    quietFlag = quiet.checked;
    const flags = `${global.checked ? 'g' : ''}${ignore.checked ? 'I' : ''}${quietFlag ? 'p' : ''}`;
    expression = `s${d}${shape}${d}${escapeDelim(rawReplacement, d)}${d}${flags}`;
  } else if (type === 'delete') {
    expression = `${d}${shape}${d}${ignore.checked ? 'I' : ''}d`;
  } else {
    quietFlag = true;
    expression = `${d}${shape}${d}${ignore.checked ? 'I' : ''}p`;
  }

  const parts = ['sed'];
  if (extended.checked) parts.push('-E');
  if (inplace.checked) parts.push(backup.checked ? '-i.bak' : '-i');
  if (quietFlag) parts.push('-n');
  parts.push(tk.shq(expression));
  if (fileList) parts.push(fileList);

  out.textContent = parts.join(' ');
  tk.setStatus(status, '');
}

mode.addEventListener('change', syncMode);
syncMode();
tk.live([mode, pattern, replacement, files, delim, global, ignore, extended, inplace, backup, quiet], build);
