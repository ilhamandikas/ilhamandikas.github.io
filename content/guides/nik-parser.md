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

Parse an Indonesian NIK/KTP number locally in the browser. The tool splits the 16 digits into province, regency or city, district, encoded birth date, gender marker and serial number, then looks up the region names from an offline copy of Indonesian administrative codes. It does not verify whether a NIK belongs to a real person; it only explains the structure of the number you typed.

## Open the tool

[Use NIK Parser](/tools/nik-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Can this validate that a NIK is real?

No. It can validate the format and decode the embedded fields, but only Dukcapil or an authorised system can confirm whether the identity exists and is active. Treat this as a parser, not an identity check.

### Why does a female birth date look larger than 31?

In a NIK, the day of birth is stored directly for male holders and with 40 added for female holders. So 01 means male born on the 1st, while 41 means female born on the 1st. The page shows that explanation beside the decoded gender.

## Related guide

For more background, read [Indonesian Data Formats](/guides/indonesian-data-formats/).
