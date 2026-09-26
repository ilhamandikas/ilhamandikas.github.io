// Unix timestamp <-> human readable date.
const { tk } = window;

const input = document.querySelector('#ts-input');
const unit = document.querySelector('#ts-unit');

function relative(ms) {
  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const units = [
    ['year', 31536000000], ['month', 2592000000], ['day', 86400000],
    ['hour', 3600000], ['minute', 60000], ['second', 1000],
  ];
  for (const [name, size] of units) {
    if (abs >= size) {
      const value = Math.round(diff / size);
      return `${Math.abs(value)} ${name}${Math.abs(value) === 1 ? '' : 's'} ${diff < 0 ? 'ago' : 'from now'}`;
    }
  }
  return 'just now';
}

tk.transform({
  watch: [input, unit],
  output: document.querySelector('#ts-output'),
  status: document.querySelector('#ts-status'),
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';

    let ms;
    if (/^-?\d+$/.test(raw)) {
      const n = Number(raw);
      ms = unit.value === 's' ? n * 1000 : n;
    } else {
      ms = Date.parse(raw);
      if (Number.isNaN(ms)) throw new Error('Unrecognised date or timestamp');
    }
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) throw new Error('Unrecognised date or timestamp');

    return [
      `Unix (s):   ${Math.floor(ms / 1000)}`,
      `Unix (ms):  ${ms}`,
      `ISO 8601:   ${date.toISOString()}`,
      `UTC:        ${date.toUTCString()}`,
      `Local:      ${date.toLocaleString()}`,
      `Day:        ${date.toLocaleDateString(undefined, { weekday: 'long' })}`,
      `Relative:   ${relative(ms)}`,
    ].join('\n');
  },
});
