// Deliberately bounded audit windows, not claims about when a law was repealed.
// See scripts/tax/README.md before extending any window or object mapping.
import { vatRuleFor } from './indonesian-tax-vat-rules.js';

export const AUDIT_END = '2024-12-31';
export const SOURCES = {
  hpp: { name: 'UU 7/2021, Article 17 and commencement provisions', url: 'https://www.pajak.go.id/sites/default/files/2021-12/Salinan%20UU%20Nomor%207%20Tahun%202021.pdf' },
  vat2009: { name: 'UU 42/2009, Article 7 and Article II', url: 'https://jdih.kemenkeu.go.id/dok/uu-42-tahun-2009' },
  vat2025: { name: 'PMK 131/2024, Articles 2–6: 2025 VAT bases and retail transition', url: 'https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024' },
  vatSpecial2025: { name: 'PMK 11/2025, Article 2: separately regulated special-base scope (excluded)', url: 'https://jdih.kemenkeu.go.id/dok/pmk-11-tahun-2025' },
  services: { name: 'PMK 141/PMK.03/2015, Articles 1–4', url: 'https://jdih.kemenkeu.go.id/dok/141-pmk-03-2015' },
  article23: { name: 'DJP: PPh Article 23 rate table (rates only; not its outdated dividend or filing guidance)', url: 'https://pajak.go.id/id/pph-pasal-23' },
  construction: { name: 'PP 9/2022, Article 3 and Article II', url: 'https://jdih.kemenkeu.go.id/dok/pp-9-tahun-2022' },
  rent: { name: 'PP 34/2017, Articles 2, 4 and 7', url: 'https://jdih.kemenkeu.go.id/dok/pp-34-tahun-2017' },
};

export const CATEGORIES = [
  ['pph21', 'PPh 21 — Employment & individual income'],
  ['pph22', 'PPh 22 — Imports & certain transactions'],
  ['pph23', 'PPh 23 — Withholding tax'],
  ['final', 'Final income tax — Article 4(2)'],
  ['pph15', 'PPh 15 — Certain business activities'],
  ['corporate', 'Corporate income tax'],
  ['vat', 'VAT — PPN'],
  ['luxury', 'Luxury goods sales tax — PPnBM'],
];

export const EXTRA_OBJECTS = [
  { group: 'corporate', code: 'standard', name: 'Standard Article 17 corporate rate, without facilities', officialName: 'Tarif Pasal 17 ayat (1) huruf b' },
  { group: 'corporate', code: '31e', name: 'Article 31E turnover facility — not yet supported', officialName: 'Pasal 31E ayat (1)' },
  { group: 'corporate', code: 'listed', name: 'Qualifying listed-company rate — not yet supported', officialName: 'Pasal 17 ayat (2b)' },
  { group: 'vat', code: 'ordinary', name: 'Historical domestic VAT — ordinary base, through 2024', officialName: 'Penyerahan dalam negeri dengan DPP biasa sampai 2024' },
  { group: 'vat', code: 'non-luxury-2025', name: '2025 domestic non-luxury goods or services — 11/12 base', officialName: 'Penyerahan BKP selain barang mewah atau JKP — Pasal 3 PMK 131/2024' },
  { group: 'vat', code: 'luxury-retail-2025', name: '2025 domestic luxury goods — final-consumer supply', officialName: 'Penyerahan BKP mewah kepada konsumen akhir — Pasal 5 PMK 131/2024' },
  { group: 'vat', code: 'luxury-other-2025', name: '2025 domestic luxury goods — not a final-consumer supply', officialName: 'Penyerahan BKP mewah selain kepada konsumen akhir — Pasal 2 PMK 131/2024' },
  { group: 'luxury', code: 'classification', name: 'PPnBM requires a verified goods classification and period', officialName: 'Pajak Penjualan atas Barang Mewah' },
];

const CONSTRUCTION_RATES = [175, 400, 265, 265, 400, 350, 600, 175, 400, 265, 265, 400, 350, 600];
const bounds = (from, source, extra) => ({ from, to: AUDIT_END, sources: [source], ...extra });

