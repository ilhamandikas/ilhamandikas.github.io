// Interest calculator: deposits and loans, with the conventions Indonesian
// banks and lenders actually use (marked "ID" in the interface).
const { tk } = window;

const product = document.querySelector('#int-product');
const method = document.querySelector('#int-method');
const principal = document.querySelector('#int-principal');
const rate = document.querySelector('#int-rate');
const tenor = document.querySelector('#int-tenor');
const unit = document.querySelector('#int-unit');
const taxInput = document.querySelector('#int-tax');
const basisInput = document.querySelector('#int-basis');
const freq = document.querySelector('#int-freq');
const aro = document.querySelector('#int-aro');
const scheduleInput = document.querySelector('#int-schedule');
const tiersInput = document.querySelector('#int-tiers');
const freqField = document.querySelector('#int-freq-field');
const aroField = document.querySelector('#int-aro-field');
const scheduleField = document.querySelector('#int-schedule-field');
const tiersField = document.querySelector('#int-tiers-field');
const scheduleLabel = document.querySelector('#int-schedule-label');
const summary = document.querySelector('#int-summary');
const scheduleOut = document.querySelector('#int-schedule-out');
const explain = document.querySelector('#int-explain');
const status = document.querySelector('#int-status');

// Product shortcuts: the tax rate and day-count basis each product uses in
// Indonesia, plus a sensible starting method.
const PRESETS = {
  deposit: { method: 'simple', tax: 20, basis: 'actual365', tenor: 1, unit: 'months' },
  savings: { method: 'compound', tax: 20, basis: 'actual365', freq: '12' },
  bond: { method: 'simple', tax: 10, basis: 'actual365', tenor: 1, unit: 'years' },
  moneymarket: { method: 'compound', tax: 0, basis: 'actual365', freq: '365' },
  loan: { method: 'annuity', tax: 0, basis: '30/360', tenor: 12, unit: 'months' },
  custom: {},
};
const PRODUCT_NAMES = {
  deposit: 'Bank deposit (deposito, ID)',
  savings: 'Savings (tabungan, ID)',
  bond: 'Government bond (SBN, ID)',
  moneymarket: 'Money market fund (reksa dana pasar uang, ID)',
  loan: 'Loan (kredit, ID)',
  custom: 'Custom',
};

// `indonesia` is the part that is specific to Indonesian practice; it is shown
// under an "ID" badge so the generic maths and the local convention stay apart.
const EXPLAIN = {
  simple: {
    title: 'Simple interest (flat)',
    body: 'Interest is computed once on the principal and never earns interest itself. This is what a term deposit that pays at maturity uses. Formula: <code>interest = principal × rate × (days ÷ basis)</code>.',
    indonesia: 'In Indonesia this is the default for <em>deposito</em>, normally with a 20% final tax and an Actual/365 basis.',
  },
  compound: {
    title: 'Compound interest',
    body: 'Each period’s interest is added to the balance, so the next period earns interest on it too. Tax is withheld every time interest is paid, so a rollover compounds the <em>net</em> interest, not the gross. Formula: <code>balance = principal × (1 + rate ÷ n)<sup>n·t</sup></code>.',
    indonesia: 'Indonesian <em>tabungan</em> and <em>deposito</em> that roll over (ARO) work this way, with the 20% final tax taken at each payment.',
  },
  tiered: {
    title: 'Tiered interest',
    body: 'The balance is split into brackets and each bracket has its own rate, like income-tax bands. Interest is the sum across brackets rather than one rate on the whole balance.',
    indonesia: 'This is how Indonesian savings accounts price larger balances: the first bracket earns the base rate and higher brackets earn more.',
  },
  stepup: {
    title: 'Step-up interest',
    body: 'The rate changes each period following a rising schedule, such as 6% in year one, 7% in year two, 8% in year three. Each period is computed with its own rate and the results are added.',
    indonesia: 'Sold in Indonesia as <em>bunga berjenjang naik</em>, usually for multi-year tenors.',
  },
  floating: {
    title: 'Floating interest',
    body: 'The rate follows a market benchmark plus a spread and can move either way each period. The maths is the same as step-up: a list of rates per period, only the direction is free.',
    indonesia: 'In Indonesia the benchmark is commonly BI Rate or JIBOR plus a spread, used for loans and some savings products.',
  },
  flat: {
    title: 'Flat interest (loan)',
    body: 'Interest is always charged on the original loan amount, no matter how much of the debt is left. Total interest = <code>amount × rate × (months ÷ 12)</code>, then split evenly across all instalments. That is why flat interest is always more expensive than it looks.',
    indonesia: 'The most common quote for Indonesian <em>kredit</em> — motorcycles, cars and multipurpose loans. Always compare it with the effective rate.',
  },
  effective: {
    title: 'Effective interest (declining balance)',
    body: 'Interest is charged on the remaining principal each month, so the interest portion shrinks and the principal portion grows. Per month: <code>interest = remaining principal × rate ÷ 12</code>.',
    indonesia: 'Indonesian lenders must publish this figure alongside the flat rate, so it is the honest number to compare offers with.',
  },
  annuity: {
    title: 'Annuity',
    body: 'The total instalment stays the same each month, but its mix shifts from interest to principal. Formula: <code>A = P · i ÷ (1 − (1 + i)<sup>−n</sup>)</code>, with <code>i = rate ÷ 12</code> and <code>n</code> the number of months.',
    indonesia: 'This is the standard structure for Indonesian <em>KPR</em> (mortgages), often with a fixed-rate period followed by a floating rate.',
  },
};

