# Indonesian tax calculator: source audit and remaining scope

This is an **experimental partial implementation**, not completion of the
requested all-object, all-historical-period calculator. Tool and guide are
`noindex` while that broader work is unfinished. Do not describe catalogue
coverage as calculation coverage or as a complete national code registry.

## Architecture

- `assets/js/data/indonesian-tax-objects.js`: reference selector snapshot,
  original Indonesian names and explanatory English descriptions. No rates or
  effective dates are inferred from HTML attributes.
- `assets/js/tools/indonesian-tax-rules.js`: pure calculation functions,
  explicit audit windows, source identifiers, and unsupported-scenario handling.
- `assets/js/tools/indonesian-tax-vat-rules.js`: historical and 2025 VAT
  scenario selection, statutory rates, base factors and retail transition.
- `assets/js/tools/indonesian-tax-calculator.js`: DOM adapter only.
- `content/guides/indonesian-tax-calculator.md`: English walkthrough, limitations,
  source links and worked examples.
- `scripts/domtest/indonesian-tax-calculator.mjs`: statutory examples, independent
  golden bracket totals, boundary tests, exact algebraic identities and DOM tests.

All money arithmetic uses `BigInt` integers or reduced rational fractions. Rates
are integer basis points. `Number` is used for bounded object suffixes and rate
labels, never for monetary calculation. PKP is floored to a multiple of IDR 1,000
where Article 17 requires it. VAT/withholding tax-document rounding is **not**
implemented: results and copy reports explicitly say they are before that
rounding. Gross-up is algebraic, not a rounded document/payroll solver.

## Reference snapshot

Downloaded from `https://kalkulator.pajak.go.id/` on **2026-10-14**. The generated
file records the SHA-256 of the downloaded HTML. Counts:

| Selector group | Options |
| --- | ---: |
| PPh 21 | 16 |
| PPh 22 | 39 |
| PPh 23 | 74 |
| Article 4(2) | 57 |
| PPh 15 | 7 |
| Total | 193 |

Preserve anomalies rather than silently correcting them. In particular, the
PPh 22 selector includes `23-100-01` through `23-100-05`, and Article 4(2)
includes `XX` placeholder suffixes and several similar-looking variants. These
are reference-listed options, not independently validated filing codes.

Re-import only after manually reviewing upstream changes:

```sh
curl --fail --location https://kalkulator.pajak.go.id/ --output /tmp/djp-calculator.html
python3 scripts/tax/import-djp-objects.py /tmp/djp-calculator.html --date YYYY-MM-DD
```

This is a developer action, never a build-time or visitor-triggered request.
Do not scrape live rates into the engine. Do not overwrite a historical code
version with a currently displayed name.

## Primary material inspected

Retrieved on **2026-10-14**. Hashes identify the actual files inspected, not a
promise that a live endpoint will always serve identical bytes. PDF text was
extracted with an external temporary research environment; no PDF package was
added to the project or shipped to visitors.

