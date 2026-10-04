---
title: Numeronym Guide
description: Turn long words into numeronyms like i18n.
date: '2026-09-27'
tags:
- text
tool_guide_slug: numeronym
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
about: Turn a long word into a numeronym — the first letter, the number of letters omitted
  and the last letter, so internationalization becomes i18n.
faq:
- q: Why is it called a numeronym?
  a: Because the omitted letters are replaced by their count. The pattern long predates the
    web — a11y for accessibility, k8s for Kubernetes, l10n for localization.
---

A **numeronym** shortens a long word by counting the characters between its first and last letters. For example, `internationalization` has 18 letters between `i` and `n`, so it becomes `i18n`. [Numeronym](/tools/numeronym/) makes these abbreviations as you type.

## Shorten two words

Type `internationalization accessibility` into **Words**. **Numeronyms** should show `i18n a11y`. The space stays between the two results. Words of three letters or fewer, like `cat`, remain unchanged. Punctuation is not converted as part of a word: `cat!` also remains as entered.

This tool recognizes groups of letters separated by whitespace. A hyphenated phrase and other punctuation may stop the whole token from being shortened. Use **Copy** or **Download** for the output, and keep the full spelling nearby when abbreviations would confuse readers.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
