---
title: NIK Parser Guide
description: Parse Indonesian NIK into region codes, birth date, gender and serial number.
date: '2026-09-27'
tags:
- data
tool_guide_slug: nik-parser
broader_guide:
  title: Indonesian Data Formats
  url: /guides/indonesian-data-formats/
---

A **NIK** is an Indonesian national identity number containing coded fields. [NIK Parser](/tools/nik-parser/) reads those fields and looks up region codes in a bundled list. It does not contact Dukcapil or prove that an identity exists.

## Explore a deliberately invalid example

Replace **National ID number (NIK)** with `0000000101900001` (a dummy value with an unrecognized region). Under **Result**, **Clean NIK** should repeat those 16 digits, **Province code** should say `00`, **Gender** should indicate the day code `01` is not above 40, and **Birth date** should show 1 January with a year inferred from the current year (for example, **01 January 1990** in 2026). The status warns about missing region codes; that is expected for this fake example.

If fewer than 16 digits remain, the page asks for exactly 16. Non-digit characters are removed as you type. For a two-digit birth year, the tool chooses 2000–current year or the previous century, so an older or future date may be guessed incorrectly. Region codes change over time; a parsed date and region are **not** proof of a real person. Never paste a real NIK into a public screenshot or share a result containing one.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Can this validate that a NIK is real?

No. It can validate the format and decode the embedded fields, but only Dukcapil or an authorised system can confirm whether the identity exists and is active. Treat this as a parser, not an identity check.

### Why does a female birth date look larger than 31?

In a NIK, the day of birth is stored directly for male holders and with 40 added for female holders. So 01 means male born on the 1st, while 41 means female born on the 1st. The page shows that explanation beside the decoded gender.

## Related guide

For more background, read [Indonesian Data Formats](/guides/indonesian-data-formats/).
