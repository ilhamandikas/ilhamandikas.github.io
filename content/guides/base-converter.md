---
title: Number Base Converter Guide
description: Convert integers between binary, octal, decimal and hex.
date: '2026-09-27'
tags:
- convert
tool_guide_slug: base-converter
broader_guide:
  title: Calculators and Unit Conversion
  url: /guides/calculators-and-unit-conversion/
about: Convert a number between binary, octal, decimal, hexadecimal and any base up to 36,
  working on the digits directly so long values are not rounded by floating point.
faq:
- q: Why does the value not change when I paste a very long number?
  a: Because it should not. This converter works on the digits rather than through a floating-point
    number, so a 64-bit value keeps every digit — which is the whole reason to use it instead
    of a calculator.
- q: How are values above 9 written in base 36?
  a: With the letters A–Z after the digits, so 35 is Z and 36 is 10.
---

A number can be written using different sets of digits. **Base 10** uses `0` through `9`; **base 2** uses only `0` and `1`. [Number Base Converter](/tools/base-converter/) changes the writing, not the amount.

## Turn 10 into binary

Set **From base** to `10` and **To base** to `2`. Type `10` into **Value**. **Result** should be `1010`. That is the same amount written using only zeros and ones.

Now replace **Value** with `255` and set **To base** to `16`. You should see `ff`. In base 16, the letters `a` through `f` are digits after `9`, so `ff` is the base-16 form of 255. You can type `0xff` as input when **From base** is `16`.

**Swap** exchanges the two base selectors; it does not replace your input with the last output. To convert back, also paste the earlier result into **Value**. For example, with base 16 → base 10, `ff` should become `255`.

## If a digit is rejected

The digit must exist in the starting base. `2` cannot be read as a base-2 digit. Check **From base** first, then your input. This tool handles whole numbers, including large ones; it does not convert fractions such as `0.5`.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Calculators and Unit Conversion](/guides/calculators-and-unit-conversion/).
