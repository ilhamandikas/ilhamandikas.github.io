export function line(value, label, required = true) {
  const text = String(value ?? '');
  if (required && !text) throw new Error(`${label}: enter a value.`);
  if (/[\x00-\x1f\x7f]/.test(text)) throw new Error(`${label}: control characters and line breaks are not supported.`);
  if (text.startsWith('~')) throw new Error(`${label}: tilde expansion is not supported. Use a full path or a literal path starting with ./ instead.`);
  if (text.length > 4096) throw new Error(`${label}: maximum 4,096 characters.`);
  if (text !== text.trim()) throw new Error(`${label}: remove surrounding whitespace. Spaces inside a value are supported.`);
  return text;
}
export function lines(value, label) {
  const text = String(value ?? '');
  if (text.length > 30000) throw new Error(`${label}: maximum 30,000 characters.`);
  const values = text.split(/\r\n|\n|\r/).filter((item) => item !== '');
  if (values.length > 100) throw new Error(`${label}: maximum 100 non-empty lines.`);
  values.forEach((item) => line(item, label));
  return values;
}
export function integer(value, label, min, max) {
  const text = String(value);
  if (!/^\d+$/.test(text) || Number(text) < min || Number(text) > max) throw new Error(`${label}: enter a whole number from ${min} to ${max}.`);
  return Number(text);
}
export function explicitPath(value, label) {
  const text = line(value, label);
  if (!(text.startsWith('/') || text.startsWith('./')) || text.startsWith('//') || text.split('/').includes('..') || /[*?\[\]]/.test(text)) {
    throw new Error(`${label}: start with a single / or ./, without .. segments or wildcard characters. Paths are literal, not shell expressions.`);
  }
  return text;
}
