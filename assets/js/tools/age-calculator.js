const { tk } = window;

const birth = document.querySelector('#age-birth');
const ref = document.querySelector('#age-ref');
const output = document.querySelector('#age-output');
const status = document.querySelector('#age-status');

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });

const DAY = 86400000;

if (!ref.value) ref.value = new Date().toISOString().slice(0, 10);

// Count whole years, then months, then days, borrowing from the month before
// the end date so the result matches how a birthday is read.
function split(from, to) {
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let months = to.getUTCMonth() - from.getUTCMonth();
  let days = to.getUTCDate() - from.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function nextBirthday(from, to) {
  const month = from.getUTCMonth();
  const day = from.getUTCDate();
  let year = to.getUTCFullYear();
  let candidate = new Date(Date.UTC(year, month, day));
  if (candidate < new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()))) {
    year += 1;
    candidate = new Date(Date.UTC(year, month, day));
  }
  const until = Math.round((candidate - to) / DAY);
  return { date: candidate, until };
}

function plural(value, word) {
  return `${value} ${word}${value === 1 ? '' : 's'}`;
}

function render() {
  if (!birth.value || !ref.value) {
    output.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  const from = new Date(`${birth.value}T00:00:00Z`);
  const to = new Date(`${ref.value}T00:00:00Z`);
  if (from > to) {
    output.textContent = '';
    tk.setStatus(status, 'The birth date is after the date you are measuring to.', 'err');
    return;
  }

  const { years, months, days } = split(from, to);
  const totalDays = Math.round((to - from) / DAY);
  const next = nextBirthday(from, to);
  const when = next.until === 0 ? 'today' : `in ${plural(next.until, 'day')}`;

  output.textContent = [
    `Age: ${plural(years, 'year')}, ${plural(months, 'month')}, ${plural(days, 'day')}`,
    '',
    `Total days: ${totalDays}`,
    `Total weeks: ${Math.floor(totalDays / 7)}`,
    `Total months: ${years * 12 + months}`,
    `Total hours: ${totalDays * 24}`,
    '',
    `Born on a ${dayFormat.format(from)}`,
    `Next birthday: ${dateFormat.format(next.date)} (${when})`,
  ].join('\n');
  tk.setStatus(status, '');
}

tk.live([birth, ref], render);
