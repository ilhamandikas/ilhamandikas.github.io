---
title: Unit Price Comparator Guide
description: Compare products by unit price so different pack sizes can be ranked on the same
  scale.
date: '2026-09-27'
tags:
- math
tool_guide_slug: unit-price-comparator
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
---

A bigger package can cost more at the checkout but **less for each unit**. [Unit Price Comparator](/tools/unit-price-comparator/) works out the cost for the same amount of two products, so you can compare them fairly.

## Compare two bottles

Replace the example in **One product per line: name, price, quantity, unit** with:

```text
Tea A, 3000, 500, ml
Tea B, 5000, 1000, ml
```

Read each line as **name, total price, amount in the bottle, unit**. Under **Ranked by unit price**, Tea A costs `600 per 100 ml` and Tea B costs `500 per 100 ml`. A star marks Tea B as cheaper *per 100 ml*, even though its bottle costs more. The output changes as you type.

## Keep unlike things separate

The tool can compare litres with millilitres because both measure volume. It can also compare kilograms with grams because both measure mass. It puts volume and mass into different groups; a price per ml is not comparable to a price per g. Enter prices as plain numbers like `3000`, **not** `3.000`, because dots here are read as decimal points in the input.

If it says a line is invalid, check that it has four comma-separated parts, a positive price and quantity, and a recognised unit. Cheap per unit is not always best: you may not need the whole larger pack before it expires.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does it group by unit?

Price per millilitre and price per gram are not comparable, so each base unit gets its own ranking. Everything with a volume unit lands in one group, everything with a mass unit in another.

### What units are recognised?

ml, l, g, kg, m and cm, plus a few spelled-out forms, and pcs and buah for counted items. Write price and quantity as plain numbers, without thousand separators, and separate the four fields with commas.

### Is the cheapest always the best buy?

Only on price. Quality, shelf life and how much you will actually use are not in the numbers, so treat the ranking as one input rather than the answer.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
