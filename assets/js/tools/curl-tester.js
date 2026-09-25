const { tk } = window;
const input = document.querySelector('#curl-in');
const output = document.querySelector('#curl-out');
const summary = document.querySelector('#curl-summary');
const status = document.querySelector('#curl-status');

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
const quote = (v) => (/^[A-Za-z0-9._:/@%+=?&-]+$/.test(v) ? v : `'${String(v).replace(/'/g, "'\\''")}'`);

function cleanJsonBody(value, req) {
  const raw = String(value).trim();
  const candidates = [raw, raw.replace(/\s*\r?\n\s*/g, ''), raw.replace(/\s*\r?\n\s*/g, ' ')];
  for (const candidate of candidates) {
    try {
      return JSON.stringify(JSON.parse(candidate));
    } catch {}
  }
  if (/\r|\n/.test(raw)) req.notes.push('body still contains line breaks; JSON could not be compacted safely');
  return raw;
}

function addBody(req, value, json = false) {
  req.body = json ? cleanJsonBody(value, req) : cleanJsonBody(value, req);
  if (req.method === 'GET') req.method = 'POST';
}

function parse(text) {
  const words = tokenize(text);
  if (!words.length) throw new Error('Paste a curl command first');
  if (!/^(curl|curl\.exe|\/.*\/curl)$/i.test(words[0])) throw new Error('Command must start with curl');
  const req = { method: 'GET', url: '', headers: [], body: '', notes: [] };
  for (let i = 1; i < words.length; i += 1) {
    const w = words[i];
    const next = () => { const v = words[++i]; if (v === undefined) throw new Error(`${w} needs a value`); return v; };
    if (w === '-X' || w === '--request') req.method = next().toUpperCase();
    else if (w.startsWith('-X') && w.length > 2) req.method = w.slice(2).toUpperCase();
    else if (w === '-H' || w === '--header') req.headers.push(next());
    else if (w.startsWith('-H') && w.length > 2) req.headers.push(w.slice(2));
    else if (['-d', '--data', '--data-raw', '--data-binary'].includes(w)) addBody(req, next());
    else if (w === '--json') { addBody(req, next(), true); req.headers.push('Content-Type: application/json', 'Accept: application/json'); }
    else if (w.startsWith('-d') && w.length > 2) addBody(req, w.slice(2));
    else if (w === '--url') req.url = next();
    else if (w === '-L' || w === '--location') req.notes.push(`${w} ignored; browsers follow redirects automatically`);
    else if (w.startsWith('-')) req.notes.push(`${w} not represented in the rebuilt command`);
    else if (!req.url) req.url = w;
  }
  if (!req.url) throw new Error('No URL found');
  if (!/^https?:\/\//i.test(req.url)) req.url = `https://${req.url}`;
  return req;
}
function build(req) {
  const lines = [`curl --location --request ${req.method} ${quote(req.url)}`];
  for (const h of [...new Set(req.headers)]) lines.push(`  --header ${quote(h)}`);
  if (req.body) lines.push(`  --data-raw ${quote(req.body)}`);
  return lines.join(' \\\n');
}
function row(k, v) { const div = document.createElement('div'); div.className = 'tool-result-row'; const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v || '—'; div.append(dt, dd); return div; }
function run() {
  try {
    const req = parse(input.value);
    output.value = build(req);
    summary.replaceChildren(row('Method', req.method), row('URL', req.url), row('Headers', req.headers.join('\n')), row('Body', req.body), row('Notes', req.notes.join('\n')));
    tk.setStatus(status, req.notes.length ? 'Parsed with notes' : 'Parsed', req.notes.length ? '' : 'ok');
  } catch (e) {
    output.value = '';
    summary.replaceChildren();
    tk.setStatus(status, e.message, 'err');
  }
}
document.querySelector('#curl-parse').addEventListener('click', run);
document.querySelector('#curl-copy').addEventListener('click', () => { navigator.clipboard?.writeText(output.value); tk.flash(status, 'Copied', 'ok'); });
tk.live([input], run);
