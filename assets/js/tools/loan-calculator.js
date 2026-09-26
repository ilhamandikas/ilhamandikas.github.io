// Fixed-rate loan: the annuity instalment, the amortisation schedule behind it,
// and what an extra monthly payment does to the interest and the term.
const { tk } = window;

const els = {
  preset: document.querySelector('#lnc-preset'),
  currency: document.querySelector('#lnc-currency'),
  amount: document.querySelector('#lnc-amount'),
  rate: document.querySelector('#lnc-rate'),
  years: document.querySelector('#lnc-years'),
  extra: document.querySelector('#lnc-extra'),
  status: document.querySelector('#lnc-status'),
  monthly: document.querySelector('#lnc-monthly'),
  summary: document.querySelector('#lnc-summary'),
  balance: document.querySelector('#lnc-balance'),
  principal: document.querySelector('#lnc-principal'),
  interest: document.querySelector('#lnc-interest'),
  total: document.querySelector('#lnc-total'),
  count: document.querySelector('#lnc-count'),
  last: document.querySelector('#lnc-last'),
  payoff: document.querySelector('#lnc-payoff'),
  extraPanel: document.querySelector('#lnc-extra-panel'),
  saved: document.querySelector('#lnc-saved'),
  shortened: document.querySelector('#lnc-shortened'),
  split: document.querySelector('#lnc-split'),
  first: document.querySelector('#lnc-first'),
  rows: document.querySelector('#lnc-rows'),
};

const PRESETS = {
  home: { amount: 300000000, rate: 7.5, years: 15 },
  vehicle: { amount: 200000000, rate: 8.5, years: 5 },
  education: { amount: 100000000, rate: 6.5, years: 7 },
  personal: { amount: 50000000, rate: 12, years: 3 },
};

const TONES = {
  principal: 'tool-chart-tone-1',
  interest: 'tool-chart-tone-2',
};

const clear = ['principal', 'interest', 'total', 'count', 'last', 'payoff'];
const empty = () => {
  els.monthly.textContent = '—';
  els.summary.textContent = '—';
  els.balance.replaceChildren();
  els.split.replaceChildren();
  els.first.replaceChildren();
  els.rows.replaceChildren();
  clear.forEach((key) => {
    els[key].textContent = '—';
  });
  els.extraPanel.hidden = true;
};

function schedule(amount, rate, years, extra) {
  const monthly = rate / 100 / 12;
  const months = Math.round(years * 12);
  const base = monthly === 0 ? amount / months : (amount * monthly) / (1 - Math.pow(1 + monthly, -months));
  const rows = [];
  let balance = amount;
  let interest = 0;
  while (balance > 0.5 && rows.length < months * 2 + 12) {
    const charged = balance * monthly;
    let principal = base + extra - charged;
    if (principal <= 0) break;
    if (principal > balance) principal = balance;
    balance -= principal;
    interest += charged;
    rows.push({ month: rows.length + 1, principal, interest: charged, balance });
  }
  return {
    months,
    base,
    rows,
    interest,
    paid: amount + interest,
    stalled: balance > 0.5,
  };
}

// Group the monthly rows into years, keeping the opening balance of each.
function byYear(rows) {
  const years = [];
  rows.forEach((row) => {
    const index = Math.ceil(row.month / 12);
    if (!years[index - 1]) {
      years[index - 1] = { year: index, opening: row.balance + row.principal, principal: 0, interest: 0, closing: row.balance };
    }
    const group = years[index - 1];
    group.principal += row.principal;
    group.interest += row.interest;
    group.closing = row.balance;
  });
  return years;
}

function money(value, symbol) {
  return `${symbol} ${Math.round(value).toLocaleString('en-US')}`;
}

function shortMoney(value, symbol) {
  if (value >= 1e9) return `${symbol} ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${symbol} ${Math.round(value / 1e6)}M`;
  if (value >= 1e3) return `${symbol} ${Math.round(value / 1e3)}K`;
  return `${symbol} ${Math.round(value)}`;
}

function monthName(offset) {
  const start = new Date();
  start.setDate(1);
  start.setMonth(start.getMonth() + offset);
  return start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function drawTable(years, symbol) {
  els.rows.replaceChildren(
    ...years.map((group) => {
      const tr = document.createElement('tr');
      [group.year, money(group.opening, symbol), money(group.principal, symbol), money(group.interest, symbol), money(group.closing, symbol)].forEach((value) => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      });
      return tr;
    }),
  );
}

