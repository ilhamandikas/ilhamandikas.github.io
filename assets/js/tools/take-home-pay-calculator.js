// Estimate Indonesian take-home pay: gross minus the employee share of BPJS and
// PPh 21. The tax uses the annual Article 17 brackets, which is the figure the
// December reconciliation settles on.
const { tk } = window;

const els = {
  gross: document.querySelector('#ths-gross'),
  ptkp: document.querySelector('#ths-ptkp'),
  bonus: document.querySelector('#ths-bonus'),
  bpjs: document.querySelector('#ths-bpjs'),
  status: document.querySelector('#ths-status'),
  net: document.querySelector('#ths-net'),
  summary: document.querySelector('#ths-summary'),
  chart: document.querySelector('#ths-chart'),
  rows: document.querySelector('#ths-rows'),
  grossYear: document.querySelector('#ths-gross-year'),
  jabatan: document.querySelector('#ths-jabatan'),
  deductible: document.querySelector('#ths-deductible'),
  ptkpValue: document.querySelector('#ths-ptkp-value'),
  pkp: document.querySelector('#ths-pkp'),
  taxYear: document.querySelector('#ths-tax-year'),
  effective: document.querySelector('#ths-effective'),
};

const PTKP = {
  'TK/0': 54000000,
  'TK/1': 58500000,
  'TK/2': 63000000,
  'TK/3': 67500000,
  'K/0': 58500000,
  'K/1': 63000000,
  'K/2': 67500000,
  'K/3': 72000000,
};

// Ceiling and rate for each Article 17 bracket.
const BRACKETS = [
  [60000000, 0.05],
  [250000000, 0.15],
  [500000000, 0.25],
  [5000000000, 0.3],
  [Infinity, 0.35],
];

const JHT_RATE = 0.02;
const JP_RATE = 0.01;
const JP_CAP = 10547400;
const HEALTH_RATE = 0.01;
const HEALTH_CAP = 12000000;
const ALLOWANCE_RATE = 0.05;
const ALLOWANCE_CAP = 6000000;

const money = (value) => `Rp ${Math.round(value).toLocaleString('en-US')}`;

function progressive(taxable) {
  let left = taxable;
  let floor = 0;
  let tax = 0;
  BRACKETS.forEach(([ceiling, rate]) => {
    if (left <= 0) return;
    const slice = Math.min(left, ceiling - floor);
    tax += slice * rate;
    left -= slice;
    floor = ceiling;
  });
  return tax;
}

function compute() {
  const gross = Math.max(0, Number(els.gross.value) || 0);
  const bonus = Math.max(0, Number(els.bonus.value) || 0);
  const ptkp = PTKP[els.ptkp.value] || PTKP['TK/0'];
  const withBpjs = els.bpjs.checked;

  const yearly = gross * 12 + bonus;
  const jht = withBpjs ? gross * JHT_RATE : 0;
  const jp = withBpjs ? Math.min(gross, JP_CAP) * JP_RATE : 0;
  const health = withBpjs ? Math.min(gross, HEALTH_CAP) * HEALTH_RATE : 0;
  const contributions = jht + jp + health;

  const allowance = Math.min(yearly * ALLOWANCE_RATE, ALLOWANCE_CAP);
  const deductible = (jht + health) * 12;
  const pkp = Math.max(0, Math.floor((yearly - allowance - deductible - ptkp) / 1000) * 1000);
  const taxYear = progressive(pkp);
  const tax = taxYear / 12;
  const net = gross - contributions - tax;

  return { gross, bonus, ptkp, withBpjs, yearly, jht, jp, health, contributions, allowance, deductible, pkp, taxYear, tax, net };
}

function draw(result) {
  els.net.textContent = money(result.net);
  els.summary.textContent = `${money(result.gross)} gross minus ${money(result.contributions + result.tax)} of deductions, per month.`;

  tk.stackBar(
    els.chart,
    [
      { label: 'Take-home pay', value: result.net, display: money(result.net) },
      { label: 'PPh 21', value: result.tax, display: money(result.tax) },
      { label: 'JHT (2%)', value: result.jht, display: money(result.jht) },
      { label: 'JP (1%)', value: result.jp, display: money(result.jp) },
      { label: 'BPJS Kesehatan (1%)', value: result.health, display: money(result.health) },
    ],
    { label: 'Take-home pay and deductions out of gross pay' },
  );

  const basis = [
    ['JHT (2%)', '2% of gross pay', result.jht],
    ['JP (1%)', `1% of gross pay up to ${money(JP_CAP)}`, result.jp],
    ['BPJS Kesehatan (1%)', `1% of gross pay up to ${money(HEALTH_CAP)}`, result.health],
    ['PPh 21', 'annual Article 17 brackets, divided by 12', result.tax],
  ].filter((row) => row[2] > 0);

  els.rows.replaceChildren(
    ...basis.map(([name, how, value]) => {
      const tr = document.createElement('tr');
      const first = document.createElement('td');
      first.textContent = name;
      const month = document.createElement('td');
      month.textContent = money(value);
      const year = document.createElement('td');
      year.textContent = money(value * 12);
      const note = document.createElement('td');
      note.textContent = how;
      tr.append(first, month, year, note);
      return tr;
    }),
  );

  els.grossYear.textContent = money(result.yearly);
  els.jabatan.textContent = `${money(result.allowance)} (5%, capped at ${money(ALLOWANCE_CAP)})`;
  els.deductible.textContent = result.deductible > 0 ? money(result.deductible) : '—';
  els.ptkpValue.textContent = `${money(result.ptkp)} (${els.ptkp.value})`;
  els.pkp.textContent = money(result.pkp);
  els.taxYear.textContent = money(result.taxYear);
  els.effective.textContent = result.yearly > 0 ? `${((result.taxYear / result.yearly) * 100).toFixed(2)}%` : '0.00%';
}

function render() {
  const gross = Number(els.gross.value) || 0;
  if (gross <= 0) {
    els.net.textContent = '—';
    els.summary.textContent = '—';
    els.chart.replaceChildren();
    els.rows.replaceChildren();
    ['grossYear', 'jabatan', 'deductible', 'ptkpValue', 'pkp', 'taxYear'].forEach((key) => {
      els[key].textContent = '—';
    });
    els.effective.textContent = '—';
    tk.setStatus(els.status, 'Enter a gross salary to see the estimate.');
    return;
  }

  const result = compute();
  draw(result);
  tk.setStatus(
    els.status,
    `Net pay is ${((result.net / result.gross) * 100).toFixed(1)}% of gross, with an effective tax rate of ${((result.taxYear / result.yearly) * 100).toFixed(2)}%.`,
    'ok',
  );
}

tk.live([els.gross, els.ptkp, els.bonus, els.bpjs], render, 200);
