---
title: Take-Home Pay Calculator Guide
description: Estimate Indonesian net salary from gross pay, with PPh 21 and the employee share
  of BPJS broken out.
date: '2026-09-27'
tags:
- math
tool_guide_slug: take-home-pay-calculator
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
about: 'A contract salary is not what reaches the bank account, and the gap is made of two
  compulsory deductions: income tax under Article 21 and the employee share of the BPJS programmes.
  This works out the monthly figure from the gross salary, the PTKP status and whether BPJS
  applies. The tax follows the annual Article 17 brackets, the same total the December reconciliation
  arrives at, and every deduction is shown separately so the difference can be checked line
  by line against a payslip.'
faq:
- q: Which BPJS deductions come out of the salary?
  a: JHT at 2% of gross pay, JP at 1% of gross pay up to the monthly ceiling, and BPJS Kesehatan
    at 1% of gross pay up to Rp 12,000,000 a month. JKK, JKM and the employer's share of JHT,
    JP and Kesehatan are paid by the company and do not touch take-home pay.
- q: Why can my payslip show a different monthly tax?
  a: Since 2024 an employer withholds a monthly effective rate (TER) and settles the difference
    in December. The yearly total matches the annual brackets used here, but an individual
    month can differ, so the December figure is the one to compare against.
- q: How is the bonus treated?
  a: As part of the year's gross income, which also lifts the position allowance until it
    hits the Rp 6,000,000 ceiling. That is how the year-end reconciliation treats a bonus
    or THR.
- q: Is this the same as the payroll software of my company?
  a: It follows the same published rules, but it will not know about allowances that are taxed
    separately, benefits in kind, a prior employer in the same year, or a status that changed
    mid-year. Treat the result as a close estimate and the payslip as the record.
---

A contract salary is not what reaches the bank account, and the gap is made of two compulsory deductions: income tax under Article 21 and the employee share of the BPJS programmes. This works out the monthly figure from the gross salary, the PTKP status and whether BPJS applies. The tax follows the annual Article 17 brackets, the same total the December reconciliation arrives at, and every deduction is shown separately so the difference can be checked line by line against a payslip.

## From a gross salary to what lands in the bank

Leave the defaults — **Gross salary per month** `10000000`, **PTKP status** `TK/0`, no bonus, **BPJS** ticked — and the **Take-home pay** panel reads `Rp 9,365,000`. The summary explains it as `Rp 10,000,000 gross minus Rp 635,000 of deductions, per month`, and the status adds that net pay is 93.7% of gross with an effective tax rate of 2.35%.

The **Deductions** table breaks that `Rp 635,000` down. JHT is 2% of gross, `Rp 200,000`; JP is 1% of gross up to its ceiling, `Rp 100,000`; BPJS Kesehatan is 1% up to Rp 12,000,000 a month, `Rp 100,000`; and PPh 21 is `Rp 235,000`, which is the annual figure `Rp 2,820,000` divided by twelve. **Annual figures** shows how the tax was reached: 5% of a taxable income of `Rp 56,400,000`, after the position allowance, the deductible contributions and the PTKP.

Untick **BPJS** and the three contribution rows vanish while take-home pay rises — but the tax also rises, because JHT and Kesehatan reduce taxable income while JP does not. Change **PTKP status** from `TK/0` to `K/3` and the taxable income falls. Put `10000000` in **Bonus or THR per year** to see it treated as part of the year's gross, which also lifts the position allowance toward its Rp 6,000,000 cap. Since 2024 an employer withholds a monthly effective rate and settles the difference in December, so an early payslip can differ from this estimate even though the yearly total agrees.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
