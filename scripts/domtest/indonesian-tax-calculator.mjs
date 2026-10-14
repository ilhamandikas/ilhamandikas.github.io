import './indonesian-tax-corporate.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';
import snapshot from '../../assets/js/data/indonesian-tax-objects.js';
import { calculate, exactMoney, fraction, ruleFor, parseRupiah, validDate } from '../../assets/js/tools/indonesian-tax-rules.js';

const same = (actual, n, d = 1n) => assert.deepEqual(actual, fraction(BigInt(n), BigInt(d)));
const run = (group, code, amount, options = {}) => calculate({ group, code, amount: String(amount), date: '2024-12-31', confirmed: true, ...options });
const blocked = (group, code, date) => {
  assert.equal(ruleFor(group, code, date).available, false);
  assert.throws(() => run(group, code, '10000000', { date }), /unavailable|Reference only|real transaction date/);
};

assert.equal(snapshot.objects.length, 193);
assert.equal(new Set(snapshot.objects.map((o) => `${o.group}:${o.code}`)).size, 193);
for (const obj of snapshot.objects) assert.ok(obj.name && obj.officialName && obj.code);
assert.deepEqual(Object.fromEntries(['pph21', 'pph22', 'pph23', 'final', 'pph15'].map((g) => [g, snapshot.objects.filter((o) => o.group === g).length])), { pph21: 16, pph22: 39, pph23: 74, final: 57, pph15: 7 });
assert.equal(snapshot.objects.find((o) => o.code === '24-104-25').name, 'Website development and management');
assert.equal(snapshot.objects.find((o) => o.code === '24-104-65').name, 'Other services paid from state or regional budgets');
assert.equal(snapshot.objects.find((o) => o.code === '28-409-28').name, 'Construction consultancy: uncertified provider');
for (const bad of ['', ' ', '-1', '+1', '1.00', '1,000', '1e6', 'NaN', 'Infinity', '1000000000000000000', '<script>', '١٠']) assert.throws(() => parseRupiah(bad));
assert.equal(parseRupiah(' 1000 '), 1000n);
assert.equal(parseRupiah('0'), 0n);
assert.equal(parseRupiah('999999999999999999'), 999999999999999999n);
for (const date of ['2023-02-29', '2024-02-30', '2024-13-01', '', '2024-1-01', '2024-01-01junk']) assert.equal(validDate(date), false);
assert.equal(validDate('2024-02-29'), true);

// Golden statutory bracket totals, independently written rather than calculated
// by the production bracket loop. PKP flooring is checked around every edge.
for (const [amount, expected] of [
  [0n, 0n], [999n, 0n], [1000n, 50n],
  [60000000n, 3000000n], [250000000n, 31500000n],
  [500000000n, 94000000n], [5000000000n, 1444000000n],
  [5000001000n, 1444000350n], [120000999n, 12000000n],
]) same(run('pph21', '21-100-01', amount).tax, expected);
const edges = [[60000000n, 500n, 1500n, 3000000n], [250000000n, 1500n, 2500n, 31500000n], [500000000n, 2500n, 3000n, 94000000n], [5000000000n, 3000n, 3500n, 1444000000n]];
for (const [edge, belowRate, aboveRate, total] of edges) {
  same(run('pph21', '21-100-01', edge - 1n).tax, total - belowRate / 10n);
  same(run('pph21', '21-100-01', edge + 999n).tax, total);
  same(run('pph21', '21-100-01', edge + 1000n).tax, total + aboveRate / 10n);
}
blocked('pph21', '21-100-01', '2021-12-31');
assert.equal(ruleFor('pph21', '21-100-01', '2022-01-01').available, true);
assert.throws(() => run('pph21', '21-100-01', '1000', { date: '2024-06-30' }), /31 December/);
same(run('corporate', 'standard', '100000999').tax, 22000000n);
same(run('corporate', 'standard', '999999999999999999').tax, 219999999999999780n);
assert.equal(ruleFor('corporate', '31e', '2024-12-31').available, true);
blocked('corporate', 'listed', '2024-12-31');
assert.equal(ruleFor('corporate', 'standard', '2021-12-31').available, true);