function render() {
  const symbol = els.currency.value;
  const amount = Number(els.amount.value) || 0;
  const rate = Number(els.rate.value);
  const years = Number(els.years.value);
  const extra = Math.max(0, Number(els.extra.value) || 0);

  if (amount <= 0) {
    empty();
    tk.setStatus(els.status, 'Enter an amount to borrow.');
    return;
  }
  if (!(rate >= 0)) {
    empty();
    tk.setStatus(els.status, 'Enter an interest rate of 0% or more.');
    return;
  }
  if (!(years >= 1)) {
    empty();
    tk.setStatus(els.status, 'Enter a term of at least one year.');
    return;
  }

  const plan = schedule(amount, rate, years, extra);
  if (plan.stalled) {
    empty();
    tk.setStatus(els.status, 'The instalment does not cover the monthly interest, so this loan never ends. Raise the payment.');
    return;
  }

  const groups = byYear(plan.rows);
  const startYear = new Date().getFullYear();
  const last = plan.rows[plan.rows.length - 1];
  const first = plan.rows[0];

  els.monthly.textContent = `${money(plan.base + extra, symbol)} a month`;
  els.summary.textContent = `${plan.rows.length} instalment${plan.rows.length === 1 ? '' : 's'} of about ${money(plan.base + extra, symbol)}, paying ${money(plan.interest, symbol)} in interest on top of the ${money(amount, symbol)} borrowed.`;

  tk.lineChart(
    els.balance,
    [amount, ...groups.map((group) => group.closing)],
    {
      format: (value) => shortMoney(value, symbol),
      xLabels: [String(startYear), ...groups.map((group) => String(startYear + group.year))],
      label: `Remaining balance from ${startYear} to ${startYear + groups.length}`,
    },
  );

  tk.stackBar(els.split, [
    { label: 'Principal', value: amount, display: money(amount, symbol) },
    { label: 'Interest', value: plan.interest, display: money(plan.interest, symbol) },
  ], { label: 'Principal and interest across the whole loan' });

  tk.stackBar(els.first, [
    { label: 'Principal', value: first.principal, display: money(first.principal, symbol) },
    { label: 'Interest', value: first.interest, display: money(first.interest, symbol) },
  ], { label: 'Principal and interest in the first instalment' });

  els.principal.textContent = money(amount, symbol);
  els.interest.textContent = money(plan.interest, symbol);
  els.total.textContent = money(plan.paid, symbol);
  els.count.textContent = `${plan.rows.length} (${(plan.rows.length / 12).toFixed(1)} years)`;
  els.last.textContent = money(last.principal + last.interest, symbol);
  els.payoff.textContent = monthName(plan.rows.length);
  drawTable(groups, symbol);

  if (extra > 0) {
    const plain = schedule(amount, rate, years, 0);
    const saved = plain.interest - plan.interest;
    const shorter = plain.rows.length - plan.rows.length;
    els.extraPanel.hidden = false;
    els.saved.textContent = `${money(saved, symbol)} (${(plan.interest / plain.interest * 100).toFixed(1)}% of the interest)`;
    els.shortened.textContent = shorter > 0 ? `${shorter} month${shorter === 1 ? '' : 's'} (${(shorter / 12).toFixed(1)} years), paid off ${monthName(plan.rows.length)}` : 'Nothing, this loan already ends on time.';
    tk.setStatus(els.status, `Paying ${money(extra, symbol)} extra each month saves ${money(saved, symbol)} and ends the loan ${shorter} month${shorter === 1 ? '' : 's'} early.`, 'ok');
    return;
  }

  els.extraPanel.hidden = true;
  tk.setStatus(els.status, `Interest is ${((plan.interest / amount) * 100).toFixed(1)}% of the amount borrowed.`, 'ok');
}

els.preset.addEventListener('change', () => {
  const preset = PRESETS[els.preset.value];
  if (!preset) return;
  els.amount.value = String(preset.amount);
  els.rate.value = String(preset.rate);
  els.years.value = String(preset.years);
  render();
});

tk.live([els.currency, els.amount, els.rate, els.years, els.extra], render, 200);
