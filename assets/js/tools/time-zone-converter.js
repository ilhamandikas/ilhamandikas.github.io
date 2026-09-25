// Turn a wall-clock time from one zone into the same instant in many zones.
const { tk } = window;

const input = document.querySelector('#tz-input');
const sourceSelect = document.querySelector('#tz-zone');
const result = document.querySelector('#tz-result');
const status = document.querySelector('#tz-status');

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// A short, useful list rather than every IANA zone. The source select is built
// from this same list, so the two never drift apart.
const ZONES = [
  ['UTC', 'UTC'],
  ['Asia/Jakarta', 'Jakarta · WIB'],
  ['Asia/Makassar', 'Makassar · WITA'],
  ['Asia/Jayapura', 'Jayapura · WIT'],
  ['Asia/Singapore', 'Singapore'],
  ['Asia/Kuala_Lumpur', 'Kuala Lumpur'],
  ['Asia/Tokyo', 'Tokyo'],
  ['Asia/Shanghai', 'Shanghai'],
  ['Asia/Kolkata', 'India'],
  ['Asia/Dubai', 'Dubai'],
  ['Europe/London', 'London'],
  ['Europe/Paris', 'Paris'],
  ['Europe/Berlin', 'Berlin'],
  ['Europe/Moscow', 'Moscow'],
  ['America/New_York', 'New York'],
  ['America/Chicago', 'Chicago'],
  ['America/Denver', 'Denver'],
  ['America/Los_Angeles', 'Los Angeles'],
  ['America/Sao_Paulo', 'São Paulo'],
  ['Australia/Sydney', 'Sydney'],
  ['Pacific/Auckland', 'Auckland'],
];

for (const [value, label] of [['local', 'Local (this browser)'], ...ZONES]) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  sourceSelect.append(option);
}
sourceSelect.value = 'UTC';

const msOf = (value) => (value ? Number((value + '00').slice(0, 3)) : 0);
const monthIndex = (name) => MONTHS[name.slice(0, 3).toLowerCase()] || 0;

function normalize(raw) {
  return raw.trim().replace(/@/g, ' ').replace(/,/g, ' ').replace(/\s+/g, ' ');
}

// Read the many shapes a log timestamp arrives in. Anything with an explicit
// offset or a Unix number is an absolute instant; everything else is a wall
// clock that still needs a source zone.
function parseParts(raw) {
  const s = normalize(raw);
  if (/^-?\d+$/.test(s)) {
    const n = Number(s);
    return { instant: Math.abs(n) < 1e11 ? n * 1000 : n };
  }
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(s)) {
    const parsed = Date.parse(s.replace(' ', 'T'));
    if (!Number.isNaN(parsed)) return { instant: parsed };
  }

  const time = '(\\d{1,2}):(\\d{2})(?::(\\d{2}))?(?:\\.(\\d{1,6}))?';
  let m = s.match(new RegExp(`^(\\d{4})[-/](\\d{1,2})[-/](\\d{1,2})(?:[ T]${time})?$`));
  if (m) return { y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0), ms: msOf(m[7]) };

  m = s.match(new RegExp(`^([A-Za-z]{3,}) (\\d{1,2}) (\\d{4})(?:[ T]${time})?$`));
  if (m) return { y: +m[3], mo: monthIndex(m[1]), d: +m[2], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0), ms: msOf(m[7]) };

  m = s.match(new RegExp(`^(\\d{1,2}) ([A-Za-z]{3,}) (\\d{4})(?:[ T]${time})?$`));
  if (m) return { y: +m[3], mo: monthIndex(m[2]), d: +m[1], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0), ms: msOf(m[7]) };

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return { instant: parsed };
  throw new Error('Could not read that date — try Sep 26, 2026 @ 00:24:20.437');
}

// The offset of a zone at a given instant, in milliseconds. Read back the
// zone's wall clock as if it were UTC and compare it with the instant.
function zoneOffset(zone, date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour12: false,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const map = {};
  for (const part of parts) map[part.type] = part.value;
  const asUtc = Date.UTC(+map.year, +map.month - 1, +map.day, +(map.hour === '24' ? '00' : map.hour), +map.minute, +map.second);
  return asUtc - date.getTime();
}

// A wall clock in a zone has no single offset across a DST change, so start with
// a guess and correct it until the offset is stable.
function zonedToUtc(zone, p) {
  const guess = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s, p.ms);
  let utc = guess;
  for (let i = 0; i < 3; i += 1) {
    const next = guess - zoneOffset(zone, new Date(utc));
    if (next === utc) break;
    utc = next;
  }
  return utc;
}

function partsInZone(ms, zone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    hour12: false,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
  }).formatToParts(new Date(ms));
  const map = {};
  for (const part of parts) map[part.type] = part.value;
  if (map.hour === '24') map.hour = '00';
  return map;
}

function offsetLabel(zone, ms) {
  if (zone === 'UTC') return 'UTC+00:00';
  const minutes = Math.round(zoneOffset(zone, new Date(ms)) / 60000);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

function stamp(map) {
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second} · ${map.weekday} · `;
}

function row(key, value) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = key;
  dd.textContent = value;
  wrap.append(dt, dd);
  return wrap;
}

let table = '';

function render() {
  const raw = input.value.trim();
  if (raw === '') {
    result.replaceChildren();
    table = '';
    tk.setStatus(status, '');
    return;
  }
  try {
    const p = parseParts(raw);
    const zone = sourceSelect.value;
    let ms;
    if (p.instant != null) {
      ms = p.instant;
    } else if (zone === 'local') {
      ms = new Date(p.y, p.mo - 1, p.d, p.h, p.mi, p.s, p.ms).getTime();
    } else if (zone === 'UTC') {
      ms = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s, p.ms);
    } else {
      ms = zonedToUtc(zone, p);
    }
    if (Number.isNaN(ms)) throw new Error('Could not read that date');

    const sourceName = zone === 'local' ? 'Local (this browser)' : zone;
    const rows = [
      row('Read as', sourceName),
      row('Instant (UTC)', new Date(ms).toISOString()),
      row('Unix (s)', String(Math.floor(ms / 1000))),
    ];
    const lines = [`Read as: ${sourceName}`, `Instant (UTC): ${new Date(ms).toISOString()}`, `Unix (s): ${Math.floor(ms / 1000)}`];
    for (const [z, label] of ZONES) {
      const map = partsInZone(ms, z);
      const value = `${stamp(map)}${offsetLabel(z, ms)}`;
      rows.push(row(label, value));
      lines.push(`${label.padEnd(18)} ${value}`);
    }
    const localMap = partsInZone(ms, Intl.DateTimeFormat().resolvedOptions().timeZone);
    rows.push(row('Local (this browser)', `${stamp(localMap)}${offsetLabel(Intl.DateTimeFormat().resolvedOptions().timeZone, ms)}`));
    table = lines.join('\n');
    result.replaceChildren(...rows);
    tk.setStatus(status, `Converted from ${sourceName}`, 'ok');
  } catch (error) {
    result.replaceChildren();
    table = '';
    tk.setStatus(status, error.message, 'err');
  }
}

document.querySelector('#tz-now').addEventListener('click', () => {
  const d = new Date();
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  input.value = `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} @ ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`;
  sourceSelect.value = 'UTC';
  render();
});

document.querySelector('#tz-copy').addEventListener('click', () => {
  if (table) tk.copy(table, status, 'Table copied');
});

tk.live([input, sourceSelect], render);
