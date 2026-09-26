const { tk } = window;

const input = document.querySelector('#ntw-input');
const capital = document.querySelector('#ntw-capital');
const output = document.querySelector('#ntw-output');
const status = document.querySelector('#ntw-status');

const ONES = [
  'nol', 'satu', 'dua', 'tiga', 'empat', 'lima',
  'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas',
];

function under100(value) {
  if (value < 12) return ONES[value];
  if (value < 20) return `${ONES[value - 10]} belas`;
  const tens = Math.floor(value / 10);
  const rest = value % 10;
  return `${ONES[tens]} puluh${rest ? ` ${ONES[rest]}` : ''}`;
}

function under1000(value) {
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  let text = '';
  if (hundreds === 1) text = 'seratus';
  else if (hundreds > 1) text = `${ONES[hundreds]} ratus`;
  if (rest) text += `${text ? ' ' : ''}${under100(rest)}`;
  return text;
}

const SCALES = [
  [1e15, 'kuadriliun'],
  [1e12, 'triliun'],
  [1e9, 'miliar'],
  [1e6, 'juta'],
  [1e3, 'ribu'],
];

function integerWords(value) {
  if (value === 0) return 'nol';
  const parts = [];
  let rest = value;
  for (const [size, name] of SCALES) {
    if (rest >= size) {
      const count = Math.floor(rest / size);
      rest %= size;
      if (count === 1 && size === 1e3) parts.push('seribu');
      else if (count === 1) parts.push(`satu ${name}`);
      else parts.push(`${under1000(count)} ${name}`);
    }
  }
  if (rest) parts.push(under1000(rest));
  return parts.join(' ');
}

function wordsFor(raw) {
  const match = raw.replace(/\s+/g, '').match(/^([+-]?)(\d*)(?:[.,](\d+))?$/);
  if (!match || (!match[2] && !match[3])) return null;
  const integer = match[2] || '0';
  if (integer.length > 16) return { tooBig: true };
  let text = integerWords(Number(integer));
  if (match[1] === '-') text = `minus ${text}`;
  if (match[3]) text += ` koma ${match[3].split('').map((digit) => ONES[Number(digit)]).join(' ')}`;
  return { text };
}

function render() {
  const raw = input.value.trim();
  if (!raw) {
    output.value = '';
    tk.setStatus(status, '');
    return;
  }
  const result = wordsFor(raw);
  if (!result || result.tooBig) {
    output.value = '';
    tk.setStatus(
      status,
      result && result.tooBig
        ? 'That number is too large for this tool.'
        : 'Enter a number, for example 1250000 or 1250000,5.',
      'err',
    );
    return;
  }
  output.value = capital.checked ? result.text.charAt(0).toUpperCase() + result.text.slice(1) : result.text;
  tk.setStatus(status, '');
}

tk.live([input, capital], render);