const parseAmount = (value) => Number(String(value).replace(/[^\d.-]/g, ''));
const pct = (value) => (Number.isFinite(Number(value)) ? Number(value) / 100 : 0);
const money = (value) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;
const pctText = (value) => `${(value * 100).toFixed(value * 100 % 1 === 0 ? 0 : 2)}%`;

function basisConfig(basis) {
  return basis === 'actual365' ? { year: 365, month: 30 } : { year: 360, month: 30 };
}

function tenorDays(value, unitName, cfg) {
  if (unitName === 'days') return value;
  if (unitName === 'years') return value * cfg.year;
  return value * cfg.month;
}

function calcSimple(P, r, days, taxRate, cfg) {
  const gross = P * r * (days / cfg.year);
  const tax = gross * taxRate;
  return { gross, tax, net: gross - tax, ending: P + gross - tax, schedule: [] };
}

function calcCompound(P, r, days, taxRate, cfg, n, rollover) {
  const periods = (days / cfg.year) * n;
  const whole = Math.floor(periods + 1e-9);
  const frac = periods - whole;
  let balance = P;
  let gross = 0;
  let tax = 0;
  let net = 0;
  const schedule = [];
  for (let i = 1; i <= whole; i += 1) {
    const g = balance * (r / n);
    const t = g * taxRate;
    const nt = g - t;
    gross += g; tax += t; net += nt;
    schedule.push({ label: `Period ${i}`, rate: r, opening: balance, gross: g, tax: t, net: nt, closing: rollover ? balance + nt : balance });
    if (rollover) balance += nt;
  }
  if (frac > 1e-9) {
    const g = balance * (r / n) * frac;
    const t = g * taxRate;
    const nt = g - t;
    gross += g; tax += t; net += nt;
    schedule.push({ label: `Period ${whole + 1} (partial)`, rate: r, opening: balance, gross: g, tax: t, net: nt, closing: rollover ? balance + nt : balance });
    if (rollover) balance += nt;
  }
  return {
    gross, tax, net, ending: P + (rollover ? net : 0), schedule,
    eayGross: (1 + r / n) ** n - 1,
    eayNet: (1 + (r / n) * (1 - taxRate)) ** n - 1,
  };
}

function parseTiers(text) {
  const tiers = [];
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim();
    if (!s) continue;
    const m = s.match(/^(\*|[\d.,]+)\s+([\d.,]+)$/);
    if (!m) continue;
    const limit = m[1] === '*' ? Infinity : parseAmount(m[1]);
    const tierRate = Number(m[2].replace(',', '.')) / 100;
    if (Number.isFinite(limit) && Number.isFinite(tierRate)) tiers.push({ limit, rate: tierRate });
  }
  return tiers;
}

function calcTiered(P, days, taxRate, cfg, tiers) {
  let gross = 0;
  let lower = 0;
  const schedule = [];
  for (const tier of tiers) {
    if (P <= lower) break;
    const amount = Math.min(P, tier.limit) - lower;
    if (amount > 0) {
      const g = amount * tier.rate * (days / cfg.year);
      gross += g;
      schedule.push({ label: `${money(lower)} – ${tier.limit === Infinity ? '∞' : money(tier.limit)}`, rate: tier.rate, gross: g });
    }
    lower = tier.limit;
    if (tier.limit === Infinity) break;
  }
  const tax = gross * taxRate;
  return { gross, tax, net: gross - tax, ending: P + gross - tax, schedule, tiered: true };
}

function parseRates(text) {
  return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
    .map((s) => Number(s.replace(',', '.')) / 100).filter(Number.isFinite);
}

function calcStepped(P, days, taxRate, cfg, rates) {
  const years = days / cfg.year;
  const schedule = [];
  let gross = 0;
  let remaining = years;
  let index = 0;
  while (remaining > 1e-9 && rates.length) {
    const rate = rates[Math.min(index, rates.length - 1)];
    const span = Math.min(1, remaining);
    const g = P * rate * span;
    gross += g;
    schedule.push({ label: `Period ${index + 1}`, rate, gross: g, tax: g * taxRate, net: g * (1 - taxRate) });
    remaining -= span;
    index += 1;
  }
  const tax = gross * taxRate;
  return { gross, tax, net: gross - tax, ending: P + gross - tax, schedule };
}

