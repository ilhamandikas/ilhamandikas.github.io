---
title: Phone Parser Guide
description: Parse and format phone numbers by country.
date: '2026-09-27'
tags:
- data
tool_guide_slug: phone-parser
broader_guide:
  title: Indonesian Data Formats
  url: /guides/indonesian-data-formats/
---

[Phone Parser](/tools/phone-parser/) tries to read a number using country-specific numbering rules. **Possible** means its shape or length could fit; **Valid** means it matches the library's rules. Neither means the number belongs to someone or can receive a call.

## Inspect the example number

The page starts with **Phone number** `+1 202 555 0147` and **Default country** set to the US. It should show **Calling code** `+1` and an **E.164** form without spaces: `+12025550147`. E.164 is a common international representation beginning with `+` and a country calling code. The **International** and **National** rows add human-readable spacing, while **RFC 3966** gives a `tel:` URI.

Try removing the leading `+1` and changing **Default country**: the same digits can be interpreted differently. If parsing fails, check the country choice and include a calling code. Use public example numbers, not a real contact list, when demonstrating the result. Validation is not proof the line is active.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does a number I know is real show as invalid?

Validation checks the length and prefix rules for the selected region. A number can be genuinely in service and still fail those rules, for example if it was issued before a numbering plan change.

## Related guide

For more background, read [Indonesian Data Formats](/guides/indonesian-data-formats/).
