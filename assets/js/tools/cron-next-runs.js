const { tk } = window;

const cronField = document.querySelector('#cnr-cron');
const zoneField = document.querySelector('#cnr-zone');
const countField = document.querySelector('#cnr-count');
const list = document.querySelector('#cnr-list');
const status = document.querySelector('#cnr-status');

const RANGES = [
  [0, 59], // minute
  [0, 23], // hour
  [1, 31], // day of month
  [1, 12], // month
  [0, 7], // weekday (0 and 7 = Sunday)
];

function parseField(field, [min, max]) {
  const set = new Set();
  for (const part of field.split(',')) {
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart ? Number(stepPart) : 1;
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step in "${part}"`);
    let start = min;
    let end = max;
    if (rangePart !== '*') {
      const bounds = rangePart.split('-');
      start = Number(bounds[0]);
      end = bounds[1] === undefined ? (stepPart ? max : start) : Number(bounds[1]);
      if (!Number.isInteger(start) || !Number.isInteger(end)) throw new Error(`Invalid value in "${part}"`);
    }
    if (start < min || end > max || start > end) throw new Error(`"${part}" is out of range ${min}-${max}`);
    for (let v = start; v <= end; v += step) set.add(v);
  }
  return set;
}

function parseCron(expr) {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) throw new Error('A cron expression needs exactly 5 fields');
  const sets = fields.map((f, i) => parseField(f, RANGES[i]));
  if (sets[4].has(7)) sets[4].add(0);
  return sets;
}

function nextRuns(sets, count, utc) {
  const [minutes, hours, days, months, weekdays] = sets;
  const results = [];
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);
  const cursor = start;
  const limit = 366 * 24 * 60 * 4; // search up to ~4 years of minutes
  let guard = 0;
  while (results.length < count && guard < limit) {
    guard += 1;
    const minute = utc ? cursor.getUTCMinutes() : cursor.getMinutes();
    const hour = utc ? cursor.getUTCHours() : cursor.getHours();
    const day = utc ? cursor.getUTCDate() : cursor.getDate();
    const month = (utc ? cursor.getUTCMonth() : cursor.getMonth()) + 1;
    const weekday = utc ? cursor.getUTCDay() : cursor.getDay();
    const domMatch = days.has(day);
    const dowMatch = weekdays.has(weekday);
    const dayOk = days.size === 31 && weekdays.size === 7 ? true : domMatch || dowMatch;
    if (minutes.has(minute) && hours.has(hour) && months.has(month) && dayOk) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

function render() {
  list.replaceChildren();
  let sets;
  try {
    sets = parseCron(cronField.value);
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
    return;
  }
  const utc = zoneField.value === 'UTC';
  const runs = nextRuns(sets, Number(countField.value), utc);
  if (!runs.length) {
    tk.setStatus(status, 'No run found in the next few years', 'err');
    return;
  }
  const fmt = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: utc ? 'UTC' : undefined,
  });
  const rel = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const now = Date.now();
  runs.forEach((date) => {
    const row = document.createElement('div');
    row.className = 'tool-result-row';
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = fmt.format(date);
    const diffMin = Math.round((date.getTime() - now) / 60000);
    const label = Math.abs(diffMin) < 60 ? rel.format(diffMin, 'minute') : rel.format(Math.round(diffMin / 60), 'hour');
    dd.textContent = label;
    row.append(dt, dd);
    list.appendChild(row);
  });
  tk.setStatus(status, `${runs.length} upcoming run${runs.length === 1 ? '' : 's'}${utc ? ' (UTC)' : ''}`, 'ok');
}

tk.live([cronField, zoneField, countField], render);
