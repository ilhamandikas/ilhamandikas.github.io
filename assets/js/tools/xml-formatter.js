// Pretty-print XML with a small indenter (no external libraries).
const { tk } = window;

const input = document.querySelector('#xf-input');

function pretty(xml) {
  const normalised = xml.replace(/>\s*</g, '><').trim();
  const tokens = normalised.match(/<[^>]+>|[^<]+/g) || [];
  const lines = [];
  let depth = 0;

  for (const token of tokens) {
    if (/^<\//.test(token)) {
      depth = Math.max(0, depth - 1);
      lines.push('  '.repeat(depth) + token);
    } else if (/^</.test(token)) {
      lines.push('  '.repeat(depth) + token);
      const selfClosing = /\/>$/.test(token) || /^<\?/.test(token) || /^<!/.test(token);
      if (!selfClosing) depth += 1;
    } else {
      const text = token.trim();
      if (text) lines.push('  '.repeat(depth) + text);
    }
  }
  return lines.join('\n');
}

tk.transform({
  watch: input,
  output: document.querySelector('#xf-output'),
  status: document.querySelector('#xf-status'),
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const doc = new DOMParser().parseFromString(raw, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
    return pretty(raw);
  },
});
