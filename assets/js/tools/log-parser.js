// Log parser: read a log in one of the common shapes and show it as rows.
const { tk } = window;

const input = document.querySelector('#lp-input');
const formatSel = document.querySelector('#lp-format');
const fileInput = document.querySelector('#lp-file');
const summaryEl = document.querySelector('#lp-summary');
const chipsEl = document.querySelector('#lp-chips');
const levelSel = document.querySelector('#lp-level');
const searchInput = document.querySelector('#lp-search');
const tableEl = document.querySelector('#lp-table');
const metaEl = document.querySelector('#lp-meta');
const status = document.querySelector('#lp-status');

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
const LEVEL_ORDER = ['fatal', 'error', 'warn', 'notice', 'info', 'debug', 'trace', ''];
const MAX_ROWS = 2000;
const MAX_FIELDS = 8;

let entries = [];
let columns = [];
let detected = 'plain';
let parseReport = { lines: 0, fallbacks: 0 };

function normalizeLevel(value) {
  if (value == null || value === '') return '';
  const s = String(value).trim().toLowerCase();
  if (/^(warn|warning|wrn)$/.test(s)) return 'warn';
  if (/^(err|error|severe|sevr)$/.test(s)) return 'error';
  if (/^(fatal|crit|critical|alert|emerg|emergency|panic)$/.test(s)) return 'fatal';
  if (/^(trace|verbose|fine|finer|finest)$/.test(s)) return 'trace';
  if (/^(debug|dbg)$/.test(s)) return 'debug';
  if (/^(info|information|log|notice)$/.test(s)) return s === 'notice' ? 'notice' : 'info';
  return '';
}

function levelFromText(text) {
  const m = String(text).match(/\b(TRACE|DEBUG|INFO|NOTICE|WARN(?:ING)?|ERR(?:OR)?|CRIT(?:ICAL)?|FATAL|ALERT|EMERG(?:ENCY)?|SEVERE|PANIC)\b/i);
  return m ? normalizeLevel(m[1]) : '';
}

// Priority 0-7 from RFC 5424 maps onto the same levels.
const PRIORITY_LEVEL = ['fatal', 'fatal', 'fatal', 'error', 'warn', 'notice', 'info', 'debug'];

