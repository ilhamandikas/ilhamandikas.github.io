---
title: Discount Calculator Guide
description: Work out a final price, a discount percent, or the original price from a discount
  and a final price.
date: '2026-09-27'
tags:
- math
tool_guide_slug: discount-calculator
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
about: 'Four everyday discount questions in one place: the final price after a discount, the
  discount percent between two prices, the original price when you only know what you paid,
  and several discounts stacking one after another. Switch the mode and the fields relabel
  themselves, then the result shows the price, the discount and the amount saved.'
faq:
- q: How do I find the discount I was given?
  a: Pick the second mode, enter the full price and the price you actually paid, and the page
    divides the difference by the full price. That is the percentage off, not the percentage
    of the original that you paid.
- q: Why does it need a price and a final price for the reverse?
  a: In **Original price from a final price and a discount** mode, enter the final price and
    the discount percentage. The tool works backward to the original price. A final price
    alone is not enough; many different discounts could have produced it.
- q: Can the discount be over 100%?
  a: 'In reverse mode, a discount of 100% or more cannot be used to calculate a unique original
    price, so the tool reports an error. In the standard final-price mode, it does **not**
    enforce that limit: a value over 100% may produce a negative price. Treat that as invalid
    for an ordinary sale.'
- q: How does the stacked mode work?
  a: Enter one discount per line and the page applies them in order, each on the price the
    previous one left behind. Two 20% discounts are 36% off together, because the second 20%
    comes off the reduced price, not the original.
---

A discount takes part of a price away. [Discount Calculator](/tools/discount-calculator/) can work out the final price, the percent off, or what happens when discounts are applied one after another.

## Start with one discount

Leave **What do you want to work out?** on **Final price from a price and a discount**. Type `100000` in **Original price** and `20` in **Discount (%)**. Under **Result**, you should see **You save: 20.000** and **Final price: 80.000**. The dots are thousands separators in the site's Indonesian number format; `80.000` means eighty thousand, not eighty with a decimal fraction.

## Try two discounts in order

Switch to **Stacked discounts, applied one after another**. Keep **Original price** at `100000`. In **Discounts, one per line**, enter `20` on the first line and `10` on the next. The price becomes `80.000` after the first discount and `72.000` after the second. **Effective discount** should say `28%`, not `30%`: the second ten percent comes off 80,000, not the original 100,000.

The field labels change with the mode, so read them again after switching. Use **Copy** if you need the displayed breakdown. Enter plain numbers here; check taxes, shipping, and store rules separately because this tool does not add them.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
