---
title: Fuel Economy Converter Guide
description: Convert fuel economy between km/L, L/100 km and US or UK MPG.
date: '2026-09-27'
tags:
- convert
tool_guide_slug: fuel-economy-converter
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
about: A one-in, four-out fuel economy converter. Type a figure, choose the unit it is in,
  and km/L, L/100 km and both MPG figures update as you type. All four units are defined by
  an exact conversion to km/L and back, so a value and its round trip agree. The maths runs
  in the page and nothing is uploaded.
faq:
- q: Why are there two MPG values?
  a: Because the US and UK gallons are not the same size. A UK gallon is about 20% larger,
    so the same car always shows a higher UK MPG figure. The converter keeps both so a review
    or a spec sheet written in either country can be read without guessing.
- q: Which direction is better?
  a: Higher km/L and higher MPG are better; lower L/100 km is better. That inversion is the
    usual reason a plain percentage change is confusing — a 10% drop in L/100 km is an improvement,
    not a loss.
- q: How is L/100 km converted?
  a: 'It is the reciprocal relationship: L/100 km equals 100 divided by km/L, and km/L equals
    100 divided by L/100 km. That is why the two curves are not linear and small L/100 km
    figures turn into very large km/L figures.'
- q: What are the exact MPG factors?
  a: This implementation multiplies km/L by `2.352145833` for US MPG and `2.824809` for UK
    MPG. Those factors are rounded constants in the code, not a claim of exact precision beyond
    the displayed digits.
- q: Is the result rounded?
  a: Each value is rounded to at most three decimal places for display, with trailing zeros
    omitted. The calculation happens before this display rounding.
---

**Fuel economy** says how far a vehicle travels per amount of fuel. [Fuel Economy Converter](/tools/fuel-economy-converter/) shows four ways of writing the *same* consumption: km/L, L/100 km, US MPG, and UK MPG. **MPG** means miles per gallon; US and UK gallons differ.

## Try an easy reciprocal

Set **Value** to `10` and **Unit** to **L/100 km**. The table should show `10` for L/100 km and `10` for km/L, because `100 ÷ 10 = 10`. The US and UK MPG rows should show about `23.521` and `28.248`, respectively. Change **Value** to `0`: the numbers become dashes and the page asks for a value greater than zero. Correct the value to resume.

There is no copy button; read the table or note the values you need. These are unit conversions, not a prediction of your actual vehicle's fuel use. Outputs are rounded to at most three decimal places for display, so do not expect a copied rounded number to reproduce the original with unlimited precision.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
