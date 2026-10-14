import assert from 'node:assert/strict';
import { calculate, fraction, ruleFor } from '../../assets/js/tools/indonesian-tax-rules.js';

const compute = (code, amount, turnover, year = 2024, options = {}) => calculate({
  group: 'corporate', code, amount: String(amount), turnover: turnover === undefined ? undefined : String(turnover),
  date: `${year}-12-31`, confirmed: true, ...options,
});
const same = (actual, n, d = 1n) => assert.deepEqual(actual, fraction(BigInt(n), BigInt(d)));
const rates = Array.from({ length: 16 }, (_, index) => {
  const year = 2009 + index;
  return [year, year === 2009 ? 2800n : year < 2020 ? 2500n : 2200n];
});
for (const [year, rate] of rates) {
  const standard = compute('standard', '100000999', undefined, year);
  same(standard.tax, 100000000n * rate, 10000n);
  assert.equal(standard.rule.bps, Number(rate));
  assert.equal(standard.rule.available, true);
}
for (const [year, expectedRate] of [[2009, 2800], [2010, 2500], [2019, 2500], [2020, 2200], [2021, 2200], [2022, 2200], [2024, 2200]]) {
  assert.equal(ruleFor('corporate', 'standard', `${year}-01-01`).bps, expectedRate);
  assert.equal(ruleFor('corporate', '31e', `${year}-01-01`).bps, expectedRate);
}
for (const code of ['standard', '31e']) {
  for (const date of ['2008-12-31', '2025-01-01', '2026-12-31']) {
    assert.equal(ruleFor('corporate', code, date).available, false);
    assert.throws(() => compute(code, '1000', '10000', 2024, { date }), /unavailable/);
  }
  assert.throws(() => compute(code, '1000', '10000', 2024, { date: '2024-06-30' }), /31 December/);
  assert.throws(() => compute(code, '1000', '10000', 2024, { mode: 'net' }), /taxable income/);
  assert.throws(() => compute(code, '1000', '10000', 2024, { confirmed: false }), /Confirm/);
}
assert.equal(ruleFor('corporate', 'listed', '2024-12-31').available, false);
assert.equal(ruleFor('corporate', 'unknown', '2024-12-31').available, false);

// Official UU 36/2008 Article 31E explanation, Examples 1 and 2, tax year 2009.
const official1 = compute('31e', '500000000', '4500000000', 2009);
same(official1.corporate.favoured, 500000000n);
same(official1.tax, 70000000n);
const official2 = compute('31e', '3000000000', '30000000000', 2009);
same(official2.corporate.favoured, 480000000n);
same(official2.corporate.ordinary, 2520000000n);
same(official2.corporate.reducedTax, 67200000n);
same(official2.corporate.ordinaryTax, 705600000n);
same(official2.tax, 772800000n);
assert.ok(official2.rule.sources.includes('explanation2008'));

// Same amounts in different years: never reuse the 2009 official rate in 2024.
same(compute('31e', '3000000000', '30000000000', 2010).tax, 690000000n);
same(compute('31e', '3000000000', '30000000000', 2020).tax, 607200000n);
same(compute('31e', '3000000000', '30000000000', 2024).tax, 607200000n);
for (const gross of [1n, 4799999999n, 4800000000n]) {
  const result = compute('31e', 100000999n, gross);
  same(result.corporate.favoured, 100000000n);
  same(result.corporate.ordinary, 0n);
  same(result.tax, 11000000n);
}
const aboveAllocationLimit = compute('31e', 1000000000n, 4800000001n);
same(aboveAllocationLimit.corporate.favoured, 1000000000n * 4800000000n, 4800000001n);
assert.notEqual(aboveAllocationLimit.corporate.favoured.d, 1n);
same(compute('31e', 1000000000n, 50000000000n).tax, 209440000n);
for (const gross of [50000000001n, 999999999999999999n]) {
  const result = compute('31e', 1000000000n, gross);
  same(result.corporate.favoured, 0n);
  same(result.tax, 220000000n);
  assert.match(result.rows.map((r) => r.join(': ')).join('\n'), /Above IDR 50 billion: no Article 31E reduction/);
}
same(compute('31e', '0', '30000000000').tax, 0n);
same(compute('31e', '999', '30000000000').tax, 0n);
same(compute('31e', '999999999999999999', '4800000000').tax, 109999999999999890n);
for (const invalid of [undefined, '', '1,000', '1e9', '-1', '1.5', '1000000000000000000']) {
  assert.throws(() => compute('31e', '100000000', invalid), /Annual Article 31E gross turnover/);
}
assert.throws(() => compute('31e', '0', '0'), /turnover must be positive/);
// An irrelevant hidden turnover must never affect standard-rate mode.
same(compute('standard', '100000000', 'not-a-turnover').tax, 22000000n);

// Independent full-tax-minus-discount identity over all historical rates and
// both thresholds. No monetary Number values or intermediate allocation floor.
for (const [year, rate] of rates) {
  let seed = 670913n;
  for (let i = 0; i < 100; i++) {
    seed = seed * 48271n % 2147483647n;
    const gross = i % 3 === 0 ? seed : i % 3 === 1 ? 4800000000n + seed : 50000000000n + seed;
    const pkpInput = seed * seed / 10n;
    const pkp = pkpInput / 1000n * 1000n;
    const result = compute('31e', pkpInput, gross, year);
    const discountTurnover = gross > 50000000000n ? 0n : gross < 4800000000n ? gross : 4800000000n;
    const expected = fraction(pkp * rate * (2n * gross - discountTurnover), 20000n * gross);
    assert.deepEqual(result.tax, expected);
    const { favoured: f, ordinary: o } = result.corporate;
    assert.equal(f.n * o.d + o.n * f.d, pkp * f.d * o.d);
  }
}
console.log('indonesian-tax-corporate: official 2009 examples, historical rates, threshold edges and 1,600 exact allocation identities passed');
