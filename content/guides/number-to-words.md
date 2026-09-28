---
title: Number to Words Guide
description: Spell an Indonesian number out in words, for invoices and receipts.
date: '2026-09-27'
tags:
- text
tool_guide_slug: number-to-words
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

[Number to Words](/tools/number-to-words/) writes a number in **Indonesian words**. This can help when filling a draft invoice or checking how an amount sounds before you use it.

## Try a whole number

Type `1250000` in **Number**. Under **In words**, you should see `satu juta dua ratus lima puluh ribu`. Read it in pieces: one million, then two hundred fifty thousand. Turn on **Capitalise the first word** if you need the line to start with `Satu` instead of `satu`. Use **Copy** to take the result.

## Try a decimal

Replace the input with `12,5`. The result should be `dua belas koma lima`. Here the comma marks the decimal part; the digits after it are read one by one. **Do not type `1,250,000` as a thousands-grouped number**: the tool uses comma or dot as a decimal marker, not as a grouping separator. Write `1250000` instead.

## Check the result before printing

The tool writes number words; it does not add `rupiah` or decide a legal invoice format for you. For very large amounts, especially long numbers near the limit of JavaScript's exact integers, compare against the original digits by hand. If it says the number is too large, do not shorten an invoice amount just to get an output.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How is 1,250,000 read?

Enter `1250000` without separators. The output is `satu juta dua ratus lima puluh ribu`. Typing `1,250,000` is not the same input here: commas mark decimal digits, not thousands.

### What about the number one?

In front of a scale word it shortens: 1000 is seribu and 100 is seratus, not satu ribu and satu ratus. Everywhere else it stays satu, as in satu juta.

### How large a number can it handle?

The tool rejects an integer part longer than 16 digits. That length check is **not** a promise that every shorter integer is exact: JavaScript numbers can lose precision above `9007199254740991`. Double-check large financial amounts before using the words.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
