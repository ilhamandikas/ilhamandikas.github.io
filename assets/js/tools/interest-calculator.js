// Interest calculator: deposits and loans, with Indonesian tax presets.
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
  deposit: 'Deposito bank', savings: 'Tabungan', bond: 'Obligasi / SBN',
  moneymarket: 'Reksa dana pasar uang', loan: 'Kredit / pinjaman', custom: 'Kustom',
};

const EXPLAIN = {
  simple: {
    title: 'Bunga sederhana (flat)',
    body: 'Bunga dihitung sekali dari pokok, tanpa berbunga lagi. Ini yang dipakai deposito yang membayar bunga di akhir tenor. Rumus: <code>bunga = pokok × rate × (hari ÷ basis)</code>.',
  },
  compound: {
    title: 'Bunga majemuk (compound / efektif)',
    body: 'Bunga tiap periode ditambahkan ke saldo, sehingga periode berikutnya berbunga di atas bunga sebelumnya. Pajak dipotong tiap kali bunga dibayar, jadi yang di-rollover adalah bunga <em>net</em>, bukan bruto. Rumus: <code>saldo = pokok × (1 + rate ÷ n)<sup>n·t</sup></code>.',
  },
  tiered: {
    title: 'Bunga berjenjang (tiered)',
    body: 'Saldo dipecah per bracket dan tiap bracket punya rate sendiri, seperti lapisan pajak. Bunga dihitung dari jumlah saldo di tiap lapisan, bukan dari satu rate untuk seluruh saldo.',
  },
  stepup: {
    title: 'Bunga naik bertahap (step-up)',
    body: 'Rate berubah tiap periode mengikuti jadwal yang naik, misalnya 6% tahun pertama, 7% tahun kedua, 8% tahun ketiga. Setiap periode dihitung dengan rate-nya sendiri lalu dijumlahkan.',
  },
  floating: {
    title: 'Bunga mengambang (floating)',
    body: 'Rate mengikuti acuan pasar (misalnya BI Rate + spread) dan bisa naik atau turun tiap periode. Secara hitungan sama dengan step-up: daftar rate per periode, hanya arahnya yang bebas.',
  },
  flat: {
    title: 'Bunga flat (pinjaman)',
    body: 'Bunga selalu dihitung dari plafon awal, tidak peduli sisa utang sudah berkurang. Total bunga = <code>plafon × rate × (bulan ÷ 12)</code>, lalu dibagi rata ke semua angsuran. Ini yang membuat bunga flat selalu lebih mahal dari yang terlihat.',
  },
  effective: {
    title: 'Bunga efektif (saldo menurun)',
    body: 'Bunga dihitung dari sisa pokok setiap bulan, jadi angsuran bunganya mengecil dan porsi pokoknya membesar. Rumus per bulan: <code>bunga = sisa pokok × rate ÷ 12</code>.',
  },
  annuity: {
    title: 'Anuitas',
    body: 'Total angsuran tetap tiap bulan, tapi komposisinya bergeser dari bunga ke pokok. Rumus: <code>A = P · i ÷ (1 − (1 + i)<sup>−n</sup>)</code>, dengan <code>i = rate ÷ 12</code> dan <code>n</code> jumlah bulan. Dipakai di KPR.',
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
    schedule.push({ label: `Periode ${i}`, rate: r, opening: balance, gross: g, tax: t, net: nt, closing: rollover ? balance + nt : balance });
    if (rollover) balance += nt;
  }
  if (frac > 1e-9) {
    const g = balance * (r / n) * frac;
    const t = g * taxRate;
    const nt = g - t;
    gross += g; tax += t; net += nt;
    schedule.push({ label: `Periode ${whole + 1} (sebagian)`, rate: r, opening: balance, gross: g, tax: t, net: nt, closing: rollover ? balance + nt : balance });
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
    schedule.push({ label: `Periode ${index + 1}`, rate, gross: g, tax: g * taxRate, net: g * (1 - taxRate) });
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
    schedule.push({ label: `Bulan ${i}`, opening, gross: interestPart, principal: principalPart, payment: monthly, closing: Math.max(0, balance) });
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
    schedule.push({ label: `Bulan ${i}`, opening, gross: interest, principal: principalPart, payment: interest + principalPart, closing: Math.max(0, balance) });
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
    schedule.push({ label: `Bulan ${k}`, opening, gross: interest, principal: principalPart, payment, closing: Math.max(0, balance) });
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
  scheduleLabel.textContent = m === 'floating' ? 'Rate per periode (floating)' : 'Rate per periode (step-up)';
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
    clearResults('Isi pokok, bunga, dan tenor');
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
    clearResults('Tenor pinjaman harus lebih dari 0 bulan');
    return;
  }
  if (m === 'tiered' && !result.schedule.length) {
    clearResults('Isi minimal satu bracket, misalnya 10000000 3');
    return;
  }
  if ((m === 'stepup' || m === 'floating') && !result.schedule.length) {
    clearResults('Isi minimal satu rate per periode, misalnya 6');
    return;
  }

  const netPerDay = result.net / days;
  const productName = PRODUCT_NAMES[product.value] || 'Kustom';
  const rows = [];

  if (result.loan) {
    rows.push(row('Total bunga', money(result.gross)));
    rows.push(row('Total dibayar', money(result.totalPayment)));
    if (result.monthly) rows.push(row('Angsuran per bulan', money(result.monthly), true));
    rows.push(row('Tenor', `${months} bulan`));
  } else {
    rows.push(row('Bunga bruto', money(result.gross)));
    rows.push(row(`Pajak ${pctText(taxRate)}`, `− ${money(result.tax)}`));
    rows.push(row('Bunga net', money(result.net), true));
    rows.push(row('Saldo akhir', money(result.ending)));
    rows.push(row('Net per hari', money(netPerDay)));
    rows.push(row('Net per bulan (30 hari)', money(netPerDay * 30)));
    rows.push(row('Net per tahun', money(netPerDay * cfg.year)));
    if (result.eayGross != null) {
      rows.push(row('EAY bruto', pctText(result.eayGross)));
      rows.push(row('EAY net', pctText(result.eayNet)));
    }
  }

  const lines = [
    `Jenis: ${productName}`,
    `Metode: ${EXPLAIN[m].title}`,
    `Pokok: ${money(P)} · Rate: ${pctText(r)}/tahun · Tenor: ${days} hari · Basis: ${basisInput.value}`,
  ];
  for (const el of rows) lines.push(`${el.querySelector('dt').textContent}: ${el.querySelector('dd').textContent}`);
  summaryText = lines.join('\n');

  summary.replaceChildren(...rows);
  tk.setStatus(status, 'Dihitung', 'ok');

  // Schedule table
  scheduleOut.replaceChildren();
  if (result.schedule.length) {
    const head = result.loan
      ? ['Periode', 'Saldo awal', 'Bunga', 'Pokok', 'Angsuran', 'Sisa']
      : result.tiered
        ? ['Bracket', 'Rate', 'Bunga bruto']
        : ['Periode', 'Saldo awal', 'Bunga bruto', 'Pajak', 'Bunga net', 'Saldo akhir'];
    const shown = result.schedule.slice(0, 80);
    const body = shown.map((s) => (result.loan
      ? [s.label, money(s.opening), money(s.gross), money(s.principal), money(s.payment), money(s.closing)]
      : result.tiered
        ? [s.label, pctText(s.rate), money(s.gross)]
        : [s.label, money(s.opening), money(s.gross), money(s.tax), money(s.net), money(s.closing)]));
    const title = document.createElement('h3');
    title.className = 'tool-group';
    title.textContent = result.loan ? 'Tabel angsuran' : 'Rincian per periode';
    scheduleOut.append(title, table(head, body));
    if (result.schedule.length > shown.length) {
      const note = document.createElement('p');
      note.className = 'tool-note';
      note.textContent = `Menampilkan ${shown.length} dari ${result.schedule.length} periode.`;
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
  formula.textContent = `Dipakai untuk: ${productName}. Pajak ${pctText(taxRate)}, basis ${basisInput.value}.`;
  explain.replaceChildren(title, body, formula);
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
  if (summaryText) tk.copy(summaryText, status, 'Hasil disalin');
});

tk.live([method, principal, rate, tenor, unit, taxInput, basisInput, freq, aro, scheduleInput, tiersInput], render);