export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function ruleFor(group, code, date) {
  if (!validDate(date)) return { available: false, reason: 'Enter a real transaction date in YYYY-MM-DD format.' };
  let rule;
  if (group === 'vat') {
    rule = vatRuleFor(code, date);
  } else if (group === 'pph21' && ['21-100-01', '21-100-02'].includes(code)) {
    rule = bounds('2022-01-01', 'hpp', {
      kind: 'progressive', note: 'Annual resident Article 17 tax from already determined PKP only. Not monthly TER, gross-up, an A1/A2 form, or last-period reconciliation.',
    });
  } else if (group === 'corporate' && code === 'standard') {
    rule = bounds('2022-01-01', 'hpp', {
      kind: 'corporate', bps: 2200, note: 'Standard corporate income tax on PKP, before credits or instalments. No Article 31E, listed-company reduction, final turnover tax or other facility.',
    });
  } else if (group === 'pph23') {
    const service = /^24-104-(\d{2})$/.exec(code);
    if (service && Number(service[1]) >= 1 && Number(service[1]) <= 65) {
      rule = bounds('2016-01-01', 'services', {
        kind: 'withholding', bps: 200, sources: ['services', 'article23'], note: 'Standard Article 23 service withholding. Enter the legally determined taxable gross base excluding VAT and any documented exclusions. No Article 21, final-tax or exempt transaction.',
      });
    } else if (['24-100-01', '24-100-02', '24-102-01', '24-103-01'].includes(code)) {
      rule = bounds('2016-01-01', 'article23', {
        kind: 'withholding', bps: code === '24-100-02' ? 200 : 1500,
        note: 'Standard taxable Article 23 income only. No exemptions, finance-lease exception, final tax, treaty or reduced royalty base. Enter the legally determined taxable gross base, excluding VAT.',
      });
    }
  } else if (group === 'final' && ['28-403-01', '28-403-02'].includes(code)) {
    rule = bounds('2018-01-02', 'rent', {
      kind: 'withholding', bps: 1000, note: 'Ordinary land/building rental, including related service, maintenance, security and other rental charges. No accommodation services or build-operate-transfer transition case.',
    });
  } else if (group === 'final') {
    const construction = /^28-409-(\d{2})$/.exec(code);
    const index = construction ? Number(construction[1]) - 15 : -1;
    if (index >= 0 && index < CONSTRUCTION_RATES.length) {
      rule = bounds('2022-02-21', 'construction', {
        kind: 'withholding', bps: CONSTRUCTION_RATES[index],
        note: 'Construction payment excluding VAT, with the provider type and certificate status exactly as selected. Payment date controls the PP 9/2022 transition, including older contracts. Excludes branch-profit tax.',
      });
    }
  }
  if (!rule) return { available: false, reason: 'Reference only. No audited calculation is available for this object or scenario. No rate has been inferred from the reference website.' };
  if (date < rule.from || date > rule.to) return {
    ...rule, available: false,
    reason: `Calculation unavailable for this period. This scenario is audited only from ${rule.from} to ${rule.to}; these are coverage limits, not necessarily the law’s full effective dates.`,
  };
  return { ...rule, available: true };
}

const SCALE = 10000n;
const MAX_AMOUNT = 999999999999999999n;

export function parseRupiah(value, label = 'Amount') {
  if (typeof value !== 'string' || !/^\d{1,18}$/.test(value.trim())) {
    throw new Error(`${label}: enter a non-negative whole-rupiah amount, using digits only (up to 18 digits). Do not use separators, decimals or exponent notation.`);
  }
  const n = BigInt(value.trim());
  if (n > MAX_AMOUNT) throw new Error(`${label} is too large.`);
  return n;
}

function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

export function fraction(n, d = 1n) {
  if (d <= 0n) throw new Error('A fraction must have a positive denominator.');
  const common = gcd(n < 0n ? -n : n, d);
  return { n: n / common, d: d / common };
}
const multiply = (x, n, d = 1n) => fraction(x.n * n, x.d * d);
const subtract = (a, b) => fraction(a.n * b.d - b.n * a.d, a.d * b.d);
const add = (a, b) => fraction(a.n * b.d + b.n * a.d, a.d * b.d);
export const rateText = (bps) => `${(bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`;

// Display terminating decimals exactly. Recurring decimals remain an exact
// mixed fraction, not a rounded number that could be mistaken for filing tax.
export function exactMoney(value) {
  const { n, d } = typeof value === 'bigint' ? fraction(value) : value;
  const sign = n < 0n ? '-' : '';
  const abs = n < 0n ? -n : n;
  const whole = abs / d;
  let remainder = abs % d;
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!remainder) return `${sign}IDR ${grouped}`;
  let decimal = '';
  for (let i = 0; i < 12 && remainder; i += 1) {
    remainder *= 10n;
    decimal += String(remainder / d);
    remainder %= d;
  }
  if (!remainder) return `${sign}IDR ${grouped}.${decimal}`;
  const part = fraction(abs % d, d);
  return `${sign}IDR ${grouped} + ${part.n}/${part.d} rupiah`;
}

