const { tk } = window;

const input = document.querySelector('#cur-input');
const symbol = document.querySelector('#cur-symbol');
const style = document.querySelector('#cur-style');
const decimals = document.querySelector('#cur-decimals');
const space = document.querySelector('#cur-space');
const output = document.querySelector('#cur-output');
const status = document.querySelector('#cur-status');

// The group and decimal separators depend on the style, so strip the one that
// is not the decimal point before handing the string to Number.
function parseAmount(text, kind) {
  let value = text;
  if (kind === 'id') value = value.replace(/\./g, '').replace(',', '.');
  else value = value.replace(/,/g, '');
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function render() {
  const raw = input.value.trim();
  if (!raw) {
    output.value = '';
    tk.setStatus(status, '');
    return;
  }
  const amount = parseAmount(raw, style.value);
  if (amount === null) {
    output.value = '';
    tk.setStatus(status, 'That is not a number.', 'err');
    return;
  }

  const places =
    decimals.value.trim() === ''
      ? Number.isInteger(amount)
        ? 0
        : 2
      : Math.max(0, Math.min(6, Number(decimals.value)));
  const locale = style.value === 'id' ? 'id-ID' : 'en-US';
  const body = new Intl.NumberFormat(locale, {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  }).format(amount);

  output.value = symbol.value ? `${symbol.value}${space.checked ? ' ' : ''}${body}` : body;
  tk.setStatus(status, '');
}

tk.live([input, symbol, style, decimals, space], render);
