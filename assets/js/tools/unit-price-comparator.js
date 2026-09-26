const { tk } = window;

const input = document.querySelector('#upc-input');
const output = document.querySelector('#upc-output');
const status = document.querySelector('#upc-status');

// Each unit maps to a base unit so a litre and a millilitre, or a kilogram and
// a gram, can be ranked together. The last number is the display step.
const UNITS = {
  ml: ['volume', 1, 'ml', 100],
  l: ['volume', 1000, 'ml', 100],
  liter: ['volume', 1000, 'ml', 100],
  litre: ['volume', 1000, 'ml', 100],
  g: ['mass', 1, 'g', 100],
  gram: ['mass', 1, 'g', 100],
  kg: ['mass', 1000, 'g', 100],
  kilogram: ['mass', 1000, 'g', 100],
  m: ['length', 100, 'cm', 100],
  cm: ['length', 1, 'cm', 100],
  mm: ['length', 0.1, 'cm', 100],
  pcs: ['count', 1, 'unit', 1],
  pc: ['count', 1, 'unit', 1],
  unit: ['count', 1, 'unit', 1],
  buah: ['count', 1, 'unit', 1],
  butir: ['count', 1, 'unit', 1],
};

const money = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

function parse(text) {
  const rows = [];
  const errors = [];
  text.split('\n').forEach((line, index) => {
    if (!line.trim()) return;
    const fields = line.split(',').map((field) => field.trim());
    if (fields.length < 4) {
      errors.push(`Line ${index + 1}: needs name, price, quantity and unit.`);
      return;
    }
    const price = Number(fields[1]);
    const quantity = Number(fields[2]);
    const unit = UNITS[fields[3].toLowerCase()];
    if (!Number.isFinite(price) || !Number.isFinite(quantity) || price <= 0 || quantity <= 0) {
      errors.push(`Line ${index + 1}: price and quantity must be positive numbers.`);
      return;
    }
    if (!unit) {
      errors.push(`Line ${index + 1}: unknown unit "${fields[3]}".`);
      return;
    }
    const [, factor, baseName, step] = unit;
    const base = quantity * factor;
    rows.push({
      name: fields[0] || `Line ${index + 1}`,
      baseName,
      step,
      unitPrice: price / base,
    });
  });
  return { rows, errors };
}

function render() {
  if (!input.value.trim()) {
    output.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  const { rows, errors } = parse(input.value);
  if (errors.length) {
    output.textContent = '';
    tk.setStatus(status, errors[0], 'err');
    return;
  }
  if (rows.length < 2) {
    output.textContent = '';
    tk.setStatus(status, 'Enter at least two products to compare.', 'err');
    return;
  }

  const groups = new Map();
  rows.forEach((row) => {
    if (!groups.has(row.baseName)) groups.set(row.baseName, []);
    groups.get(row.baseName).push(row);
  });

  const lines = [];
  groups.forEach((group, baseName) => {
    const step = group[0].step;
    lines.push(baseName.toUpperCase());
    [...group]
      .sort((x, y) => x.unitPrice - y.unitPrice)
      .forEach((row, index) => {
        const mark = index === 0 ? '* ' : '  ';
        lines.push(
          `${mark}${row.name} — ${money.format(row.unitPrice * step)} per ${step} ${baseName} (${money.format(row.unitPrice)} per ${baseName})`,
        );
      });
    lines.push('');
  });

  output.textContent = lines.join('\n').trim();
  tk.setStatus(status, `${rows.length} products compared.`);
}

tk.live([input], render);
