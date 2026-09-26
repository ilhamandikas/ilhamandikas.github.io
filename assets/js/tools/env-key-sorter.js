const { tk } = window;

const input = document.querySelector('#env-input');
const order = document.querySelector('#env-order');
const ignoreCase = document.querySelector('#env-case');
const unique = document.querySelector('#env-unique');
const align = document.querySelector('#env-align');
const output = document.querySelector('#env-output');
const status = document.querySelector('#env-status');

const KEY = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.]*)\s*=/;
const HEAD = /^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_.]*)(\s*)=(.*)$/;

// A key line is anything that looks like NAME=... . Everything else — comments,
// blanks, stray text — is kept around the keys it sits next to.
function keyOf(line) {
  const match = line.match(KEY);
  return match ? match[1] : null;
}

// Split the file into a top block, one block per key (its comments plus the key
// line) and a trailing block, so sorting moves a comment with its key.
function parse(text) {
  const entries = [];
  let header = null;
  let pending = [];
  for (const line of text.split(/\r?\n/)) {
    const key = keyOf(line);
    if (key === null) {
      pending.push(line);
      continue;
    }
    if (header === null) {
      header = pending;
      pending = [];
    }
    entries.push({ key, lines: pending.concat(line) });
    pending = [];
  }
  return { header: header || [], entries, tail: pending };
}

function tidy(lines) {
  return lines.filter((line) => line.trim() !== '');
}

function headOf(line) {
  const match = line.match(HEAD);
  return match ? match[1] + match[2] : '';
}

function alignLine(line, width) {
  const match = line.match(HEAD);
  if (!match) return line;
  const head = match[1] + match[2];
  return `${head}${' '.repeat(Math.max(0, width - head.length))}=${match[4]}`;
}

function render() {
  const { header, entries, tail } = parse(input.value);
  const same = (key) => (ignoreCase.checked ? key.toLowerCase() : key);

  let kept = entries;
  let dropped = 0;
  if (unique.checked) {
    const last = new Map();
    entries.forEach((entry, index) => last.set(same(entry.key), index));
    kept = entries.filter((entry, index) => last.get(same(entry.key)) === index);
    dropped = entries.length - kept.length;
  }

  const sorted = [...kept].sort((a, b) => {
    const cmp = a.key.localeCompare(b.key, undefined, {
      numeric: true,
      sensitivity: ignoreCase.checked ? 'base' : 'variant',
    });
    return order.value === 'desc' ? -cmp : cmp;
  });

  const width = align.checked
    ? Math.max(0, ...sorted.map((entry) => headOf(entry.lines[entry.lines.length - 1]).length))
    : 0;

  const out = [];
  tidy(header).forEach((line) => out.push(line));
  sorted.forEach((entry) => {
    const lines = entry.lines;
    tidy(lines.slice(0, -1)).forEach((line) => out.push(line));
    const keyLine = lines[lines.length - 1];
    out.push(align.checked ? alignLine(keyLine, width) : keyLine);
  });
  tidy(tail).forEach((line) => out.push(line));
  output.value = out.join('\n');

  if (!entries.length) {
    tk.setStatus(status, input.value.trim() ? 'No KEY=value lines found.' : '', 'err');
    return;
  }
  let message = `${kept.length} key${kept.length === 1 ? '' : 's'}`;
  if (dropped) message += `, ${dropped} duplicate${dropped === 1 ? '' : 's'} dropped`;
  tk.setStatus(status, message);
}

tk.live([input, order, ignoreCase, unique, align], render);
