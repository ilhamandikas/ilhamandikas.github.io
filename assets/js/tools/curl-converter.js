const { tk } = window;
const input = document.querySelector('#cc-in');
const target = document.querySelector('#cc-target');
const output = document.querySelector('#cc-out');
const status = document.querySelector('#cc-status');

function tokenize(text) {
  const source = String(text).replace(/\\\r?\n/g, ' ');
  const words = [];
  let word = null;
  let quote = null;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quote === "'") { if (ch === "'") quote = null; else word += ch; continue; }
    if (quote === '"') { if (ch === '"') quote = null; else if (ch === '\\' && /["\\$`]/.test(source[i + 1] || '')) word += source[++i]; else word += ch; continue; }
    if (ch === "'" || ch === '"') { quote = ch; word ??= ''; continue; }
    if (ch === '\\' && i + 1 < source.length) { word = (word ?? '') + source[++i]; continue; }
    if (/\s/.test(ch)) { if (word !== null) { words.push(word); word = null; } continue; }
    word = (word ?? '') + ch;
  }
  if (word !== null) words.push(word);
  return words;
}
function parse(text) {
  const words = tokenize(text);
  if (!words.length) throw new Error('Paste a curl command first');
  if (!/^(curl|curl\.exe|\/.*\/curl)$/i.test(words[0])) throw new Error('Command must start with curl');
  const req = { method: 'GET', url: '', headers: {}, body: '' };
  for (let i = 1; i < words.length; i += 1) {
    const w = words[i];
    const next = () => { const v = words[++i]; if (v === undefined) throw new Error(`${w} needs a value`); return v; };
    if (w === '-X' || w === '--request') req.method = next().toUpperCase();
    else if (w.startsWith('-X') && w.length > 2) req.method = w.slice(2).toUpperCase();
    else if (w === '-H' || w === '--header') {
      const h = next(); const at = h.indexOf(':'); if (at > 0) req.headers[h.slice(0, at).trim()] = h.slice(at + 1).trim();
    } else if (['-d', '--data', '--data-raw', '--data-binary', '--json'].includes(w)) {
      req.body = next(); if (req.method === 'GET') req.method = 'POST'; if (w === '--json') req.headers['Content-Type'] = 'application/json';
    } else if (w === '--url') req.url = next();
    else if (!w.startsWith('-') && !req.url) req.url = w;
  }
  if (!req.url) throw new Error('No URL found');
  if (!/^https?:\/\//i.test(req.url)) req.url = `https://${req.url}`;
  return req;
}
const pretty = (v) => JSON.stringify(v, null, 2);
function jsBody(body) {
  if (!body) return '';
  try { return `JSON.stringify(${pretty(JSON.parse(body))})`; } catch { return JSON.stringify(body); }
}
function pyBody(body) {
  if (!body) return '';
  try { return `json=${pretty(JSON.parse(body)).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}`; } catch { return `data=${JSON.stringify(body)}`; }
}
function convert(req) {
  if (target.value === 'axios') {
    return `import axios from 'axios';\n\nconst response = await axios(${pretty({ method: req.method, url: req.url, headers: req.headers, data: req.body ? JSON.parse(JSON.stringify(req.body)) : undefined }).replace(/,\n  "data": undefined/g, '')});\n\nconsole.log(response.data);`;
  }
  if (target.value === 'python') {
    const parts = [`requests.request(${JSON.stringify(req.method)}, ${JSON.stringify(req.url)}`];
    if (Object.keys(req.headers).length) parts.push(`headers=${pretty(req.headers)}`);
    if (req.body) parts.push(pyBody(req.body));
    return `import requests\n\nresponse = ${parts.join(', ')})\nprint(response.text)`;
  }
  const opts = { method: req.method, headers: req.headers };
  const lines = [`const response = await fetch(${JSON.stringify(req.url)}, {`, `  method: ${JSON.stringify(opts.method)},`];
  if (Object.keys(req.headers).length) lines.push(`  headers: ${pretty(req.headers).replace(/\n/g, '\n  ')},`);
  if (req.body) lines.push(`  body: ${jsBody(req.body)},`);
  lines.push('});', '', 'const data = await response.text();', 'console.log(data);');
  return lines.join('\n');
}
function run() {
  try { output.value = convert(parse(input.value)); tk.setStatus(status, 'Converted', 'ok'); }
  catch (e) { output.value = ''; tk.setStatus(status, e.message, 'err'); }
}
document.querySelector('#cc-convert').addEventListener('click', run);
tk.live([input, target], run);
