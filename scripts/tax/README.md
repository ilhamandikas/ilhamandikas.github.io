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
| [PMK 131/2024](https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024) | Inspected to establish why the historical VAT model must NOT be extrapolated: Articles 2–5 distinguish luxury goods, adjusted bases, separate special regimes and January 2025 consumer transitions. Not implemented | `bd2b45907407c6640a6313500adb87c5a95854d79df3b53c1f5064ace71305cd` |

Some JDIH `.../view` routes returned fallback HTML despite a successful HTTP
response. Use the linked document routes and inspect the actual downloaded
PDF; HTTP 200 alone is not evidence that the regulation was retrieved.

## Supported calculations

Audit windows are deliberately narrower than regulations' full legal lifetimes.
The common end date **2024-12-31** is a coverage boundary, not a repeal date.

- Annual resident Article 17 from **already determined PKP**, 2022–2024;
  reference employee/pension objects only. No gross-to-PKP, monthly TER,
  gross-up, A1/A2 preparation or last-period reconciliation.
- Standard corporate 22% from PKP, 2022–2024. No credits, Article 31E,
  qualifying listed-company reductions, or final turnover regime.
- Ordinary domestic VAT, 2010-04-01 through 2024-12-31. 10% before
  2022-04-01; 11% from that date. Exclude exports, exemptions, special bases
  and facilities. Gross/exclusive and VAT-inclusive inputs.
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
7. Audit 2025+ VAT and PPnBM goods classification, statutory versus effective
   rates, adjusted bases, retail transition rules, special amounts and subsequent
   amendments. Source inspection of PMK 131/2024 alone is not full coverage.
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