// VAT statutory commencement and one-day rate change, plus guide examples.
blocked('vat', 'ordinary', '2010-03-31');
same(run('vat', 'ordinary', '10000000', { date: '2010-04-01' }).tax, 1000000n);
same(run('vat', 'ordinary', '10000000', { date: '2022-03-31' }).tax, 1000000n);
same(run('vat', 'ordinary', '10000000', { date: '2022-04-01' }).tax, 1100000n);
same(run('vat', 'ordinary', '11100000', { mode: 'inclusive', date: '2022-04-01' }).tax, 1100000n);
same(run('vat', 'ordinary', '1', { mode: 'inclusive' }).tax, 11n, 111n);
assert.equal(exactMoney(fraction(11n, 111n)), 'IDR 0 + 11/111 rupiah');

// PMK 131/2024 Articles 2/3/5: keep statutory rate, DPP and
// transaction price separate. These are law-derived fixtures, not claimed
// official worked examples. PPnBM is deliberately absent from these totals.
const vat2025 = ['non-luxury-2025', 'luxury-retail-2025', 'luxury-other-2025'];
for (const code of vat2025) {
  blocked('vat', code, '2024-12-31');
  blocked('vat', code, '2026-01-01');
  assert.equal(ruleFor('vat', code, '2025-01-01').available, true);
  assert.equal(ruleFor('vat', code, '2025-12-31').available, true);
}
for (const date of ['2025-01-01', '2025-01-31', '2025-02-01', '2025-02-04', '2025-08-01', '2025-12-31']) {
  const ordinary = run('vat', 'non-luxury-2025', '12000000', { date });
  same(ordinary.vat.supply, 12000000n);
  same(ordinary.vat.base, 11000000n);
  same(ordinary.tax, 1320000n);
  same(ordinary.vat.total, 13320000n);
  assert.equal(ordinary.rule.bps, 1200);
  assert.equal(ordinary.rule.effectiveBps, 1100);
  const reverse = run('vat', 'non-luxury-2025', '13320000', { date, mode: 'inclusive' });
  assert.deepEqual(reverse.vat, ordinary.vat);
  same(reverse.tax, 1320000n);
  same(run('vat', 'luxury-other-2025', '12000000', { date }).tax, 1440000n);
}
for (const date of ['2025-01-01', '2025-01-31']) {
  const retail = run('vat', 'luxury-retail-2025', '12000000', { date });
  same(retail.vat.base, 11000000n);
  same(retail.tax, 1320000n);
  assert.equal(retail.rule.from, '2025-01-01');
  assert.equal(retail.rule.to, '2025-01-31');
}
for (const date of ['2025-02-01', '2025-12-31']) {
  const retail = run('vat', 'luxury-retail-2025', '12000000', { date });
  same(retail.vat.base, 12000000n);
  same(retail.tax, 1440000n);
  same(retail.vat.total, 13440000n);
  assert.equal(retail.rule.from, '2025-02-01');
  assert.equal(retail.rule.to, '2025-12-31');
  const reverse = run('vat', 'luxury-retail-2025', '13440000', { date, mode: 'inclusive' });
  assert.deepEqual(reverse.vat, retail.vat);
}
const oneRupiah = run('vat', 'non-luxury-2025', '1', { date: '2025-01-01' });
same(oneRupiah.vat.base, 11n, 12n);
same(oneRupiah.tax, 11n, 100n);
same(oneRupiah.vat.total, 111n, 100n);
same(run('vat', 'luxury-other-2025', '1', { date: '2025-01-01', mode: 'inclusive' }).tax, 3n, 28n);
same(run('vat', 'non-luxury-2025', '999999999999999999', { date: '2025-12-31' }).tax, 10999999999999999989n, 100n);
same(run('vat', 'non-luxury-2025', '0', { date: '2025-01-01' }).tax, 0n);
blocked('vat', 'unknown-2025', '2025-01-01');
assert.throws(() => run('vat', 'non-luxury-2025', '100', { date: '2025-01-01', mode: 'net' }), /VAT-exclusive/);

