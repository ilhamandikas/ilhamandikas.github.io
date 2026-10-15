// Bounded ASCII/C-locale regex subset. A Thompson NFA finds leftmost-longest
// matches without JavaScript's backtracking or alternative-order semantics.
export function compilePattern(source, { basic = false, ignoreCase = false, fixed = false, tick = () => {} } = {}) {
  if (!source) throw new Error('Enter a non-empty pattern.');
  if (source.length > 256 || /[^\x20-\x7e\t]/.test(source)) throw new Error('Simulation supports ASCII patterns up to 256 characters, without line breaks.');
  if (fixed) {
    const needle = ignoreCase ? source.toLowerCase() : source;
    return (text, from = 0, word = false) => {
      const haystack = ignoreCase ? text.toLowerCase() : text;
      for (let start = haystack.indexOf(needle, from); start !== -1; start = haystack.indexOf(needle, start + 1)) {
        tick();
        const end = start + needle.length;
        if (!word || boundary(text, start, end)) return { start, end };
      }
      return null;
    };
  }
  // Normalize BRE operator spelling. Escaped groups/intervals and GNU \+ \? \|
  // are operators; their unescaped versions are literal characters in BRE.
  if (basic) {
    let normalized = '';
    let inClass = false;
    let classFirst = false;
    for (let i = 0; i < source.length; i += 1) {
      const c = source[i];
      if (c === '[' && !inClass) { inClass = true; classFirst = true; normalized += c; continue; }
      if (inClass) {
        if (source.startsWith('[:', i)) {
          const end = source.indexOf(':]', i + 2);
          if (end < 0) throw new Error('Unfinished POSIX character class.');
          normalized += source.slice(i, end + 2);
          i = end + 1;
          classFirst = false;
          continue;
        }
        if (c === ']' && !classFirst) inClass = false;
        if (c !== '^' || !classFirst) classFirst = false;
        normalized += c;
        continue;
      }
      if (c === '\\') {
        const next = source[++i];
        if (!next) throw new Error('Pattern ends with an unfinished backslash.');
        normalized += '()+?|{}'.includes(next) ? next : '\\' + next;
      } else normalized += '()+?|{}'.includes(c) ? '\\' + c : c;
    }
    source = normalized;
  }
  let at = 0;
  let depth = 0;
  const fail = (message) => { throw new Error(`Pattern: ${message}`); };
  const classes = {
    digit: '0123456789', lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', alnum: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    xdigit: '0123456789abcdefABCDEF', blank: ' \t', space: ' \t\r\n\v\f',
    cntrl: Array.from({ length: 32 }, (_, i) => String.fromCharCode(i)).join('') + '\x7f',
    print: Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32)).join(''),
    graph: Array.from({ length: 94 }, (_, i) => String.fromCharCode(i + 33)).join(''),
    punct: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
  };
  function bracket() {
    let negate = false;
    if (source[at] === '^') { negate = true; at += 1; }
    const chars = new Set();
    let first = true;
    function unit() {
      if (source.startsWith('[:', at)) {
        const end = source.indexOf(':]', at + 2);
        const key = source.slice(at + 2, end);
        if (end < 0 || !Object.hasOwn(classes, key)) fail('unsupported or unfinished POSIX character class.');
        at = end + 2;
        return [...classes[key]];
      }
      if (source[at] === '[' && ['.', '='].includes(source[at + 1])) fail('collating and equivalence classes are not supported.');
      const c = source[at++];
      if (c === '\\') fail('backslashes inside bracket expressions are not supported in this subset.');
      if (c === undefined) fail('unclosed bracket expression.');
      return [c];
    }
    while (at < source.length && (source[at] !== ']' || first)) {
      const start = unit();
      first = false;
      if (source[at] === '-' && source[at + 1] !== ']' && at + 1 < source.length) {
        at += 1;
        const end = unit();
        if (start.length !== 1 || end.length !== 1 || start[0] > end[0]) fail('use ascending ASCII ranges such as a-z.');
        for (let code = start[0].charCodeAt(0); code <= end[0].charCodeAt(0); code += 1) chars.add(String.fromCharCode(code));
      } else start.forEach((c) => chars.add(c));
    }
    if (source[at++] !== ']') fail('unclosed bracket expression.');
    if (ignoreCase) [...chars].forEach((c) => { chars.add(c.toLowerCase()); chars.add(c.toUpperCase()); });
    return { type: 'char', test: (c) => negate ? !chars.has(c) : chars.has(c) };
  }
  function atom() {
    const c = source[at++];
    if (c === '(') {
      if (++depth > 15) fail('group nesting is limited to 15 levels.');
      const value = alternative();
      if (source[at++] !== ')') fail('unclosed group.');
      depth -= 1;
      return value;
    }
    if (c === '[') return bracket();
    if (c === '.') return { type: 'char', test: () => true };
    if (c === '^' || c === '$') {
      if ((c === '^' && at > 1 && !['(', '|'].includes(source[at - 2])) || (c === '$' && at < source.length && ![')', '|'].includes(source[at]))) fail('anchors are supported only at the start/end of a branch. Escape them for literal characters.');
      return { type: c };
    }
    if ('*+?{}'.includes(c)) fail('a repetition operator needs a preceding expression.');
    let literal = c;
    if (c === '\\') {
      literal = source[at++];
      if (!literal || /[A-Za-z0-9]/.test(literal)) fail('backreferences, shorthand escapes, and GNU word-boundary escapes are not supported. Use POSIX classes such as [[:digit:]].');
    }
    return { type: 'char', test: (value) => ignoreCase ? value.toLowerCase() === literal.toLowerCase() : value === literal };
  }
  function repeated() {
    const value = atom();
    const c = source[at];
    let min;
    let max;
    if (['*', '+', '?'].includes(c)) {
      at += 1;
      min = c === '+' ? 1 : 0;
      max = c === '?' ? 1 : Infinity;
    } else if (c === '{') {
      const match = /^\{(\d+)(?:,(\d*))?\}/.exec(source.slice(at));
      if (!match) fail('use an interval such as {2}, {2,4}, or {2,}.');
      at += match[0].length;
      min = Number(match[1]);
      max = match[2] === undefined ? min : match[2] === '' ? Infinity : Number(match[2]);
      if (min > 50 || (max !== Infinity && max > 50) || max < min) fail('finite repetition bounds must be from 0 to 50, with minimum ≤ maximum.');
    } else return value;
    if (value.type === '^' || value.type === '$') fail('repeating an anchor is not supported.');
    return { type: 'repeat', child: value, min, max };
  }
  function sequence() {
    const parts = [];
    while (at < source.length && ![')', '|'].includes(source[at])) parts.push(repeated());
    if (!parts.length) fail('empty groups and empty alternatives are not supported.');
    return { type: 'sequence', parts };
  }
  function alternative() {
    const parts = [sequence()];
    while (source[at] === '|') { at += 1; parts.push(sequence()); }
    return { type: 'alternative', parts };
  }
  const tree = alternative();
  if (at !== source.length) fail('unexpected closing group or unsupported syntax.');
  const states = [];
  function state(value) {
    if (states.length >= 500) fail('compiled pattern is too large; simplify nested repetition.');
    states.push(value);
    return states.length - 1;
  }
  const accept = state({ type: 'accept' });
  function compile(value, next) {
    if (value.type === 'char' || value.type === '^' || value.type === '$') return state({ ...value, next });
    if (value.type === 'sequence') return value.parts.reduceRight((tail, child) => compile(child, tail), next);
    if (value.type === 'alternative') return state({ type: 'split', next: value.parts.map((child) => compile(child, next)) });
    let tail = next;
    if (value.max === Infinity) {
      const split = state({ type: 'split', next: [] });
      states[split].next = [compile(value.child, split), next];
      tail = split;
    } else {
      for (let i = value.min; i < value.max; i += 1) tail = state({ type: 'split', next: [compile(value.child, tail), tail] });
    }
    for (let i = 0; i < value.min; i += 1) tail = compile(value.child, tail);
    return tail;
  }
  const initial = compile(tree, accept);
  return (text, from = 0, word = false) => {
    let active = new Map();
    let best = null;
    for (let position = from; position <= text.length; position += 1) {
      if (!best && (!word || !isWord(text[position - 1]))) active.set(initial, Math.min(active.get(initial) ?? Infinity, position));
      const stack = [...active];
      const visited = new Map();
      const consuming = new Map();
      while (stack.length) {
        tick();
        const [id, start] = stack.pop();
        if ((visited.get(id) ?? Infinity) <= start || (best && start > best.start)) continue;
        visited.set(id, start);
        const node = states[id];
        if (node.type === 'accept') {
          if ((!word || boundary(text, start, position)) && (!best || start < best.start || (start === best.start && position > best.end))) best = { start, end: position };
        } else if (node.type === 'split') node.next.forEach((next) => stack.push([next, start]));
        else if (node.type === '^' || node.type === '$') {
          if ((node.type === '^' && position === 0) || (node.type === '$' && position === text.length)) stack.push([node.next, start]);
        } else consuming.set(id, Math.min(consuming.get(id) ?? Infinity, start));
      }
      const next = new Map();
      if (position < text.length) {
        for (const [id, start] of consuming) {
          tick();
          if ((!best || start <= best.start) && states[id].test(text[position])) {
            const target = states[id].next;
            next.set(target, Math.min(next.get(target) ?? Infinity, start));
          }
        }
      }
      if (best && !next.size) return best;
      active = next;
    }
    return best;
  };
}
const isWord = (c) => c !== undefined && /^[A-Za-z0-9_]$/.test(c);
const boundary = (text, start, end) => !isWord(text[start - 1]) && !isWord(text[end]);
