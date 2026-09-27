---
title: IBAN Validator Guide
description: Validate an IBAN and read its country and check digits.
date: '2026-09-27'
tags:
- data
tool_guide_slug: iban-validator
broader_guide:
  title: Indonesian Data Formats
  url: /guides/indonesian-data-formats/
---

Validate an IBAN with the MOD-97 checksum, and read back the country, the check digits and the domestic account part.

## Open the tool

[Use IBAN Validator](/tools/iban-validator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does a valid IBAN mean the account exists?

No. The checksum only proves the string was not mistyped. It says nothing about whether the account is real or still open.

## Related guide

For more background, read [Indonesian Data Formats](/guides/indonesian-data-formats/).
