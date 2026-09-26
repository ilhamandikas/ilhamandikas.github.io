const { tk } = window;

const pattern = document.querySelector('#grp-pattern');
const path = document.querySelector('#grp-path');
const style = document.querySelector('#grp-style');
const include = document.querySelector('#grp-include');
const exclude = document.querySelector('#grp-exclude');
const context = document.querySelector('#grp-context');
const recursive = document.querySelector('#grp-recursive');
const ignore = document.querySelector('#grp-ignore');
const numbers = document.querySelector('#grp-numbers');
const word = document.querySelector('#grp-word');
const invert = document.querySelector('#grp-invert');
const count = document.querySelector('#grp-count');
const only = document.querySelector('#grp-only');
const listFiles = document.querySelector('#grp-files');
const skipBinary = document.querySelector('#grp-skip-binary');
const out = document.querySelector('#grp-out');
const status = document.querySelector('#grp-status');

const STYLE = { E: '-E', G: '', F: '-F', P: '-P' };

function build() {
  const needle = pattern.value;
  const includeValue = include.value.trim();
  const excludeValue = exclude.value.trim();
  const contextValue = context.value.trim();
  const searchPath = path.value.trim();
  const touched = path.value || includeValue || excludeValue || contextValue;

  if (!needle) {
    out.textContent = '';
    tk.setStatus(status, touched ? 'Enter a pattern to search for.' : '', touched ? 'err' : '');
    return;
  }

  const parts = ['grep'];
  if (STYLE[style.value]) parts.push(STYLE[style.value]);
  if (recursive.checked) parts.push('-r');
  if (ignore.checked) parts.push('-i');
  if (numbers.checked) parts.push('-n');
  if (word.checked) parts.push('-w');
  if (invert.checked) parts.push('-v');
  if (count.checked) parts.push('-c');
  if (only.checked) parts.push('-o');
  if (listFiles.checked) parts.push('-l');
  if (skipBinary.checked) parts.push('-I');
  if (contextValue) parts.push('-C', contextValue);
  if (includeValue) parts.push(`--include=${tk.shq(includeValue)}`);
  if (excludeValue) {
    excludeValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((dir) => parts.push(`--exclude-dir=${tk.shq(dir)}`));
  }
  parts.push(tk.shq(needle));
  parts.push(searchPath || (recursive.checked ? '.' : ''));

  out.textContent = parts.filter(Boolean).join(' ');
  tk.setStatus(status, '');
}

tk.live(
  [pattern, path, style, include, exclude, context, recursive, ignore, numbers, word, invert, count, only, listFiles, skipBinary],
  build,
);
