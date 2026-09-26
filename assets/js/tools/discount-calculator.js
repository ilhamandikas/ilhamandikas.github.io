const { tk } = window;

const mode = document.querySelector('#dis-mode');
const aLabel = document.querySelector('#dis-a-label');
const bLabel = document.querySelector('#dis-b-label');
const a = document.querySelector('#dis-a');
const b = document.querySelector('#dis-b');
const bField = document.querySelector('#dis-b-field');
const stackField = document.querySelector('#dis-stack-field');
const stack = document.querySelector('#dis-stack');
const output = document.querySelector('#dis-output');
const status = document.querySelector('#dis-status');

const LABELS = {
  final: ['Original price', 'Discount (%)'],
  percent: ['Original price', 'Final price'],
  original: ['Final price', 'Discount (%)'],
  stack: ['Original price', ''],
};

const money = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

// Dots group thousands and a comma is the decimal mark, matching how prices are
// typed in Indonesia.
function number(text) {
  const cleaned = text.trim().replace(/\./g, '').replace(',', '.');
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

// Several discounts in a row are not added up: each one comes off the price the
// previous one left behind, so 20% then 10% is 28% off in total.
function stacked(first) {
  const discounts = stack.value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number);
  if (!discounts.length || discounts.some((value) => !Number.isFinite(value) || value < 0 || value >= 100)) {
    return { error: 'Enter discounts between 0 and 100, one per line.' };
  }

  let price = first;
  let saved = 0;
  const lines = [`Original price: ${money.format(first)}`, ''];
  discounts.forEach((value) => {
    const cut = price * (value / 100);
    price -= cut;
    saved += cut;
    lines.push(`After ${money.format(value)}%: ${money.format(price)} (saved ${money.format(cut)})`);
  });
  lines.push(
    '',
    `Total saved: ${money.format(saved)}`,
    `Final price: ${money.format(price)}`,
    `Effective discount: ${money.format((saved / first) * 100)}%`,
  );
  return { text: lines.join('\n') };
}

function render() {
  const [firstLabel, secondLabel] = LABELS[mode.value];
  aLabel.textContent = firstLabel;
  bLabel.textContent = secondLabel;

  const isStack = mode.value === 'stack';
  bField.hidden = isStack;
  stackField.hidden = !isStack;

  const first = number(a.value);
  if (isStack) {
    if (!a.value.trim()) {
      output.textContent = '';
      tk.setStatus(status, '');
      return;
    }
    if (first === null) {
      output.textContent = '';
      tk.setStatus(status, 'Enter a valid original price.', 'err');
      return;
    }
    const result = stacked(first);
    if (result.error) {
      output.textContent = '';
      tk.setStatus(status, result.error, 'err');
      return;
    }
    output.textContent = result.text;
    tk.setStatus(status, '');
    return;
  }

  const second = number(b.value);
  if (first === null && second === null) {
    output.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  if (first === null || second === null) {
    output.textContent = '';
    tk.setStatus(status, 'Fill in both numbers.', 'err');
    return;
  }

  let lines;
  if (mode.value === 'final') {
    const saved = first * (second / 100);
    lines = [
      `Original price: ${money.format(first)}`,
      `Discount: ${money.format(second)}%`,
      `You save: ${money.format(saved)}`,
      `Final price: ${money.format(first - saved)}`,
    ];
  } else if (mode.value === 'percent') {
    if (first === 0) {
      output.textContent = '';
      tk.setStatus(status, 'The original price cannot be zero.', 'err');
      return;
    }
    const percent = ((first - second) / first) * 100;
    lines = [
      `Original price: ${money.format(first)}`,
      `Final price: ${money.format(second)}`,
      `Discount: ${money.format(percent)}%`,
      `You save: ${money.format(first - second)}`,
    ];
  } else {
    if (second >= 100) {
      output.textContent = '';
      tk.setStatus(status, 'A discount of 100% or more has no original price.', 'err');
      return;
    }
    const original = first / (1 - second / 100);
    lines = [
      `Final price: ${money.format(first)}`,
      `Discount: ${money.format(second)}%`,
      `Original price: ${money.format(original)}`,
      `You save: ${money.format(original - first)}`,
    ];
  }

  output.textContent = lines.join('\n');
  tk.setStatus(status, '');
}

tk.live([mode, a, b, stack], render);
