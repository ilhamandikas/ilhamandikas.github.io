// Deliberately a literal, single-line subset: never evaluate shell syntax.
export function parseEnv(text, side) {
  if (text.length > 1000000) throw new Error(`${side}: maximum input size is 1,000,000 characters.`);
  const entries = new Map();
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const fail = (message) => { throw new Error(`${side}, line ${i + 1}: ${message}`); };
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) fail('Expected KEY=value with a letter or underscore at the start of the key.');
    const [, key, raw] = match;
    if (entries.has(key)) fail('Duplicate key. Keep one assignment per key before comparing.');
    let value;
    if (raw.startsWith('"') || raw.startsWith("'")) {
      const quote = raw[0];
      let end = -1;
      for (let j = 1; j < raw.length; j += 1) {
        if (quote === '"' && raw[j] === '\\') { j += 1; continue; }
        if (raw[j] === quote) { end = j; break; }
      }
      if (end === -1) fail('Unclosed quote. Multiline values are not supported; use a single-line value.');
      const tail = raw.slice(end + 1).trim();
      if (tail && !tail.startsWith('#')) fail('Only a comment may follow a quoted value.');
      value = raw.slice(1, end);
    } else {
      if (/["']/.test(raw)) fail('Wrap the entire value in quotes when it contains quote characters.');
      value = raw.split('#', 1)[0].trim();
    }
    entries.set(key, value);
  }
  return entries;
}

export function compareEnv(left, right) {
  return [...new Set([...left.keys(), ...right.keys()])].sort().map((key) => ({
    key,
    kind: !left.has(key) ? 'Only right' : !right.has(key) ? 'Only left' : left.get(key) === right.get(key) ? 'Same' : 'Changed',
    left: left.get(key),
    right: right.get(key),
  }));
}
