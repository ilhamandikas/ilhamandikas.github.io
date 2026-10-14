# Corporate rule register

Reviewed on 2026-10-14. This records the additional legal mappings and calculation
boundaries introduced for corporate tax. It is not a claim of complete corporate
tax coverage. Source-file hashes are maintained in [README.md](README.md).

## Scope and periods

| Rule | Tax years covered | Source |
| --- | --- | --- |
| Standard rate 28% | 2009 | UU 36/2008 Article 17(1)(b), commencement 2009-01-01 |
| Standard rate 25% | 2010–2019 | UU 36/2008 Article 17(2a), tax-year 2010 commencement |
| Standard rate 22% | 2020–2021 | UU 2/2020 annex, Article 5(1)(a) |
| Standard rate 22% | 2022–2024 | UU 7/2021 Article 17(1)(b), tax-year 2022 commencement |
| Article 31E allocation and 50% rate reduction | 2009–2024 | UU 36/2008 Article 31E and its official explanation; combine with the standard rate for the actual tax year |

**Superseded future rate:** the planned 20% from 2022 in UU 2/2020 is not
implemented. UU 7/2021 establishes 22% from tax year 2022. Tests explicitly check
2021/2022 so a future change cannot accidentally resurrect the planned rate.

Only complete calendar tax years are supported: the calculator requires a
31 December date for both corporate modes. Dates before 2009 or after 2024,
short periods and non-calendar years are blocked. The upper bound is an audit
limit, not a statement that these rules stopped applying after 2024.

## Article 31E arithmetic

Inputs:

- Already established annual PKP, in whole rupiah.
- Positive annual gross turnover legally determined for Article 31E, in whole
  rupiah. The calculator does not establish turnover composition or choose
  which income belongs in that statutory definition.
- Confirmation that the domestic-resident ordinary non-final regime and the
  selected scenario apply. This is not automatic eligibility verification.

Let `P = floor(PKP / 1000) × 1000`, `G = annual gross turnover`, and `r` be the
standard corporate rate for the selected tax year.

```text
If G <= IDR 4.8 billion:
    allocated PKP = P
If IDR 4.8 billion < G <= IDR 50 billion:
    allocated PKP = P × IDR 4.8 billion / G
If G > IDR 50 billion:
    allocated PKP = 0

remaining PKP = P - allocated PKP
reduced tax   = allocated PKP × (r / 2)
ordinary tax  = remaining PKP × r
total tax     = reduced tax + ordinary tax
```

Both limits are inclusive. Crossing IDR 50 billion by even one rupiah removes
the facility; the allocation ratio must not continue above that ceiling. A
result above the ceiling states explicitly that no Article 31E reduction applies.
The IDR 4.8 billion threshold is a turnover allocation limit, not a deduction
from PKP and not an automatically tax-free amount.

All monetary arithmetic uses BigInt integer fractions. PKP is rounded down to
whole IDR 1,000 **once before allocation**, as required for Article 17 rates.
The allocated portions are not independently rounded or floored. Their sum must
remain equal to rounded total PKP. Final tax-document rounding is not implemented
and the UI/report explicitly label results as preceding that rounding.

Zero turnover is deliberately unsupported in the allocation mode; it produces
an actionable error rather than division by zero or a fabricated tax result.
Zero PKP with positive turnover is accepted. Do not impose an invented rule
that PKP can never exceed turnover: inputs are already tax-adjusted amounts and
this arithmetic-only model does not determine their legal composition.

## Official regression fixtures

[UU 36/2008, official explanation of Article 31E](https://jdih.kemenkeu.go.id/fullText/2008/36TAHUN2008UUPenj.htm):

1. Tax year 2009, gross turnover IDR 4.5 billion, PKP IDR 500 million:
   `(50% × 28%) × 500 million = IDR 70 million`.
2. Tax year 2009, gross turnover IDR 30 billion, PKP IDR 3 billion:
   allocated PKP IDR 480 million, remaining PKP IDR 2.52 billion;
   reduced tax IDR 67.2 million, ordinary tax IDR 705.6 million;
   **total IDR 772.8 million**.

The second example's same inputs in 2024 produce **IDR 607.2 million** under
the later 11%/22% rates. That is a law-derived modern fixture, not an official
worked example for 2024. Keep the years explicit in code, guide and reports.

## Deliberate exclusions

- Article 31E does not model permanent establishments.
- Listed-company reduced rates and their shareholding/reporting conditions are
  still unsupported. Do not stack a listed-company reduction with this mode.
- Final-turnover/UMKM regimes, other facilities, income eligibility, credits,
  instalments, tax-payable reconciliation and losses are not determined here.
- Standard-rate mode is not permission to ignore a facility or final regime
  that legally applies.
- Historical filing-code validity remains separate from this rate timeline.

## Implementation and tests

- `assets/js/tools/indonesian-tax-corporate-rules.js`: rate periods and scope.
- `assets/js/tools/indonesian-tax-rules.js`: exact allocation arithmetic.
- `scripts/domtest/indonesian-tax-corporate.mjs`: official fixtures, each
  supported tax year, threshold ±1-rupiah edges, invalid/zero turnover,
  fractional allocations and 1,600 independent full-tax-minus-discount checks.
- The main tax DOM suite imports the corporate suite and verifies turnover
  visibility, copying, input preservation, stale-output clearing and reset.

No financial input is uploaded, persisted, placed in a URL or added to analytics.
The new turnover field uses `data-no-memory`, including when it is hidden.

### Validation record (2026-10-14)

The dedicated corporate and tax DOM tests, production Hugo build, AI/link checks
and `git diff --check` passed. Chromium checks of tool and guide passed at
320/375/768/1280 pixels in light/dark themes, including actual typing into the
turnover field, the official 2009 example, the 2024 result, the IDR 50 billion
threshold and financial-input storage checks. No horizontal page overflow or
page JavaScript error was detected. Safari and Firefox were not tested.

The broad E2E suite's earlier unrelated OpenSSL ranking failure is documented
in README.md. It was not rerun for this corporate-only update; do not describe
the entire repository test suite as green.
