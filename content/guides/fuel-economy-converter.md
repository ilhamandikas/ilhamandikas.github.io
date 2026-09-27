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
---

A one-in, four-out fuel economy converter. Type a figure, choose the unit it is in, and km/L, L/100 km and both MPG figures update as you type. All four units are defined by an exact conversion to km/L and back, so a value and its round trip agree. The maths runs in the page and nothing is uploaded.

## Open the tool

[Use Fuel Economy Converter](/tools/fuel-economy-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why are there two MPG values?

Because the US and UK gallons are not the same size. A UK gallon is about 20% larger, so the same car always shows a higher UK MPG figure. The converter keeps both so a review or a spec sheet written in either country can be read without guessing.

### Which direction is better?

Higher km/L and higher MPG are better; lower L/100 km is better. That inversion is the usual reason a plain percentage change is confusing — a 10% drop in L/100 km is an improvement, not a loss.

### How is L/100 km converted?

It is the reciprocal relationship: L/100 km equals 100 divided by km/L, and km/L equals 100 divided by L/100 km. That is why the two curves are not linear and small L/100 km figures turn into very large km/L figures.

### What are the exact MPG factors?

One km/L is 2.352145833 MPG (US) and 2.824809 MPG (UK). Equivalently, MPG (US) is 235.214583 divided by L/100 km and MPG (UK) is 282.480936 divided by L/100 km. Those constants come from the litre-to-gallon definitions and are exact to the digits shown.

### Is the result rounded?

Each figure is shown to three decimal places, which is finer than any dashboard or pump can measure. The underlying value is not rounded before conversion, so the four outputs stay consistent with one another.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
