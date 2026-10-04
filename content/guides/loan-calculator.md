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
about: 'A loan is repaid in equal instalments, but the split inside each instalment changes
  every month: early on almost all of it is interest, and by the end almost all of it is principal.
  This works out the instalment with the annuity formula, builds the schedule behind it, and
  draws the balance as it falls. It also shows what happens when a little extra is paid each
  month, which shortens the term instead of lowering the instalment.'
faq:
- q: How is the monthly instalment calculated?
  a: 'With the annuity formula: principal × i ÷ (1 − (1 + i)^−n), where i is the yearly rate
    divided by twelve and n is the number of months. Every month the interest is charged on
    the balance still owed, so the principal part grows as the balance falls.'
- q: Does paying extra lower my instalment?
  a: Not here. The extra amount goes straight to the principal while the instalment stays
    the same, so the loan finishes sooner and less interest is paid. Ask the lender to apply
    it to the principal rather than to the next instalment.
- q: Why is the total interest higher than I expected?
  a: Interest is charged on the balance, so on a long loan at a moderate rate the interest
    can approach, or with a large extra payment exceed, the amount borrowed. Shortening the
    term or paying extra reduces it, which the interest saved line reports.
- q: Does this cover a loan with a fixed period then a floating rate?
  a: No. It models one fixed rate for the whole term, and it leaves out arrangement fees,
    insurance and penalties. For a loan whose rate changes partway through, work out each
    period separately.
---

A loan is repaid in equal instalments, but the split inside each instalment changes every month: early on almost all of it is interest, and by the end almost all of it is principal. This works out the instalment with the annuity formula, builds the schedule behind it, and draws the balance as it falls. It also shows what happens when a little extra is paid each month, which shortens the term instead of lowering the instalment.

## A 15-year home loan

The defaults are a `Rp 300000000` loan at `7.5`% a year over `15` years with no extra payment. **Monthly payment** shows about `Rp 2,781,000 a month`, and **Totals** reports roughly `Rp 200,600,000` of interest on top of the amount borrowed — the status line puts that at 67% of the principal. **Year by year** shows why: in the first year almost all of each instalment is interest, and the interest share shrinks as the balance falls.

Read the two charts under **Where the money goes**: the first splits the whole loan between principal and interest, the second does the same for just the **first instalment**, where the interest sliver is at its largest. **Balance over the life of the loan** draws the remaining balance falling to zero.

Now type `500000` into **Extra payment per month**. The instalment stays the same — the extra goes straight to principal — but the **Interest saved** and **Time saved** rows appear, the loan ends sooner, and the status says by how much. Clear it again and the panel hides. Change **Currency** to `$` to reuse the same figures in another currency, pick a **Loan type** preset such as **Vehicle** to load typical values, and try **Interest rate per year** `0`: a 0% loan is allowed and simply divides the amount across the months.

This models one fixed rate for the whole term. A loan with a fixed period followed by a floating rate, or with arrangement fees and insurance on top, will differ.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