// PMK 141/2015 annex, first worked example: taxable base 20m × 2% = 400k.
same(run('pph23', '24-104-25', '20000000').tax, 400000n);
same(run('pph23', '24-104-25', '10000000').tax, 200000n);
same(run('pph23', '24-104-25', '9800000', { mode: 'net' }).tax, 200000n);
same(run('pph23', '24-104-25', '10000000', { registered: false }).tax, 400000n);
same(run('pph23', '24-104-25', '1', { mode: 'net' }).tax, 1n, 49n);
assert.equal(exactMoney(run('pph23', '24-104-25', '1').tax), 'IDR 0.02');
same(run('pph23', '24-103-01', '10000000').tax, 1500000n);
same(run('pph23', '24-103-01', '10000000', { registered: false }).tax, 3000000n);
for (let i = 1; i <= 65; i++) same(run('pph23', `24-104-${String(i).padStart(2, '0')}`, '10000000').tax, 200000n);
for (const code of ['24-101-01', '24-104-00', '24-104-66', '24-104-69']) blocked('pph23', code, '2024-12-31');
blocked('pph23', '24-104-25', '2015-12-31');
assert.equal(ruleFor('pph23', '24-104-25', '2016-01-01').available, true);

// PP 34/2017 explanation: rent 200m + related maintenance/security 15m.
same(run('final', '28-403-01', '215000000').tax, 21500000n);
blocked('final', '28-403-01', '2018-01-01');
same(run('final', '28-403-01', '10000000', { date: '2018-01-02' }).tax, 1000000n);
const constructionRates = [175n, 400n, 265n, 265n, 400n, 350n, 600n, 175n, 400n, 265n, 265n, 400n, 350n, 600n];
for (let i = 0; i < constructionRates.length; i++) {
  const code = `28-409-${i + 15}`;
  same(run('final', code, '10000000', { date: '2022-02-21' }).tax, 1000n * constructionRates[i]);
  blocked('final', code, '2022-02-20');
}
for (const obj of snapshot.objects) blocked(obj.group, obj.code, '2025-01-01');
for (const [group, code] of [['vat', 'ordinary'], ['corporate', 'standard'], ['pph22', '22-100-04'], ['pph15', '28-410-01'], ['luxury', 'classification']]) blocked(group, code, '2026-10-14');
for (const group of ['pph22', 'pph15']) for (const obj of snapshot.objects.filter((o) => o.group === group)) blocked(group, obj.code, '2024-12-31');
assert.throws(() => run('vat', 'ordinary', '1000', { confirmed: false }), /Confirm/);
assert.throws(() => run('pph21', '21-100-01', '1000', { mode: 'net' }), /taxable income/);
assert.throws(() => run('vat', 'ordinary', '1000', { mode: 'net' }), /VAT-exclusive/);
assert.throws(() => run('pph23', '24-104-25', '1000', { registered: 'false' }), /registration/);

// Exact algebraic identities over varied whole-rupiah amounts, including
// amounts well beyond Number.MAX_SAFE_INTEGER. No floating-point oracle.
let seed = 789123n;
for (let i = 0; i < 500; i++) {
  seed = (seed * 48271n) % 2147483647n;
  const amount = seed * seed / 10n;
  const vat = run('vat', 'ordinary', amount, { mode: 'inclusive' }).tax;
  assert.equal(vat.n * 111n, amount * 11n * vat.d);
  const grossup = run('pph23', '24-104-25', amount, { mode: 'net' }).tax;
  assert.equal(grossup.n * 49n, amount * grossup.d);
  const adjusted = run('vat', 'non-luxury-2025', amount, { date: '2025-06-30', mode: 'inclusive' });
  assert.equal(adjusted.tax.n * 111n, amount * 11n * adjusted.tax.d);
  assert.equal(adjusted.vat.base.n * 12n * adjusted.vat.supply.d, adjusted.vat.supply.n * 11n * adjusted.vat.base.d);
  const full = run('vat', 'luxury-retail-2025', amount, { date: '2025-02-01', mode: 'inclusive' });
  assert.equal(full.tax.n * 28n, amount * 3n * full.tax.d);
}

