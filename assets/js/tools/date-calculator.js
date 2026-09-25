// Date calculator: duration between two dates, or a date shifted by an amount.
const { tk } = window;

const mode = document.querySelector('#dc-mode');
const diffBox = document.querySelector('#dc-diff');
const addBox = document.querySelector('#dc-add');
const startInput = document.querySelector('#dc-start');
const endInput = document.querySelector('#dc-end');
const includeEnd = document.querySelector('#dc-include-end');
const business = document.querySelector('#dc-business');
const baseInput = document.querySelector('#dc-base');
const opInput = document.querySelector('#dc-op');
const amountInput = document.querySelector('#dc-amount');
const unitInput = document.querySelector('#dc-unit');
const resultEl = document.querySelector('#dc-result');
const status = document.querySelector('#dc-status');

const DAY = 86400000;

function parseDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

const toIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const longDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const weekday = (date) => date.toLocaleDateString('en-GB', { weekday: 'long' });

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

function addBusinessDays(date, days) {
  const d = new Date(date);
  const step = days < 0 ? -1 : 1;
  let left = Math.abs(days);
  while (left > 0) {
    d.setDate(d.getDate() + step);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) left -= 1;
  }
  return d;
}

function countBusinessDays(from, to) {
  let count = 0;
  const cur = new Date(from);
  while (cur < to) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function calendarDiff(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / DAY + 1) / 7);
}

function dayOfYear(date) {
  return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / DAY);
}

function row(key, value, accent) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = key;
  dd.textContent = value;
  if (accent) dd.classList.add('tool-type');
  wrap.append(dt, dd);
  return wrap;
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function renderDiff() {
  let from = parseDate(startInput.value);
  let to = parseDate(endInput.value);
  if (!from || !to) {
    resultEl.replaceChildren();
    tk.setStatus(status, 'Pick both dates');
    return;
  }
  let reversed = false;
  if (from > to) { [from, to] = [to, from]; reversed = true; }
  const boundary = includeEnd.checked ? addDays(to, 1) : to;
  const totalDays = Math.round((boundary - from) / DAY);
  const { years, months, days } = calendarDiff(from, to);
  const rows = [];

  const parts = [];
  if (years) parts.push(plural(years, 'year'));
  if (months) parts.push(plural(months, 'month'));
  if (days || !parts.length) parts.push(plural(days, 'day'));
  rows.push(row('Calendar difference', parts.join(', '), true));
  rows.push(row('Total days', String(totalDays)));
  rows.push(row('Total weeks', `${Math.floor(totalDays / 7)} weeks ${totalDays % 7} days`));
  rows.push(row('Total months (approx.)', (totalDays / 30.436875).toFixed(2)));
  rows.push(row('Total years (approx.)', (totalDays / 365.2425).toFixed(3)));
  if (business.checked) rows.push(row('Business days (Mon–Fri)', String(countBusinessDays(from, boundary))));
  rows.push(row('From', `${toIso(from)} · ${weekday(from)}`));
  rows.push(row('To', `${toIso(to)} · ${weekday(to)}`));
  if (reversed) rows.push(row('Note', 'The dates were swapped because the start was after the end'));

  resultEl.replaceChildren(...rows);
  tk.setStatus(status, 'Calculated', 'ok');
}

function renderAdd() {
  const base = parseDate(baseInput.value);
  const amount = Number(amountInput.value);
  if (!base || !Number.isFinite(amount)) {
    resultEl.replaceChildren();
    tk.setStatus(status, 'Pick a date and an amount');
    return;
  }
  const sign = opInput.value === 'sub' ? -1 : 1;
  const n = sign * amount;
  let result;
  if (unitInput.value === 'days') result = addDays(base, n);
  else if (unitInput.value === 'weeks') result = addDays(base, n * 7);
  else if (unitInput.value === 'months') result = addMonths(base, n);
  else if (unitInput.value === 'years') result = addMonths(base, n * 12);
  else result = addBusinessDays(base, n);

  const totalDays = Math.round((result - base) / DAY);
  const rows = [
    row('Result', toIso(result), true),
    row('Long form', longDate(result)),
    row('Weekday', weekday(result)),
    row('ISO week', `Week ${isoWeek(result)}, ${result.getFullYear()}`),
    row('Day of year', `Day ${dayOfYear(result)}`),
    row('Days moved', String(totalDays)),
  ];
  if (unitInput.value === 'months' || unitInput.value === 'years') {
    rows.push(row('Note', 'Month-end dates clamp to the last valid day of the target month'));
  }
  resultEl.replaceChildren(...rows);
  tk.setStatus(status, 'Calculated', 'ok');
}

function render() {
  const isDiff = mode.value === 'diff';
  diffBox.hidden = !isDiff;
  addBox.hidden = isDiff;
  if (isDiff) renderDiff();
  else renderAdd();
}

document.querySelector('#dc-today').addEventListener('click', () => {
  const today = toIso(new Date());
  startInput.value = today;
  baseInput.value = today;
  render();
});

const today = toIso(new Date());
startInput.value = toIso(addDays(new Date(), -30));
endInput.value = today;
baseInput.value = today;

tk.live([mode, startInput, endInput, includeEnd, business, baseInput, opInput, amountInput, unitInput], render);
