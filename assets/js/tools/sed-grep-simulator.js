import { compilePattern } from './posix-text-pattern.js';

function inputLines(text) {
  if (text.length > 50000) throw new Error('Simulation limit: 50,000 input characters.');
  if (/[^\x01-\x7f]/.test(text)) throw new Error('Simulation supports ASCII text without NUL only, using C-locale matching rules. Unicode and binary data need native sed/grep.');
  const lines = text.split('\n');
  if (lines.at(-1) === '') lines.pop();
  if (lines.length > 5000 || lines.some((line) => line.length > 5000)) throw new Error('Simulation limit: 5,000 lines and 5,000 characters per line.');
  return lines.map((value, index) => ({ value, terminated: index < lines.length - 1 || text.endsWith('\n') }));
}
function matcher(pattern, options) {
  let work = 0;
  return compilePattern(pattern, { ...options, tick: () => { if (++work > 2000000) throw new Error('Simulation work limit reached. Shorten the sample or simplify the pattern.'); } });
}
function outputText(parts) {
  const output = parts.join('');
  if (output.length > 200000) throw new Error('Simulation output exceeds 200,000 characters. Use a smaller sample or replacement.');
  return output;
}
function replacementParts(source) {
  if (source.length > 1000) throw new Error('Simulation replacement limit: 1,000 characters.');
  if (/[^\x20-\x7e\t]/.test(source)) throw new Error('Simulation replacement supports ASCII without literal line breaks. Use \\n to insert a newline.');
  const parts = [];
  let literal = '';
  const flush = () => { if (literal) parts.push(literal); literal = ''; };
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (c === '&') { flush(); parts.push(null); }
    else if (c === '\\') {
      const next = source[++i];
      if (next === '\\' || next === '&' || '/|#@,'.includes(next ?? '\0')) literal += next;
      else if (next === 'n') literal += '\n';
      else if (next === 't') literal += '\t';
      else throw new Error('Simulation replacement supports &, \\&, \\\\, \\n, and \\t. Capture backreferences and case-conversion escapes are not supported.');
    } else literal += c;
  }
  flush();
  return parts;
}
export function simulateSed(settings) {
  const lines = inputLines(settings.text);
  const find = matcher(settings.pattern, { basic: !settings.extended, ignoreCase: settings.ignore });
  if (!['sub', 'delete', 'print'].includes(settings.mode)) throw new Error('Choose a supported sed operation.');
  const replacement = settings.mode === 'sub' ? replacementParts(settings.replacement) : [];
  const output = [];
  let affected = 0;
  let size = 0;
  for (const line of lines) {
    let match = find(line.value);
    if (match) affected += 1;
    if (settings.mode === 'delete' && match) continue;
    if (settings.mode === 'print' && !match) continue;
    let value = line.value;
    if (settings.mode === 'sub') {
      if (settings.quiet && !match) continue;
      const parts = [];
      let cursor = 0;
      let builtLength = 0;
      let lastEnd = -1;
      let nonempty = false;
      while (match) {
        if (match.start === match.end && nonempty && match.start === lastEnd) {
          if (match.end === line.value.length) break;
          match = find(line.value, match.end + 1);
          continue;
        }
        const pieces = [line.value.slice(cursor, match.start), ...replacement.map((part) => part === null ? line.value.slice(match.start, match.end) : part)];
        builtLength += pieces.reduce((sum, part) => sum + part.length, 0);
        if (builtLength > 200000) throw new Error('Simulation output limit reached. Shorten the sample or replacement.');
        parts.push(...pieces);
        cursor = match.end;
        lastEnd = match.end;
        nonempty = match.end > match.start;
        if (!settings.global || (!nonempty && match.end === line.value.length)) break;
        match = find(line.value, match.end + (nonempty ? 0 : 1));
      }
      parts.push(line.value.slice(cursor));
      value = outputText(parts);
    }
    size += value.length + (line.terminated ? 1 : 0);
    if (size > 200000) throw new Error('Simulation output limit reached.');
    output.push(value, line.terminated ? '\n' : '');
  }
  return { output: outputText(output), summary: `${lines.length} input lines; ${affected} matched lines. Files and in-place editing are not simulated.` };
}
export function simulateGrep(settings) {
  if (settings.style === 'P') throw new Error('Perl regex (-P) is not supported by this simulator. Use fixed strings, basic, or extended regex.');
  if (!['E', 'G', 'F'].includes(settings.style)) throw new Error('Choose a supported grep pattern style.');
  const lines = inputLines(settings.text);
  const find = matcher(settings.pattern, { basic: settings.style === 'G', fixed: settings.style === 'F', ignoreCase: settings.ignore });
  const context = settings.context === '' ? 0 : Number(settings.context);
  if (!Number.isInteger(context) || context < 0 || context > 50) throw new Error('Simulation context limit: a whole number from 0 to 50.');
  const selected = lines.map((line) => !!find(line.value, 0, settings.word) !== !!settings.invert);
  const count = selected.filter(Boolean).length;
  let output;
  if (settings.count) output = `${count}\n`;
  else {
    const visible = new Set();
    selected.forEach((yes, index) => {
      if (yes) for (let n = Math.max(0, index - context); n <= Math.min(lines.length - 1, index + context); n += 1) visible.add(n);
    });
    const parts = [];
    let previous = -2;
    for (const index of [...visible].sort((a, b) => a - b)) {
      if (context && previous >= 0 && index > previous + 1) parts.push('--\n');
      const separator = selected[index] ? ':' : '-';
      const prefix = settings.numbers ? `${index + 1}${separator}` : '';
      if (settings.only) {
        let from = 0;
        let match;
        while (from <= lines[index].value.length && (match = find(lines[index].value, from, settings.word))) {
          if (match.end > match.start) parts.push(`${prefix}${lines[index].value.slice(match.start, match.end)}\n`);
          from = match.end + (match.end === match.start ? 1 : 0);
        }
      } else parts.push(`${prefix}${lines[index].value}\n`);
      previous = index;
    }
    output = outputText(parts);
  }
  return { output, summary: `${count} selected lines out of ${lines.length}; simulated grep exit status ${count ? 0 : 1}. Single virtual input: sample.txt. Paths, recursion, file filters, and binary-file behavior are not simulated.` };
}