function calcLoanFlat(P, r, months) {
  const totalInterest = P * r * (months / 12);
  const monthly = (P + totalInterest) / months;
  const principalPart = P / months;
  const interestPart = totalInterest / months;
  let balance = P;
  const schedule = [];
  for (let i = 1; i <= months; i += 1) {
    const opening = balance;
    balance -= principalPart;
    schedule.push({ label: `Month ${i}`, opening, gross: interestPart, principal: principalPart, payment: monthly, closing: Math.max(0, balance) });
  }
  return { gross: totalInterest, tax: 0, net: totalInterest, ending: P + totalInterest, schedule, loan: true, totalPayment: P + totalInterest, monthly };
}

function calcLoanEffective(P, r, months) {
  const principalPart = P / months;
  let balance = P;
  let gross = 0;
  const schedule = [];
  for (let i = 1; i <= months; i += 1) {
    const interest = balance * (r / 12);
    gross += interest;
    const opening = balance;
    balance -= principalPart;
    schedule.push({ label: `Month ${i}`, opening, gross: interest, principal: principalPart, payment: interest + principalPart, closing: Math.max(0, balance) });
  }
  return { gross, tax: 0, net: gross, ending: P + gross, schedule, loan: true, totalPayment: P + gross };
}

function calcLoanAnnuity(P, r, months) {
  const i = r / 12;
  const payment = i === 0 ? P / months : (P * i) / (1 - (1 + i) ** -months);
  let balance = P;
  let gross = 0;
  const schedule = [];
  for (let k = 1; k <= months; k += 1) {
    const interest = balance * i;
    const principalPart = payment - interest;
    gross += interest;
    const opening = balance;
    balance -= principalPart;
    schedule.push({ label: `Month ${k}`, opening, gross: interest, principal: principalPart, payment, closing: Math.max(0, balance) });
  }
  return { gross, tax: 0, net: gross, ending: P + gross, schedule, loan: true, totalPayment: payment * months, monthly: payment };
}

function row(key, value, accent) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  dt.textContent = key;
  dd.textContent = value;
  if (accent) dd.classList.add('tool-type');
  wrap.append(dt, dd);
  return wrap;
}

function table(headers, rows) {
  const el = document.createElement('table');
  el.className = 'tool-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = h;
    headRow.append(th);
  }
  thead.append(headRow);
  const tbody = document.createElement('tbody');
  for (const cells of rows) {
    const tr = document.createElement('tr');
    for (const cell of cells) {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.append(td);
    }
    tbody.append(tr);
  }
  el.append(thead, tbody);
  return el;
}

let summaryText = '';

function clearResults(message) {
  summary.replaceChildren();
  scheduleOut.replaceChildren();
  summaryText = '';
  tk.setStatus(status, message || '');
}

function syncFields() {
  const m = method.value;
  freqField.hidden = m !== 'compound';
  aroField.hidden = m !== 'compound';
  scheduleField.hidden = !(m === 'stepup' || m === 'floating');
  tiersField.hidden = m !== 'tiered';
  scheduleLabel.textContent = m === 'floating' ? 'Rate per period (floating)' : 'Rate per period (step-up)';
}

