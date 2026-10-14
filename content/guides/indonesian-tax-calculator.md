---
title: Indonesian Tax Calculator Guide
description: Read historical Indonesian tax calculations, distinguish taxable bases from invoice totals, and check which scenarios are actually supported.
date: '2026-10-14'
noindex: true
tags:
- tools
tool_guide_slug: indonesian-tax-calculator
about: >-
  Calculate selected Indonesian tax scenarios using explicit dates and exact
  integer-fraction arithmetic. This experimental release includes a reference
  catalogue of 193 object options from the DJP calculator, but only selected
  scenarios have audited calculation rules. Historical filing-code validity is
  not verified, and dates after 2024-12-31 are blocked.
faq:
- q: Does this cover every Indonesian tax object and historical period?
  a: >-
    No. The catalogue contains all 193 object options in the downloaded DJP
    calculator HTML, not a complete national or historical filing registry.
    Calculation coverage is narrower and listed on the tool. Unsupported
    periods and scenarios are blocked rather than assigned a guessed rate.
- q: Can I calculate current VAT using this release?
  a: >-
    No. Audited VAT coverage ends on 2024-12-31. The historical 10% and 11%
    model must not be extrapolated to 2025 or later, where statutory rates,
    adjusted bases and transition rules need separate handling.
- q: Why can the result contain a fraction of a rupiah?
  a: >-
    Gross-up and VAT-inclusive calculations can produce recurring fractions.
    The calculator preserves those fractions exactly instead of silently
    rounding them. Results are before tax-document rounding, except for the
    explicitly applied statutory PKP rounding.
- q: Are my income or transaction amounts stored?
  a: >-
    Calculations run in the browser. This tool does not upload inputs, put
    them in the URL, or save them in browser storage. Copying a calculation
    sends it to your clipboard only when you choose that action.
---

A tax rate is useful only after the taxable transaction, period and tax base
have been established. The [Indonesian Tax Calculator](/tools/indonesian-tax-calculator/)
shows those assumptions beside its calculation and blocks scenarios without an
audited rule. It is an independent tool, not a DJP service or tax-filing system.

## Start with the period, not the rate

Select the tax type and the transaction or payment date. For annual resident
Article 17 or standard corporate tax, use **31 December of the tax year**.
Short and non-calendar tax years are not supported. Construction uses the
payment date; a contract signed earlier does not automatically preserve an
older rate for later payments under PP 9/2022.

Search the object selector by code, English description or Indonesian wording.
The Indonesian name is retained because an explanatory translation is not a
replacement for the official definition. The selector is a snapshot, not proof
that a code was valid for a historical filing. A supported calculation models
the named transaction; it does not certify the displayed filing code.

**The audited calculation windows end on 2024-12-31.** These are coverage
boundaries, not statements that the regulations were repealed on that date.
Do not change the date merely to get a result for an unsupported transaction.

## A service payment: gross base versus take-home amount

Consider an ordinary taxable website-development service subject to standard
PPh 23, with a registered recipient and no exemption or special facility:

- Date: **2024-06-30**.
- Reference object: **24-104-25**, website development and management.
- Taxable gross base, excluding VAT: **IDR 10,000,000**.
- Recipient registration: **Has NPWP**.

After checking the scenario assumptions, the calculation is:

```text
Taxable gross base                 IDR 10,000,000
PPh 23: 2% × 10,000,000             IDR    200,000
Net after withholding              IDR  9,800,000
```

The net figure excludes VAT. It is not the final bank transfer if an invoice
also includes VAT or other adjustments.

If the agreement instead promises **IDR 9,800,000 after withholding**, choose
the net-after-withholding basis. Algebraic gross-up solves:

```text
Gross base = net / (1 − withholding rate)
           = 9,800,000 / 0.98
           = IDR 10,000,000
Tax        = IDR 200,000
```

This is not a payroll gross-up or a simulation of rounded tax documents. For
PPh 23 in the supported period, choosing **No NPWP** doubles the applicable
standard withholding rate: a 2% rate becomes 4%. The tool does not determine
the recipient's registration status.

PMK 141/2015 distinguishes the taxable service base from an invoice total.
Documented payments to workers, purchases, third-party payments or
reimbursements may be excluded when the regulation's conditions are met;
catering has its own base definition. Enter the legally established base, not
an assumed deduction. If evidence required for an exclusion is absent, do not
simply subtract that item. Income subject to Article 21, final tax or an
exemption is outside this standard-service scenario.

## A historical VAT boundary

For an ordinary domestic taxable supply with a **VAT-exclusive** price of
IDR 10,000,000 and no special treatment:

| Transaction date | Rate | VAT | Total including VAT |
| --- | --- | --- | --- |
| 2022-03-31 | 10% | IDR 1,000,000 | IDR 11,000,000 |
| 2022-04-01 | 11% | IDR 1,100,000 | IDR 11,100,000 |

For **IDR 11,100,000 including VAT** on 2022-04-01, the base is
`11,100,000 / 1.11 = 10,000,000`. Multiplying an already VAT-inclusive total
by 11% would overstate the VAT.

These examples do not cover exports, exemptions, special tax bases, facilities,
or the VAT rules applying from 2025. A 2025 or later date is intentionally
blocked, not treated as another 11% transaction.

## Annual tax is not monthly withholding

The annual Article 17 mode starts from **PKP (Penghasilan Kena Pajak)**:
taxable income already established after applicable deductions and PTKP
(*Penghasilan Tidak Kena Pajak*, the personal allowance). It does not compute
PKP from gross salary or apply BPJS deductions.

For PKP of **IDR 120,000,999** in tax year **2024**:

```text
PKP rounded down to IDR 1,000       IDR 120,000,000
First IDR 60,000,000 × 5%           IDR   3,000,000
Next  IDR 60,000,000 × 15%          IDR   9,000,000
Annual tax before credits          IDR  12,000,000
```

The higher rate applies only to the part in that bracket. It does not turn the
entire PKP into income taxed at 15%.

This is not monthly TER (*Tarif Efektif Rata-rata*), a completed A1/A2 statement,
or a final-month reconciliation. Earlier withholding and credits are not
subtracted. For salary after employee contributions and estimated tax, the
separate [Take-Home Pay Calculator](/tools/take-home-pay-calculator/) has a
different purpose; it is not a historical filing calculator either.

## Other supported scenarios

- **Standard corporate income tax:** 22% of rounded PKP for 2022–2024,
  before credits and instalments. Article 31E and the qualifying listed-company
  reduction are not implemented. Do not select the standard rate when a
  different regime applies.
- **Ordinary land/building rental:** 10% of the gross rental base from
  2018-01-02 through 2024-12-31. Include related rental charges covered by
  PP 34/2017; accommodation services and build-operate-transfer transition
  cases are excluded.
- **Construction payments:** PP 9/2022 rates from 2022-02-21 through
  2024-12-31. Choose the correct work type and provider/certificate status;
  the tool does not verify certificates. Enter the payment excluding VAT.

PPh 22, PPh 15, PPnBM, remaining final-tax scenarios, dividends and PPh 23
service objects 66–69 are **reference only** in this release. Catalogue presence
is not calculation support, a confirmed zero rate, or historical code validity.

## Reading exact results and recovering from errors

Whole-rupiah inputs accept digits only, up to 18 digits. Empty values, negative
amounts, separators, decimals and exponent notation are rejected without
clearing the amount. Zero is accepted.

The arithmetic uses integer fractions, including gross-up and reverse VAT.
A recurring result is shown as an exact fraction of one rupiah rather than a
rounded approximation. Except for statutory PKP rounding down to whole
IDR 1,000, **no tax-document rounding is assumed**. Check the applicable filing
rules before using a fractional result in an invoice or return.

Editing a date, object, amount or assumption clears the previous result and
copy report, so an old calculation is not presented as the new one. An
unsupported date or object has no fallback rate. Correct the input if it was a
mistake; otherwise use the official rules or obtain professional advice.

## References

- [UU 7/2021 — Article 17, PKP rounding, VAT rate change and commencement provisions](https://www.pajak.go.id/sites/default/files/2021-12/Salinan%20UU%20Nomor%207%20Tahun%202021.pdf).
- [UU 42/2009 — ordinary VAT rate and commencement](https://jdih.kemenkeu.go.id/dok/uu-42-tahun-2009).
- [PMK 141/PMK.03/2015 — service types, taxable base and documented exclusions](https://jdih.kemenkeu.go.id/dok/141-pmk-03-2015).
- [DJP PPh 23 rate table](https://pajak.go.id/id/pph-pasal-23), used for standard rates and the no-NPWP multiplier only. Its older dividend conditions and filing deadlines are not adopted here.
- [PP 34/2017 — land and building rental](https://jdih.kemenkeu.go.id/dok/pp-34-tahun-2017).
- [PP 9/2022 — construction rates and payment transition](https://jdih.kemenkeu.go.id/dok/pp-9-tahun-2022).
- [DJP calculator](https://kalkulator.pajak.go.id/), source of the 193 reference object options, downloaded on 2026-10-14. Its selector rates are not used as historical evidence.