const html = readFileSync(new URL('../../layouts/partials/tools/body/indonesian-tax-calculator.html', import.meta.url), 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push(e.message));
const dom = new JSDOM(html, { url: 'https://ilham.dev/tools/indonesian-tax-calculator/', runScripts: 'outside-only', virtualConsole: vc });
const { window } = dom;
const { document } = window;
const $ = (id) => document.getElementById(`itc-${id}`);
let copied = '';
let uploads = 0;
window.fetch = () => { uploads++; throw new Error('Unexpected network request'); };
window.Storage.prototype.setItem = () => { throw new Error('Inputs must not be stored'); };
Object.defineProperty(window.navigator, 'clipboard', { value: { async writeText(text) { copied = text; } } });
const bundled = await build({ entryPoints: [fileURLToPath(new URL('../../assets/js/tools/indonesian-tax-calculator.js', import.meta.url))], bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2020' });
window.eval(bundled.outputFiles[0].text);
const fire = (id, event = 'change') => $(id).dispatchEvent(new window.Event(event, { bubbles: true }));
const submit = () => $('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
const choose = (group, code) => { $('category').value = group; fire('category'); $('object').value = code; fire('object'); };
const confirm = () => { $('confirm').checked = true; fire('confirm'); };
assert.equal($('category').value, 'vat');
assert.equal($('result').hidden, true);
$('amount').value = '10000000';
confirm(); submit();
assert.equal($('tax').textContent, 'IDR 1,100,000');
assert.equal($('result').hidden, false);
assert.ok($('sources').querySelector('a').href.includes('pajak.go.id'));
$('copy').click();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.match(copied, /2024-12-31/);
assert.match(copied, /Filing-code validity|filing-code validity/);
assert.match(copied, /before tax-document rounding/);
$('amount').value = '1e7'; fire('amount', 'input');
assert.equal($('result').hidden, true);
assert.equal($('copy').disabled, true);
confirm(); submit();
assert.match($('status').textContent, /digits only/);
assert.equal($('amount').value, '1e7');
$('date').value = '2025-01-01'; fire('date');
assert.equal($('calculate').disabled, true);
assert.match($('availability').textContent, /unavailable/);
confirm(); submit();
assert.equal($('result').hidden, true);
$('date').value = '2024-12-31'; fire('date');
choose('pph23', '24-104-25');
assert.equal($('object').options.length, 74);
$('search').value = 'website'; fire('search', 'input');
assert.equal($('object').options.length, 1);
assert.equal($('object').value, '24-104-25');
$('search').value = 'Pembuatan'; fire('search', 'input');
assert.ok($('object').options.length >= 1);
$('search').value = '<img src=x onerror=alert(1)>'; fire('search', 'input');
assert.equal($('object').options.length, 0);
assert.equal($('calculate').disabled, true);
assert.equal(document.querySelector('img'), null);
$('search').value = ''; fire('search', 'input');
$('object').value = '24-104-25'; fire('object');
$('amount').value = '9800000'; $('mode').value = 'net'; confirm(); submit();
assert.equal($('tax').textContent, 'IDR 200,000');
$('registration').value = 'unregistered'; fire('registration');
assert.equal($('result').hidden, true);
choose('pph21', '21-100-01');
$('date').value = '2024-06-30'; fire('date');
$('amount').value = '120000999'; confirm(); submit();
assert.match($('status').textContent, /31 December/);
$('date').value = '2024-12-31'; fire('date'); confirm(); submit();
assert.equal($('tax').textContent, 'IDR 12,000,000');
assert.match($('rows').textContent, /120,000,000/);
choose('pph22', '22-100-04');
assert.equal($('object').options.length, 39);
assert.equal($('calculate').disabled, true);
assert.match($('availability').textContent, /Reference only/);
$('reset').click();
assert.equal($('category').value, 'vat');
assert.equal($('amount').value, '');
assert.equal($('confirm').checked, false);
assert.equal($('result').hidden, true);
assert.equal($('copy').disabled, true);
choose('vat', 'non-luxury-2025');
assert.equal($('object').options.length, 4);
assert.equal($('calculate').disabled, true);
$('date').value = '2025-01-31'; fire('date');
$('amount').value = '13320000'; $('mode').value = 'inclusive'; confirm(); submit();
assert.equal($('tax').textContent, 'IDR 1,320,000');
assert.match($('rows').textContent, /11\/12/);
assert.match($('rows').textContent, /Statutory VAT rate on DPP12%/);
assert.match($('rows').textContent, /Effective VAT relative to the price before VAT11%/);
assert.equal($('sources').querySelectorAll('a').length, 2);
$('copy').click();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.match(copied, /DPP adjustment: 11\/12/);
assert.match(copied, /pmk-131-tahun-2024/);
choose('vat', 'luxury-retail-2025');
$('mode').value = 'gross'; $('amount').value = '12000000'; confirm(); submit();
assert.equal($('tax').textContent, 'IDR 1,320,000');
$('date').value = '2025-02-01'; fire('date');
assert.equal($('confirm').checked, false);
assert.equal($('result').hidden, true);
confirm(); submit();
assert.equal($('tax').textContent, 'IDR 1,440,000');
assert.match($('rows').textContent, /no separate PPnBM charge/);
$('date').value = '2026-01-01'; fire('date');
assert.equal($('calculate').disabled, true);
assert.equal($('result').hidden, true);
assert.equal($('copy').disabled, true);
choose('corporate', '31e');
$('date').value = '2024-12-31'; fire('date');
assert.equal($('turnover-field').hidden, false);
$('amount').value = '3000000000'; $('turnover').value = '30000000000'; confirm(); submit();
assert.equal($('tax').textContent, 'IDR 607,200,000');
assert.match($('rows').textContent, /480,000,000/);
$('copy').click(); await new Promise((resolve) => setTimeout(resolve, 0));
assert.match(copied, /Annual Article 31E gross turnover: IDR 30,000,000,000/);
assert.match(copied, /36TAHUN2008UUPenj/);
$('turnover').value = '50000000001'; fire('turnover', 'input');
assert.equal($('result').hidden, true);
assert.equal($('copy').disabled, true);
confirm(); submit();
assert.equal($('tax').textContent, 'IDR 660,000,000');
assert.match($('rows').textContent, /no Article 31E reduction/);
$('turnover').value = '0'; fire('turnover', 'input'); confirm(); submit();
assert.match($('status').textContent, /turnover must be positive/);
assert.equal($('turnover').value, '0');
assert.equal($('amount').value, '3000000000');
$('date').value = '2009-12-31'; fire('date');
$('turnover').value = '30000000000'; confirm(); submit();
assert.equal($('tax').textContent, 'IDR 772,800,000');
choose('corporate', 'standard');
assert.equal($('turnover-field').hidden, true);
confirm(); submit();
assert.equal($('tax').textContent, 'IDR 840,000,000');
$('reset').click();
assert.equal($('turnover').value, '');
assert.equal($('turnover-field').hidden, true);
assert.equal(document.querySelectorAll('input:not([data-no-memory]), select:not([data-no-memory]), textarea:not([data-no-memory])').length, 0);
for (const input of document.querySelectorAll('input, select')) assert.ok(input.closest('label'), `Missing label: ${input.id}`);
assert.equal(window.location.search, '');
assert.equal(uploads, 0);
assert.deepEqual(errors, []);
window.close();
console.log('indonesian-tax-calculator: statutory fixtures, boundaries, exact arithmetic, unsupported scenarios and DOM tests passed');
