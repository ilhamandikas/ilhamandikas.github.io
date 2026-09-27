---
title: Interest Calculator Guide
description: Calculate deposit or loan interest after tax, with flat, effective, annuity,
  compound, tiered, step-up and floating methods.
date: '2026-09-27'
tags:
- math
tool_guide_slug: interest-calculator
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
---

A calculator for the interest methods that are easy to mix up: simple, compound, tiered, step-up, floating, flat, effective and annuity. Enter a principal, a rate and a tenor and the page shows the formula it used, the result as gross, tax and net where tax applies, and a period-by-period breakdown. The product presets follow the tax and day-count conventions commonly used in Indonesia and are marked ID; everything is computed in the browser.

## Open the tool

[Use Interest Calculator](/tools/interest-calculator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the formula for simple interest?

I = P x r x (days / basis), where P is the principal, r the rate per year as a decimal, and basis the day count (365 or 360). The interest is paid once and never earns interest itself, which is how a deposit that pays at maturity works.

### What is the formula for compound interest?

A = P x (1 + r / n)^(n x t), where n is the number of compounding periods per year and t the tenor in years. Each period's interest is added to the balance so the next period earns interest on it. When tax is withheld at each payment, the amount that compounds is the net interest.

### How are tiered, step-up and floating interest calculated?

All three add up per-slice amounts instead of applying one rate to the whole balance. Tiered splits the balance into brackets and computes slice x rate x (days / basis) for each. Step-up and floating apply a list of rates per period and add P x r_i x span_i. The only difference is that step-up rises on a schedule while floating can move either way.

### What is the difference between flat, effective and annuity?

Flat charges interest on the original principal for the whole term: I = P x r x (months / 12), split evenly across the instalments, so the true cost is higher than the headline rate. Effective charges interest on the remaining balance each month: interest = remaining x r / 12, so the interest share falls over time. Annuity keeps the total instalment fixed with A = P x i / (1 - (1 + i)^-n), where i = r / 12 and n is the number of months, while the split shifts from interest to principal.

### Why does one month not equal one twelfth of the yearly rate?

Because the day-count basis decides how a month becomes a fraction of a year. Actual/365 counts a month as 30/365, a little less than a twelfth; 30/360 treats every month as exactly 1/12, a little more. The page lets you switch basis so the choice is visible instead of hidden.

### Which parts are specific to Indonesia?

The product presets and the ID badges: the final tax on deposit and bond interest, the Actual/365 basis, the ARO rollover, and the loan structures quoted as flat, effective or annuity. The formulas themselves are the same everywhere; only the defaults and the naming are local.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
