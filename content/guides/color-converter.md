---
title: Color Converter Guide
description: Convert colors between HEX, RGB, HSL and more.
date: '2026-09-27'
tags:
- convert
tool_guide_slug: color-converter
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

A screen colour can be written in several ways. A HEX value like `#FF0000` and an RGB value like `rgb(255, 0, 0)` can describe the same red. [Color Converter](/tools/color-converter/) shows several spellings of one colour.

## Convert a colour you know

Type `#FF0000` in **Color (hex, rgb, hsl or CSS name)**. In **All formats**, look for `RGB: rgb(255, 0, 0)` and `HSL: hsl(0, 100%, 50%)`. The first RGB number is the amount of red; the next two are green and blue. This example is all red, with no green or blue.

Replace the input with `red`. You should get the same HEX and RGB values. This is because `red` is a CSS colour name the browser understands. The output changes as you type; there is no Convert button. Use **Copy** to take all the displayed formats.

## What to watch for

**RGBA** includes an extra value for transparency, but the plain **HEX** row only shows red, green, and blue. If you enter a partly transparent colour, copying that HEX value alone loses the transparency. **CMYK** is only a simple screen-to-ink estimate; printing depends on the printer and its colour profile. If the tool says **Unrecognised color**, check the spelling or try a HEX value such as `#FF0000`.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the CMYK value approximate?

CMYK describes ink on paper and depends on the printer profile. The value here is the standard naive conversion, which is a reasonable starting point but not something to send to a print house.

### Does HSL use degrees?

Yes. Hue describes a position around a colour wheel, from 0 to 360 degrees. Saturation and lightness are shown as percentages.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