const BRACKETS = [[60000000n, 500], [250000000n, 1500], [500000000n, 2500], [5000000000n, 3000], [null, 3500]];

export function calculate({ group, code, date, amount, mode = 'gross', registered = true, confirmed = false }) {
  const rule = ruleFor(group, code, date);
  if (!rule.available) throw new Error(rule.reason);
  if (confirmed !== true) throw new Error('Confirm that the selected standard-tax scenario applies. Exemptions and special facilities are not determined by this calculator.');
  if (['pph21', 'corporate'].includes(group) && !date.endsWith('-12-31')) {
    throw new Error('For this annual calculation, use 31 December of the tax year. Short or non-calendar tax years are not supported.');
  }
  const input = parseRupiah(amount);
  const result = { rule, rows: [], tax: fraction(0n) };
  const row = (label, value) => result.rows.push([label, value]);
  if (rule.kind === 'progressive' || rule.kind === 'corporate') {
    if (mode !== 'gross') throw new Error('This scenario accepts taxable income (PKP), not a net or VAT-inclusive amount.');
    const pkp = input / 1000n * 1000n;
    row('Taxable income entered (PKP)', exactMoney(input));
    row('PKP rounded down to whole IDR 1,000', exactMoney(pkp));
    if (rule.kind === 'corporate') {
      result.tax = multiply(fraction(pkp), BigInt(rule.bps), SCALE);
      row('Standard corporate rate', rateText(rule.bps));
    } else {
      let floor = 0n;
      for (const [ceiling, rate] of BRACKETS) {
        if (pkp <= floor) break;
        const slice = (ceiling === null || pkp < ceiling ? pkp : ceiling) - floor;
        const tax = multiply(fraction(slice), BigInt(rate), SCALE);
        result.tax = add(result.tax, tax);
        row(`${exactMoney(slice)} × ${rateText(rate)}`, exactMoney(tax));
        floor = ceiling;
      }
    }
    row('Tax before credits / previous withholding', exactMoney(result.tax));
  } else if (rule.kind === 'vat') {
    if (!['gross', 'inclusive'].includes(mode)) throw new Error('Choose a VAT-exclusive or VAT-inclusive amount.');
    const numerator = BigInt(rule.baseNumerator ?? 1);
    const denominator = BigInt(rule.baseDenominator ?? 1);
    const rate = BigInt(rule.bps);
    const supply = mode === 'inclusive'
      ? fraction(input * SCALE * denominator, SCALE * denominator + rate * numerator)
      : fraction(input);
    const base = multiply(supply, numerator, denominator);
    result.tax = multiply(base, rate, SCALE);
    const total = add(supply, result.tax);
    result.vat = { supply, base, total };
    row(rule.excludesPPnBM ? 'Price / reimbursement before VAT (no separate PPnBM charge)' : 'Price / reimbursement before VAT', exactMoney(supply));
    if (rule.baseNumerator !== undefined) row('DPP adjustment', `${numerator}/${denominator} of the VAT-exclusive price`);
    row('Tax base (DPP)', exactMoney(base));
    row('Statutory VAT rate on DPP', rateText(rule.bps));
    if (rule.effectiveBps !== undefined) row('Effective VAT relative to the price before VAT', rateText(rule.effectiveBps));
    row('VAT before tax-document rounding', exactMoney(result.tax));
    row(rule.excludesPPnBM ? 'Price + VAT only (no separate PPnBM charge)' : 'Total including VAT', exactMoney(total));
  } else {
    if (!['gross', 'net'].includes(mode)) throw new Error('Choose a taxable gross base or a net-after-withholding amount.');
    if (group === 'pph23' && typeof registered !== 'boolean') throw new Error('Select the recipient’s tax registration status.');
    const bps = rule.bps * (group === 'pph23' && !registered ? 2 : 1);
    const base = mode === 'net' ? fraction(input * SCALE, SCALE - BigInt(bps)) : fraction(input);
    result.tax = multiply(base, BigInt(bps), SCALE);
    row('Taxable gross base (excluding VAT)', exactMoney(base));
    row('Withholding rate', `${rateText(bps)}${group === 'pph23' && !registered ? ' (100% higher: no NPWP)' : ''}`);
    row('Withholding before tax-document rounding', exactMoney(result.tax));
    row('Net after withholding (excluding VAT)', exactMoney(subtract(base, result.tax)));
  }
  return result;
}
