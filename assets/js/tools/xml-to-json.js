// Convert XML to JSON using the native DOM parser.
const { tk } = window;

const input = document.querySelector('#x2j-input');

function convert(node) {
  const children = [...node.childNodes].filter((n) => n.nodeType === 1);
  const text = [...node.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue.trim()).join('');
  const result = {};

  for (const attr of node.attributes || []) result[`@${attr.name}`] = attr.value;

  if (children.length === 0) {
    if (Object.keys(result).length === 0) return text;
    if (text) result['#text'] = text;
    return result;
  }

  for (const child of children) {
    const value = convert(child);
    if (child.nodeName in result) {
      if (!Array.isArray(result[child.nodeName])) result[child.nodeName] = [result[child.nodeName]];
      result[child.nodeName].push(value);
    } else {
      result[child.nodeName] = value;
    }
  }
  return result;
}

tk.transform({
  watch: input,
  output: document.querySelector('#x2j-output'),
  status: document.querySelector('#x2j-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const doc = new DOMParser().parseFromString(raw, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid XML');
    return JSON.stringify({ [doc.documentElement.nodeName]: convert(doc.documentElement) }, null, 2);
  },
});
