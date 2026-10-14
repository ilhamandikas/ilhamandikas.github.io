// Calendar-year, ordinary-regime corporate scenarios only. These audit windows
// are not claims that the corresponding laws were repealed at each boundary.
export function corporateRuleFor(code, date) {
  if (!['standard', '31e'].includes(code)) return undefined;
  let period;
  if (date < '2010-01-01') {
    period = { from: '2009-01-01', to: '2009-12-31', bps: 2800, sources: ['income2008'] };
  } else if (date < '2020-01-01') {
    period = { from: '2010-01-01', to: '2019-12-31', bps: 2500, sources: ['income2008'] };
  } else if (date < '2022-01-01') {
    period = { from: '2020-01-01', to: '2021-12-31', bps: 2200, sources: ['covid2020'] };
  } else {
    period = { from: '2022-01-01', to: '2024-12-31', bps: 2200, sources: ['hpp'] };
  }
  const article31E = code === '31e';
  return {
    ...period, kind: 'corporate', article31E,
    sources: article31E ? [...new Set([...period.sources, 'income2008', 'explanation2008'])] : period.sources,
    note: article31E
      ? 'Article 31E for domestic resident companies under the ordinary non-final income-tax regime. Enter already determined PKP and the annual gross turnover legally determined for Article 31E, not taxable profit. At turnover up to IDR 50 billion, 50% of the standard rate applies to PKP attributable to the first IDR 4.8 billion of turnover. Above IDR 50 billion there is no Article 31E reduction. No listed-company reduction, permanent establishment, final-turnover regime, credits or other facility. The tool does not determine residency, turnover composition or eligibility for other regimes.'
      : 'Standard corporate income tax on already determined PKP, before credits or instalments. No Article 31E, listed-company reduction, final-turnover regime or other facility. Calendar tax years only.',
  };
}