function normalizeTime(raw) {
  if (raw == null || raw === '') return { text: '', ms: NaN };
  const s = String(raw).trim().replace(/^\[|\]$/g, '');
  let m = s.match(/^(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}:\d{2}:\d{2}) ([+-]\d{4})$/);
  if (m && MONTHS[m[2].toLowerCase()]) {
    const iso = `${m[3]}-${MONTHS[m[2].toLowerCase()]}-${m[1]}T${m[4]}${m[5].slice(0, 3)}:${m[5].slice(3)}`;
    return { text: iso, ms: Date.parse(iso) };
  }
  m = s.match(/^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (m) {
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}`;
    return { text: iso, ms: Date.parse(iso) };
  }
  m = s.match(/^([A-Z][a-z]{2}) +(\d{1,2}) (\d{2}:\d{2}:\d{2})$/);
  if (m && MONTHS[m[1].toLowerCase()]) {
    const iso = `${new Date().getFullYear()}-${MONTHS[m[1].toLowerCase()]}-${m[2].padStart(2, '0')}T${m[3]}`;
    return { text: iso, ms: Date.parse(iso) };
  }
  if (/^\d{10}$/.test(s)) { const ms = Number(s) * 1000; return { text: new Date(ms).toISOString(), ms }; }
  if (/^\d{13}$/.test(s)) { const ms = Number(s); return { text: new Date(ms).toISOString(), ms }; }
  const iso = s.replace(' ', 'T');
  const ms = Date.parse(s) || Date.parse(iso);
  if (!Number.isNaN(ms)) return { text: new Date(ms).toISOString(), ms };
  return { text: s, ms: NaN };
}

const show = (value) => (value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value));

function entryFromObject(obj) {
  const fields = {};
  let time = '';
  let level = '';
  let message = '';
  for (const [key, value] of Object.entries(obj)) {
    const k = key.toLowerCase();
    if (!time && /^(time|timestamp|ts|@timestamp|date|datetime)$/.test(k)) { time = value; continue; }
    if (!level && /^(level|severity|lvl|log_level|loglevel|priority)$/.test(k)) { level = value; continue; }
    if (!message && /^(msg|message|log|event|text)$/.test(k)) { message = value; continue; }
    fields[key] = value;
  }
  const t = normalizeTime(time);
  return {
    time: t.text,
    ms: t.ms,
    level: normalizeLevel(level) || levelFromText(show(message)),
    message: show(message),
    fields,
  };
}

function parseJsonLine(line) {
  const value = JSON.parse(line);
  if (Array.isArray(value)) return value.map((item) => (item && typeof item === 'object' ? entryFromObject(item) : { time: '', ms: NaN, level: '', message: show(item), fields: {} }));
  if (value && typeof value === 'object') return [entryFromObject(value)];
  return [{ time: '', ms: NaN, level: '', message: show(value), fields: {} }];
}

function parseCombined(line) {
  const m = line.match(/^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]*)" (\d{3}) (\S+)(?: "([^"]*)" "([^"]*)")?\s*$/);
  if (!m) return null;
  const t = normalizeTime(m[4]);
  const [method, path, protocol] = m[5].split(' ');
  const statusCode = Number(m[6]);
  return {
    time: t.text,
    ms: t.ms,
    level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
    message: `${m[5]} → ${m[6]}`,
    fields: {
      ip: m[1], user: m[3] === '-' ? '' : m[3], method: method || '', path: path || '',
      protocol: protocol || '', status: m[6], bytes: m[7] === '-' ? '' : m[7],
      referrer: m[8] || '', agent: m[9] || '',
    },
  };
}

function parseSyslog(line) {
  let m = line.match(/^<(\d+)>(\d+) (\S+) (\S+) (\S+) (\S+) (\S+) (.*)$/);
  if (m) {
    const t = normalizeTime(m[3]);
    return {
      time: t.text, ms: t.ms, level: PRIORITY_LEVEL[Number(m[1]) % 8] || '',
      message: m[8],
      fields: { host: m[4], app: m[5], pid: m[6] === '-' ? '' : m[6], msgid: m[7] === '-' ? '' : m[7], priority: m[1] },
    };
  }
  m = line.match(/^([A-Z][a-z]{2} +[ \d]\d \d{2}:\d{2}:\d{2}) (\S+) ([^\s:\[]+)(?:\[(\d+)\])?: (.*)$/);
  if (m) {
    const t = normalizeTime(m[1]);
    const level = levelFromText(m[5]);
    return {
      time: t.text, ms: t.ms, level, message: m[5],
      fields: { host: m[2], app: m[3], pid: m[4] || '' },
    };
  }
  return null;
}

function parseNginxError(line) {
  const m = line.match(/^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (\d+#\d+): (.*)$/);
  if (!m) return null;
  const t = normalizeTime(m[1]);
  return {
    time: t.text, ms: t.ms, level: normalizeLevel(m[2]) || 'error', message: m[4],
    fields: { worker: m[3] },
  };
}

function parseLogfmt(line) {
  const fields = {};
  const re = /([A-Za-z_][\w.-]*)=("([^"]*)"|'([^']*)'|\S+)/g;
  let m;
  let count = 0;
  while ((m = re.exec(line)) !== null) {
    fields[m[1]] = m[3] ?? m[4] ?? m[2];
    count += 1;
  }
  if (count < 2) return null;
  let time = '';
  let level = '';
  let message = '';
  for (const [key, value] of Object.entries(fields)) {
    const k = key.toLowerCase();
    if (!time && /^(time|timestamp|ts|date)$/.test(k)) { time = value; delete fields[key]; continue; }
    if (!level && /^(level|severity|lvl)$/.test(k)) { level = value; delete fields[key]; continue; }
    if (!message && /^(msg|message|event|text)$/.test(k)) { message = value; delete fields[key]; }
  }
  const t = normalizeTime(time);
  return { time: t.text, ms: t.ms, level: normalizeLevel(level) || levelFromText(message), message, fields };
}

function parsePlain(line) {
  let rest = line.trim();
  let time = '';
  let m = rest.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (m && /[0-9]/.test(m[1]) && (/^\d{4}[-/]\d{2}/.test(m[1]) || /^[A-Z][a-z]{2} /.test(m[1]) || /^\d{2}\/[A-Za-z]{3}\//.test(m[1]))) {
    time = m[1];
    rest = m[2];
  } else {
    m = rest.match(/^(\d{4}[-/]\d{2}[-/]\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(.*)$/);
    if (m) { time = m[1]; rest = m[2]; }
  }
  let level = '';
  m = rest.match(/^\[?([A-Za-z]+)\]?[:\s]\s*(.*)$/);
  if (m && normalizeLevel(m[1])) { level = normalizeLevel(m[1]); rest = m[2]; }
  if (!level) level = levelFromText(rest);
  const t = normalizeTime(time);
  return { time: t.text, ms: t.ms, level, message: rest, fields: {} };
}

function detectFormat(lines) {
  const sample = lines.filter((line) => line.trim()).slice(0, 25);
  const score = { json: 0, combined: 0, syslog: 0, logfmt: 0 };
  for (const raw of sample) {
    const line = raw.trim();
    if (line.startsWith('{')) { try { JSON.parse(line); score.json += 1; continue; } catch { /* not JSON */ } }
    if (/^<\d+>\d+ /.test(line) || /^[A-Z][a-z]{2} +[ \d]\d \d{2}:\d{2}:\d{2} /.test(line)) { score.syslog += 1; continue; }
    if (/^\S+ \S+ \S+ \[[^\]]+\] "[^"]*" \d{3} /.test(line)) { score.combined += 1; continue; }
    if (/([A-Za-z_][\w.-]*)=("[^"]*"|'[^']*'|\S+)/g.test(line) && line.split(/\s+/).filter((t) => /^[A-Za-z_][\w.-]*=/.test(t)).length >= 2) score.logfmt += 1;
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : 'plain';
}

function parseLine(line, format) {
  if (format === 'json') { try { return parseJsonLine(line); } catch { return null; } }
  if (format === 'combined') { const e = parseCombined(line); return e ? [e] : null; }
  if (format === 'syslog') { const e = parseSyslog(line); return e ? [e] : null; }
  if (format === 'logfmt') { const e = parseLogfmt(line); return e ? [e] : null; }
  if (format === 'plain') return [parsePlain(line)];
  // auto: try the structured shapes, then fall back.
  for (const tryFormat of ['json', 'syslog', 'combined', 'logfmt']) {
    const hit = parseLine(line, tryFormat);
    if (hit) return hit;
  }
  return [parsePlain(line)];
}

function parseAll() {
  const text = input.value;
  const lines = text.split(/\r?\n/);
  const chosen = formatSel.value === 'auto' ? detectFormat(lines) : formatSel.value;
  detected = chosen;
  entries = [];
  columns = [];
  let fallbacks = 0;
  const seen = new Set();
  for (const raw of lines) {
    if (!raw.trim()) continue;
    const parsed = parseLine(raw, chosen) || (fallbacks += 1, [parsePlain(raw)]);
    for (const entry of parsed) {
      if (entry === undefined) continue;
      entry.raw = raw;
      entries.push(entry);
      for (const key of Object.keys(entry.fields)) {
        if (!seen.has(key)) { seen.add(key); columns.push(key); }
      }
    }
  }
  parseReport = { lines: lines.filter((line) => line.trim()).length, fallbacks };
  return chosen;
}

function countByLevel(list) {
  const counts = {};
  for (const entry of list) counts[entry.level || 'other'] = (counts[entry.level || 'other'] || 0) + 1;
  return counts;
}

function row(dt, dd, accent) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const k = document.createElement('dt');
  const v = document.createElement('dd');
  k.textContent = dt;
  v.textContent = dd;
  if (accent) v.classList.add('tool-type');
  wrap.append(k, v);
  return wrap;
}

function renderSummary() {
  summaryEl.replaceChildren();
  if (!entries.length) {
    chipsEl.replaceChildren();
    return;
  }
  const times = entries.map((e) => e.ms).filter((ms) => Number.isFinite(ms));
  const from = times.length ? new Date(Math.min(...times)).toISOString() : '—';
  const to = times.length ? new Date(Math.max(...times)).toISOString() : '—';
  summaryEl.append(
    row('Format', detected === 'auto' ? 'auto' : detected, true),
    row('Entries', String(entries.length)),
    row('First timestamp', from),
    row('Last timestamp', to),
    row('Unparsed lines', String(parseReport.fallbacks)),
  );
  chipsEl.replaceChildren();
  const counts = countByLevel(entries);
  for (const level of LEVEL_ORDER) {
    const key = level || 'other';
    if (!counts[key]) continue;
    const chip = document.createElement('span');
    chip.className = `lp-chip lp-${key}`;
    chip.textContent = `${key} ${counts[key]}`;
    chipsEl.appendChild(chip);
  }
}

function buildSearch() {
  const q = searchInput.value.trim();
  if (!q) return null;
  const m = q.match(/^\/(.*)\/([a-z]*)$/i);
  if (m) {
    try { const re = new RegExp(m[1], m[2]); return (entry) => re.test(entry.raw); } catch { return null; }
  }
  const lower = q.toLowerCase();
  return (entry) => entry.raw.toLowerCase().includes(lower);
}

function renderTable() {
  tableEl.replaceChildren();
  if (!entries.length) {
    metaEl.textContent = '';
    return;
  }
  const wanted = levelSel.value;
  const match = buildSearch();
  const rows = entries.filter((entry) => (!wanted || (entry.level || 'other') === wanted) && (!match || match(entry)));
  const shown = rows.slice(0, MAX_ROWS);
  const cols = columns.slice(0, MAX_FIELDS);

  const table = document.createElement('table');
  table.className = 'tool-table lp-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['#', 'Time', 'Level', 'Message', ...cols, columns.length > MAX_FIELDS ? '…' : null].filter(Boolean)) {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  const tbody = document.createElement('tbody');
  for (const entry of shown) {
    const tr = document.createElement('tr');
    const cells = [
      String(entry.__n || ''),
      entry.time || '—',
      entry.level || '—',
      entry.message,
      ...cols.map((key) => show(entry.fields[key])),
      columns.length > MAX_FIELDS ? '' : null,
    ].filter((cell) => cell !== null);
    for (let i = 0; i < cells.length; i += 1) {
      const td = document.createElement('td');
      td.textContent = cells[i];
      if (i === 2 && entry.level) td.className = `lp-level lp-${entry.level}`;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.append(thead, tbody);
  tableEl.appendChild(table);
  metaEl.textContent = `${shown.length} of ${entries.length} entries${columns.length > MAX_FIELDS ? ` · showing ${MAX_FIELDS} of ${columns.length} fields` : ''}`;
}

function render() {
  entries.forEach((entry, index) => { entry.__n = index + 1; });
  renderSummary();
  const levels = [...new Set(entries.map((entry) => entry.level || 'other'))];
  const previous = levelSel.value;
  levelSel.replaceChildren(new Option('All levels', ''));
  for (const level of LEVEL_ORDER) {
    const key = level || 'other';
    if (levels.includes(key)) levelSel.appendChild(new Option(key, key));
  }
  levelSel.value = levels.includes(previous) ? previous : '';
  renderTable();
}

function run() {
  if (input.value.trim() === '') {
    entries = [];
    columns = [];
    renderSummary();
    renderTable();
    tk.setStatus(status, '');
    return;
  }
  try {
    const chosen = parseAll();
    render();
    const note = parseReport.fallbacks ? ` · ${parseReport.fallbacks} line(s) parsed as plain text` : '';
    tk.setStatus(status, `Parsed as ${chosen}${note}`, parseReport.fallbacks ? '' : 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

const toJson = () => JSON.stringify(entries.map(({ __n, raw, ...entry }) => ({ ...entry })), null, 2);

function csvCell(value) {
  const s = show(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv() {
  const cols = columns;
  const head = ['#', 'time', 'level', 'message', ...cols];
  const lines = [head.join(',')];
  for (const entry of entries) {
    lines.push([entry.__n, entry.time, entry.level, entry.message, ...cols.map((key) => entry.fields[key])].map(csvCell).join(','));
  }
  return lines.join('\n');
}

document.querySelector('#lp-parse').addEventListener('click', run);
document.querySelector('#lp-clear').addEventListener('click', () => {
  input.value = '';
  run();
  tk.setStatus(status, '');
});
document.querySelector('#lp-copy-json').addEventListener('click', () => { if (entries.length) tk.copy(toJson(), status, 'JSON copied'); });
document.querySelector('#lp-copy-csv').addEventListener('click', () => { if (entries.length) tk.copy(toCsv(), status, 'CSV copied'); });
document.querySelector('#lp-download-json').addEventListener('click', () => { if (entries.length) tk.download('logs.json', toJson(), 'application/json'); });

fileInput.addEventListener('change', async () => {
  const chosen = fileInput.files[0];
  if (!chosen) return;
  input.value = await chosen.text();
  run();
});

levelSel.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);
tk.live([input, formatSel], run);