| Source | Relevant provisions / evidence | SHA-256 |
| --- | --- | --- |
| [UU 7/2021 PDF](https://www.pajak.go.id/sites/default/files/2021-12/Salinan%20UU%20Nomor%207%20Tahun%202021.pdf) | Article 17 individual brackets, corporate 22%, PKP flooring; VAT 11% from 2022-04-01; tax-year 2022 commencement | `4e4be3e276bf327e6e9e8a4a031838f572feb4014c2476f6cea0d9a54dd38d5b` |
| [UU 42/2009](https://jdih.kemenkeu.go.id/dok/uu-42-tahun-2009) | Article 7 ordinary VAT 10%, Article II commencement 2010-04-01 | `a8d57e4828e7f59f1a69d7fd45e40d821b9c9610dee809ea7a6dbef7fa53e071` |
| [PMK 141/PMK.03/2015](https://jdih.kemenkeu.go.id/dok/141-pmk-03-2015) | Article 1 standard services 2%, VAT exclusion, documented base exclusions, service list; Article 4 commencement 30 days after promulgation; annex example IDR 20m × 2% = IDR 400k | `cd107a9b7de8ad12b6eff1e3cf64f512b712f63ce58e62b3dba2a35d6ccbf1f4` |
| [DJP PPh 23 page](https://pajak.go.id/id/pph-pasal-23) | Standard 2%/15% rates and 100%-higher no-NPWP rate only. Do not adopt its outdated dividend conditions or filing deadlines | `901eb6b0256b90f2097c3e996aff7a57ddc83f8e9563b3ead789c84e412e7257` |
| [PP 34/2017](https://jdih.kemenkeu.go.id/dok/pp-34-tahun-2017) | Articles 2/4 rental scope and 10% base including related charges; Article 7 starts 2018-01-02; explanation example IDR 200m + 15m | `2f5af8d0c92628fa4f1a0607b41bc20a25cc76b74878dc678b2a24f0f29ddad6` |
| [PP 9/2022](https://jdih.kemenkeu.go.id/dok/pp-9-tahun-2022) | Article 3 seven construction rates; Article II payment-date transition, effective 2022-02-21 | `aeabd03bc870e8328c85b6e3b31218a0560ff939c16457c9fb2deba0699796da` |
| [PMK 131/2024](https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024) | Articles 2–6: statutory 12%, 11/12 ordinary non-luxury base, special-regime exclusions, January final-consumer luxury transition; effective 2025-01-01 | `bd2b45907407c6640a6313500adb87c5a95854d79df3b53c1f5064ace71305cd` |
| [PMK 11/2025](https://jdih.kemenkeu.go.id/dok/pmk-11-tahun-2025) | Article 2 explicitly distinguishes its special bases from Article 3 of PMK 131/2024. Special scenarios are excluded, not assigned ordinary rates | `373a13e091cc697145b6624aa450c3dc60c8594501e900685964584152b35b6c` |
| [PMK 52/2025](https://jdih.kemenkeu.go.id/dok/pmk-52-tahun-2025) | Reviewed amendments concerning gold; gold-specific treatment is not implemented and excluded from ordinary scenarios | `068bf8cf20f74f88158dd7bbf526945be818a9c2f860151c707be2ed9c0b2cc1` |
| [PMK 53/2025](https://jdih.kemenkeu.go.id/dok/pmk-53-tahun-2025) | Article I amends PMK 11 Article 20: insurance commissions, self-building, and deleted provisions; effective 2025-08-01. These special cases remain excluded | `8e01b291898f145c1b87649b9dbf53308a8e3cb75537eb954202c4afde1ebce5` |

Some JDIH `.../view` routes returned fallback HTML despite a successful HTTP
response. Use the linked document routes and inspect the actual downloaded
PDF; HTTP 200 alone is not evidence that the regulation was retrieved.

## Supported calculations

Audit windows are deliberately narrower than regulations' full legal lifetimes.
The income-tax end date **2024-12-31** and selected domestic VAT end date
**2025-12-31** are coverage boundaries, not repeal dates.

- Annual resident Article 17 from **already determined PKP**, 2022–2024;
  reference employee/pension objects only. No gross-to-PKP, monthly TER,
  gross-up, A1/A2 preparation or last-period reconciliation.
- Standard corporate 22% from PKP, 2022–2024. No credits, Article 31E,
  qualifying listed-company reductions, or final turnover regime.
- Ordinary domestic VAT, 2010-04-01 through 2024-12-31. 10% before
  2022-04-01; 11% from that date. Exclude exports, exemptions, special bases
  and facilities. Gross/exclusive and VAT-inclusive inputs.
- Explicit 2025 domestic VAT scenarios: non-luxury goods/services use 12%
  on 11/12 DPP; luxury final-consumer supplies use that adjusted base in
  January and full DPP from February; other taxable domestic luxury supplies
  use full DPP throughout 2025. The non-luxury model excludes special regimes
  under PMK 11/2025 and amendments, exemptions, facilities and imports. All
  three models are VAT-only; PPnBM itself and goods classification remain
  unsupported. Inputs are the unadjusted selling price/reimbursement or that
  price plus VAT only, without separately charged PPnBM. Embedded costs must
  not be deducted from the price. Preserve exact fractional DPP without
  rounding before multiplication; inclusive reversal uses the effective burden.
- PPh 23 standard services `24-104-01` through `65` and standard taxable
  awards, non-land/building asset rental, interest and royalties,
  2016–2024. The 2016 lower limit is intentionally conservative, not the
  effective date of PMK 141/2015. Dividends and service objects 66–69 blocked.
  Inputs are already determined taxable gross bases excluding VAT. No-NPWP
  multiplier and algebraic net-to-gross supported. Reduced royalty bases,
  exemptions, treaties and final-tax transactions excluded.
- Ordinary land/building rental, 2018-01-02 through 2024-12-31; no
  accommodation or build-operate-transfer transition cases.
- PP 9/2022 construction categories, payments from 2022-02-21 through
  2024-12-31; correct certificate/provider selection required; VAT excluded;
  branch-profit tax excluded.

All calculations require explicit confirmation of the standard scenario.
That confirmation is **not** a substitute for implementing eligibility rules:
it limits the current arithmetic-only scope and must not be marketed as an
exemption, certificate, residency or liability determination.

## Work still required for the agreed full scope

1. Establish the earliest historical year from authoritative source availability.
2. Build a versioned official filing-code registry: code, official name,
   effective-from/to, replacement, form/system and original legal source.
   Current snapshot options must not be assigned invented historical dates.
3. Audit PPh 22 by commodity, importer/API status, payer, base, facilities,
   thresholds and period. Audit PPh 15 including treaty/branch cases.
4. Implement remaining final-tax objects: deposits/export proceeds, bonds,
   land transfers, stock sales, lotteries, cooperatives, dividends, participating
   interests, UMKM eligibility/duration/turnover exclusions, IKN and LPI cases.
5. Complete PPh 21 monthly TER tables, daily/non-permanent/non-employee modes,
   final benefits, gross-up, gross-to-PKP and full annual reconciliation,
   including prior rules and transitions. Do not reuse the take-home-pay tool's
   simplified assumptions as authoritative tax law.
6. Implement corporate Article 31E, listed-company eligibility and historical
   standard rates, credits and instalments where the mode promises them.
7. Complete VAT imports, 2026+ rules, special-base/specified-amount regimes,
   facilities and PPnBM goods classification/rates. Selected ordinary domestic
   2025 scenarios are implemented, not comprehensive 2025 VAT coverage.
   Audit subsequent amendments before extending the calendar-year cutoff.
8. Specify tax-document rounding from authoritative rules for each output type;
   test gross-up after rounding when that capability is added.
9. Extend tests with official worked examples and start/end ±1 day fixtures
   for every rule version; have the legal mapping reviewed before presenting
   this as a comprehensive calculator. Remove `noindex` only after deciding
   the release scope explicitly.

No fake zero rates, nearest-year fallback, arbitrary custom-rate option,
production identities, external calculation API or persisted financial inputs.

## Validation

```sh
node scripts/domtest/indonesian-tax-calculator.mjs
hugo --gc --minify
npm run check:ai
```

The dedicated test uses the project's existing esbuild/jsdom dependencies.
No production dependency was added. Browser layout checks are separate from
jsdom's semantic/behaviour tests; jsdom cannot establish responsive layout.

### Validation record (2026-10-14)

- Dedicated calculation/DOM suite: passed, including 500 varied exact-identity
  cases for each of reverse VAT and withholding gross-up, bracket edges,
  commencement days, invalid input and blocked unsupported objects/periods.
- Hugo production build and AI/link validation: passed in an isolated worktree.
- Existing all-tool smoke test: 185 pages, no uncaught errors.
- Chromium headless: tool and guide checked at 320, 375, 768 and 1280 pixels;
  no horizontal page overflow. Tool calculation/blocked-period flows also
  checked in light and dark themes, with no financial-input storage detected.
  Safari and Firefox were not available for this run.
- Full DOM/e2e suite: one unrelated existing search expectation fails: the
  `openssl` query expects RSA Key Pair but ranks TLS Certificate Decoder first.
  The same result was reproduced on the pre-tax baseline commit `9f61cf1`.
  No search ranking change is included in this feature. Both sitemap checks,
  including exclusion of this noindex tool, pass.

### 2025 VAT extension validation (2026-10-14)

- Law-derived fixtures verify the January 1 start, January 31 / February 1
  final-consumer transition, ordinary non-luxury and other luxury supplies,
  exact fractional DPP, reverse VAT, zero and 18-digit inputs, and rejection
  of 2024 dates for new scenarios and all 2026 dates.
- Each of 500 varied amounts also checks exact 2025 reverse-VAT identities
  for both adjusted and full DPP, independently of the production arithmetic.
- DOM tests verify scenario selection, reset of confirmations/stale results
  across the retail transition, statutory-versus-effective rate labels,
  references and copied adjusted-base reports.
- Hugo build, AI/link checks and dedicated tax tests pass. The full DOM/e2e
  command booted 186 tools without uncaught errors; it still fails only the
  existing OpenSSL ranking expectation, so the full suite is not reported green.
- Chromium checks pass for the tool and guide at 320/375/768/1280 pixels in
  light/dark modes, including 2025 reverse VAT and the retail transition.
  No horizontal page overflow or financial-input storage was detected.