function render() {
  syncFields();
  const P = parseAmount(principal.value);
  const r = pct(rate.value);
  const taxRate = pct(taxInput.value);
  const cfg = basisConfig(basisInput.value);
  const tenorValue = Number(tenor.value) || 0;
  const months = unit.value === 'years' ? tenorValue * 12 : unit.value === 'days' ? tenorValue / 30 : tenorValue;
  const days = tenorDays(tenorValue, unit.value, cfg);
  const m = method.value;

  if (!Number.isFinite(P) || P <= 0 || !Number.isFinite(r) || days <= 0) {
    clearResults('Enter a principal, a rate and a tenor');
    return;
  }

  let result;
  try {
    if (m === 'simple') result = calcSimple(P, r, days, taxRate, cfg);
    else if (m === 'compound') result = calcCompound(P, r, days, taxRate, cfg, Number(freq.value) || 1, aro.checked);
    else if (m === 'tiered') result = calcTiered(P, days, taxRate, cfg, parseTiers(tiersInput.value));
    else if (m === 'stepup' || m === 'floating') result = calcStepped(P, days, taxRate, cfg, parseRates(scheduleInput.value));
    else if (m === 'flat') result = calcLoanFlat(P, r, months);
    else if (m === 'effective') result = calcLoanEffective(P, r, months);
    else result = calcLoanAnnuity(P, r, months);
  } catch (error) {
    clearResults(error.message);
    return;
  }

  if (result.loan && months <= 0) {
    clearResults('Loan tenor must be more than 0 months');
    return;
  }
  if (m === 'tiered' && !result.schedule.length) {
    clearResults('Add at least one bracket, for example 10000000 3');
    return;
  }
  if ((m === 'stepup' || m === 'floating') && !result.schedule.length) {
    clearResults('Add at least one rate per period, for example 6');
    return;
  }

  const netPerDay = result.net / days;
  const productName = PRODUCT_NAMES[product.value] || 'Custom';
  const rows = [];

  if (result.loan) {
    rows.push(row('Total interest', money(result.gross)));
    rows.push(row('Total paid', money(result.totalPayment)));
    if (result.monthly) rows.push(row('Monthly instalment', money(result.monthly), true));
    rows.push(row('Tenor', `${months} months`));
  } else {
    rows.push(row('Gross interest', money(result.gross)));
    rows.push(row(`Tax ${pctText(taxRate)}`, `− ${money(result.tax)}`));
    rows.push(row('Net interest', money(result.net), true));
    rows.push(row('Ending balance', money(result.ending)));
    rows.push(row('Net per day', money(netPerDay)));
    rows.push(row('Net per month (30 days)', money(netPerDay * 30)));
    rows.push(row('Net per year', money(netPerDay * cfg.year)));
    if (result.eayGross != null) {
      rows.push(row('Gross EAY', pctText(result.eayGross)));
      rows.push(row('Net EAY', pctText(result.eayNet)));
    }
  }

  const lines = [
    `Product: ${productName}`,
    `Method: ${EXPLAIN[m].title}`,
    `Principal: ${money(P)} · Rate: ${pctText(r)}/year · Tenor: ${days} days · Basis: ${basisInput.value}`,
  ];
  for (const el of rows) lines.push(`${el.querySelector('dt').textContent}: ${el.querySelector('dd').textContent}`);
  summaryText = lines.join('\n');

  summary.replaceChildren(...rows);
  tk.setStatus(status, 'Calculated', 'ok');

  // Schedule table
  scheduleOut.replaceChildren();
  if (result.schedule.length) {
    const head = result.loan
      ? ['Period', 'Opening', 'Interest', 'Principal', 'Instalment', 'Balance']
      : result.tiered
        ? ['Bracket', 'Rate', 'Gross interest']
        : ['Period', 'Opening', 'Gross interest', 'Tax', 'Net interest', 'Closing'];
    const shown = result.schedule.slice(0, 80);
    const body = shown.map((s) => (result.loan
      ? [s.label, money(s.opening), money(s.gross), money(s.principal), money(s.payment), money(s.closing)]
      : result.tiered
        ? [s.label, pctText(s.rate), money(s.gross)]
        : [s.label, money(s.opening), money(s.gross), money(s.tax), money(s.net), money(s.closing)]));
    const title = document.createElement('h3');
    title.className = 'tool-group';
    title.textContent = result.loan ? 'Instalment schedule' : 'Period breakdown';
    scheduleOut.append(title, table(head, body));
    if (result.schedule.length > shown.length) {
      const note = document.createElement('p');
      note.className = 'tool-note';
      note.textContent = `Showing ${shown.length} of ${result.schedule.length} periods.`;
      scheduleOut.append(note);
    }
  }

  // Explanation
  const info = EXPLAIN[m];
  const title = document.createElement('h3');
  title.textContent = info.title;
  const body = document.createElement('p');
  body.innerHTML = info.body;
  const formula = document.createElement('p');
  formula.className = 'tool-note';
  formula.textContent = `Used for: ${productName}. Tax ${pctText(taxRate)}, basis ${basisInput.value}.`;
  const local = document.createElement('p');
  local.className = 'int-local';
  local.innerHTML = `<span class="int-id">ID</span> ${info.indonesia}`;
  explain.replaceChildren(title, body, formula, local);
}

function applyPreset() {
  const preset = PRESETS[product.value];
  if (!preset) return;
  if (preset.method) method.value = preset.method;
  if (preset.tax != null) taxInput.value = preset.tax;
  if (preset.basis) basisInput.value = preset.basis;
  if (preset.freq) freq.value = preset.freq;
  if (preset.tenor) tenor.value = preset.tenor;
  if (preset.unit) unit.value = preset.unit;
}

product.addEventListener('change', () => {
  applyPreset();
  render();
});
document.querySelector('#int-calc').addEventListener('click', render);
document.querySelector('#int-copy').addEventListener('click', () => {
  if (summaryText) tk.copy(summaryText, status, 'Result copied');
});

tk.live([method, principal, rate, tenor, unit, taxInput, basisInput, freq, aro, scheduleInput, tiersInput], render);
