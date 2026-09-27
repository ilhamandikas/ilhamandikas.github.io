---
title: Loan Calculator Guide
description: Work out a fixed-rate loan payment, its amortisation schedule and the interest
  saved by paying extra.
date: '2026-09-27'
tags:
- math
tool_guide_slug: loan-calculator
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
---

A loan is repaid in equal instalments, but the split inside each instalment changes every month: early on almost all of it is interest, and by the end almost all of it is principal. This works out the instalment with the annuity formula, builds the schedule behind it, and draws the balance as it falls. It also shows what happens when a little extra is paid each month, which shortens the term instead of lowering the instalment.

## Open the tool

[Use Loan Calculator](/tools/loan-calculator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How is the monthly instalment calculated?

With the annuity formula: principal × i ÷ (1 − (1 + i)^−n), where i is the yearly rate divided by twelve and n is the number of months. Every month the interest is charged on the balance still owed, so the principal part grows as the balance falls.

### Does paying extra lower my instalment?

Not here. The extra amount goes straight to the principal while the instalment stays the same, so the loan finishes sooner and less interest is paid. Ask the lender to apply it to the principal rather than to the next instalment.

### Why is the total interest higher than I expected?

Interest is charged on the balance, so on a long loan at a moderate rate the interest can approach, or with a large extra payment exceed, the amount borrowed. Shortening the term or paying extra reduces it, which the interest saved line reports.

### Does this cover a loan with a fixed period then a floating rate?

No. It models one fixed rate for the whole term, and it leaves out arrangement fees, insurance and penalties. For a loan whose rate changes partway through, work out each period separately.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
