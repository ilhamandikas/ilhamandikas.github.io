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

## Work out a one-month deposit

The page opens on **Bank deposit (deposito) — ID** with **Simple interest (flat) — ID**, a principal of `10000000`, a rate of `8`% a year, a tenor of `1 month`, **Tax on interest** `20`% and an **Actual/365** basis. **Result** fills in as you type: **Gross interest** `Rp 65,753`, **Tax 20%** `− Rp 13,151`, **Net interest** `Rp 52,603`, **Ending balance** `Rp 10,052,603`, plus net per day, per month and per year. **How the method works** prints the formula the page used, so you can check it by hand: 10,000,000 × 0.08 × (30 ÷ 365).

A tenor in months counts as 30 days each, and **Day-count basis** decides whether a year is 365 or 360 days — which is why one month is not exactly one twelfth of the year. Switch **Tenor** to `12 months` and the gross comes to about `Rp 789,041`; switch the basis to **30/360** and it rises, because every month is now exactly one twelfth.

Change **Interest method** to **Compound interest** and two controls appear: **Compounding frequency** (monthly by default) and **Roll over interest (ARO)**. With ARO ticked each period's net interest is added to the balance so the next period earns interest on it, and **Gross EAY** / **Net EAY** show the annualised effect. Change **Product type** to **Government bond (SBN) — ID** and the preset moves the tax to 10% and the tenor to one year; **Bank deposit** brings it back to 20%. **Tiered interest** opens a **Balance brackets** box (`upper_limit rate` per line, `*` for the top bracket), while **Step-up** and **Floating** open a rate-per-period box; the flat, effective and annuity loan methods replace the deposit rows with a monthly **Instalment schedule**.

The tax defaults (deposit 20%, bond 10%, money market 0%) and the Actual/365 basis are Indonesian conventions marked **ID**; the formulas are the same everywhere. **Copy result** takes the summary as plain text.

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
