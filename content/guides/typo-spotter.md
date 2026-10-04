---
title: Typo Spotter Guide
description: Flag double spaces, stray spaces around punctuation, repeated words and informal
  Indonesian short forms.
date: '2026-09-27'
tags:
- text
tool_guide_slug: typo-spotter
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
about: A rule checker for the mistakes that spellcheck misses. It flags double spaces, a space
  before a comma or a full stop, a missing space after punctuation, repeated words such as
  the same word twice, runs of exclamation marks and spaces hugging brackets. Turn on the
  informal switch and it also lists common Indonesian short forms like yg, tdk and diatas
  with the fuller word to use instead.
faq:
- q: Is this checking grammar?
  a: No. It only matches patterns, so it will not tell you whether a sentence makes sense
    and it does not know the difference between your and you're. It is a first pass for mechanical
    slips, not a replacement for reading the text.
- q: Why does it flag text that looks fine?
  a: Some rules are deliberately blunt. A missing-space rule will fire on e.g. and a repeated-word
    rule on a genuine repetition like had had, both of which are sometimes correct. Treat
    the list as suggestions and skim it.
- q: Does anything leave the page?
  a: No. The checking runs entirely in the browser, so drafts and internal notes can be pasted
    in without them being sent anywhere.
---

[Typo Spotter](/tools/typo-spotter/) scans text for a short list of **patterns**, not for correct grammar or spelling. It reports where a pattern starts by line and column. It does not edit your text automatically.

## Spot a small mistake

Replace **Text** with `Hello  world`. There are **two** spaces between the words. Under **Findings**, you should see `Line 1, col 6: double space (2 spaces)`. Remove one space; the page should say **No obvious typos found.** With **Flag informal Indonesian short forms** checked, entering `yg` also gives a suggestion to use `yang` in formal writing; uncheck it to hide that suggestion.

A report is a prompt to review, not proof of an error: abbreviations, punctuation inside URLs, and intentional repeated words can trigger rules. **Copy** copies the findings, not the corrected text. Proofread the original yourself before publishing; avoid putting private drafts into public screenshots.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
