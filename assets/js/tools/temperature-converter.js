// Temperature converter.
const { tk } = window;

const input = document.querySelector('#temp-input');
const unit = document.querySelector('#temp-unit');

const toCelsius = { C: (v) => v, F: (v) => (v - 32) * (5 / 9), K: (v) => v - 273.15 };
const round = (v) => Number(v.toFixed(2));

tk.transform({
  watch: [input, unit],
  output: document.querySelector('#temp-output'),
  status: document.querySelector('#temp-status'),
  fn: () => {
    const raw = input.value.trim();
    if (raw === '') return '';
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error('Enter a number');
    const c = toCelsius[unit.value](value);
    if (c < -273.15) throw new Error('Below absolute zero');
    return [
      `Celsius:    ${round(c)} °C`,
      `Fahrenheit: ${round(c * (9 / 5) + 32)} °F`,
      `Kelvin:     ${round(c + 273.15)} K`,
    ].join('\n');
  },
});
