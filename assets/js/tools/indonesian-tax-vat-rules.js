// Transaction scenarios, not official filing codes. The 2025 audit ends at
// year-end deliberately; extending it requires reviewing subsequent amendments.
export function vatRuleFor(code, date) {
  if (code === 'ordinary') {
    const old = date < '2022-04-01';
    return {
      kind: 'vat', from: old ? '2010-04-01' : '2022-04-01',
      to: old ? '2022-03-31' : '2024-12-31',
      bps: old ? 1000 : 1100, sources: [old ? 'vat2009' : 'hpp'],
      note: 'Ordinary domestic taxable supply through 2024 only; no exemption, export, special tax base or facility. For 2025, choose an explicit 2025 VAT scenario.',
    };
  }
  if (!['non-luxury-2025', 'luxury-retail-2025', 'luxury-other-2025'].includes(code)) return undefined;
  const retail = code === 'luxury-retail-2025';
  const january = date <= '2025-01-31';
  const adjusted = code === 'non-luxury-2025' || (retail && january);
  return {
    kind: 'vat', from: retail && !january ? '2025-02-01' : '2025-01-01',
    to: retail && january ? '2025-01-31' : '2025-12-31',
    bps: 1200, baseNumerator: adjusted ? 11 : 1, baseDenominator: adjusted ? 12 : 1,
    effectiveBps: adjusted ? 1100 : 1200,
    sources: code === 'non-luxury-2025' ? ['vat2025', 'vatSpecial2025'] : ['vat2025'],
    excludesPPnBM: true,
    note: code === 'non-luxury-2025'
      ? '2025 domestic non-luxury taxable goods/services supplied by a VAT-registered seller under PMK 131/2024 Article 3: 12% VAT on an 11/12 adjusted base. Excludes exports, imports, exemptions, facilities and separately regulated special bases or specified amounts (including gold, insurance commissions and self-building). Enter the price/reimbursement before VAT, not an already adjusted DPP.'
      : `2025 domestic taxable supply by a VAT-registered seller of goods legally classified as subject to PPnBM, ${retail ? 'to a final consumer (Article 5)' : 'not to a final consumer (Article 2)'}. ${adjusted ? 'January retail transition: 12% on 11/12 of the selling price.' : '12% on the full selling price.'} Enter the selling price before VAT, without any separately charged PPnBM. Do not deduct embedded costs from the selling price. VAT-only calculation: PPnBM, classification, imports, exemptions and facilities are not determined or calculated. Separately regulated special-base or specified-amount regimes (for example, used-vehicle dealer treatment) are excluded. VAT-inclusive input must contain only price + VAT, without any separately charged PPnBM.`,
  };
}
