// Convert JSON to XML.
const { tk } = window;

const input = document.querySelector('#j2x-input');

const escapeXml = (value) => String(value).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const safeName = (name) => (/^[A-Za-z_][\w.-]*$/.test(name) ? name : 'item');

function build(value, name, indent) {
  const pad = '  '.repeat(indent);
  const tag = safeName(name);

  if (value === null || value === undefined) return `${pad}<${tag}/>`;
  if (Array.isArray(value)) return value.map((item) => build(item, tag, indent)).join('\n');
  if (typeof value !== 'object') return `${pad}<${tag}>${escapeXml(value)}</${tag}>`;

  const attrs = Object.entries(value).filter(([key]) => key.startsWith('@'));
  const children = Object.entries(value).filter(([key]) => !key.startsWith('@') && key !== '#text');
  const text = value['#text'];
  const attrText = attrs.map(([key, val]) => ` ${safeName(key.slice(1))}="${escapeXml(val)}"`).join('');

  if (children.length === 0) {
    return text !== undefined
      ? `${pad}<${tag}${attrText}>${escapeXml(text)}</${tag}>`
      : `${pad}<${tag}${attrText}/>`;
  }
  const inner = children.map(([key, val]) => build(val, key, indent + 1)).join('\n');
  return `${pad}<${tag}${attrText}>\n${inner}\n${pad}</${tag}>`;
}

tk.transform({
  watch: input,
  output: document.querySelector('#j2x-output'),
  status: document.querySelector('#j2x-status'),
  ok: 'Converted',
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const data = JSON.parse(raw);
    const header = '<?xml version="1.0" encoding="UTF-8"?>';
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return `${header}\n${build(data, 'root', 0)}`;
    }
    const [rootName] = Object.keys(data);
    return `${header}\n${build(data[rootName], rootName, 0)}`;
  },
});
