// Build a cron expression and describe it in plain English.
const { tk } = window;

const fields = {
  min: document.querySelector('#cron-min'),
  hour: document.querySelector('#cron-hour'),
  dom: document.querySelector('#cron-dom'),
  month: document.querySelector('#cron-month'),
  dow: document.querySelector('#cron-dow'),
};
const expr = document.querySelector('#cron-expr');
const desc = document.querySelector('#cron-desc');
const preset = document.querySelector('#cron-preset');

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function describe(value, unit, names) {
  const name = (n) => (names ? names[Number(n)] || n : n);
  if (value === '*') return `every ${unit}`;
  const every = value.match(/^\*\/(\d+)$/);
  if (every) return `every ${every[1]} ${unit}s`;
  if (value.includes(',')) return `${unit}s ${value.split(',').map(name).join(', ')}`;
  const range = value.match(/^(\d+)-(\d+)$/);
  if (range) return `${unit}s ${name(range[1])} through ${name(range[2])}`;
  return `${unit} ${name(value)}`;
}

function render() {
  const values = Object.values(fields).map((el) => el.value.trim() || '*');
  expr.value = values.join(' ');
  const [min, hour, dom, month, dow] = values;
  const parts = [
    `At ${describe(min, 'minute')}`,
    describe(hour, 'hour'),
    describe(dom, 'day-of-month'),
    describe(month, 'month', ['', ...MONTH]),
    describe(dow, 'day-of-week', DOW),
  ];
  desc.textContent = `${parts[0]}, ${parts.slice(1).join(', ')}.`;
}

preset.addEventListener('change', () => {
  if (!preset.value) return;
  const [min, hour, dom, month, dow] = preset.value.split(' ');
  Object.assign(fields.min, { value: min });
  Object.assign(fields.hour, { value: hour });
  Object.assign(fields.dom, { value: dom });
  Object.assign(fields.month, { value: month });
  Object.assign(fields.dow, { value: dow });
  render();
});

tk.live([...Object.values(fields), preset], render);
