---
title: Regex Tester Guide
description: Test a regular expression against sample text with live matches.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: regex-tester
broader_guide:
  title: Testing Regex Before Shipping It
  url: /guides/regex-testing/
---

A *regular expression*, or *regex*, is a pattern for finding text. [Regex Tester](/tools/regex-tester/) lets you try a pattern on a small sample before using it on a larger file.

## Find two copies of a word

Type `cat` in **Pattern** and `cat dog cat` in **Test text**. Leave **Flags** as `g`. Both copies of `cat` should be marked under **Highlighted**, and **Matches** should list two results. The `g` means *global*: keep looking after the first match.

Remove `g` from **Flags**. Now you should see only the first `cat`. Add `g` back when you want all matches. To see a *capture group*, change the pattern to `(cat)`. The match list shows `$1=cat`: `$1` is the text caught inside the first pair of parentheses.

## If the match is not what you meant

Some characters have a special meaning in regex. A dot `.` means “any character” in many patterns, not only a literal dot. To find an actual dot, use `\.` in **Pattern**. An invalid pattern reports an error; correct it before copying it into code. This tool uses JavaScript regex rules, which can differ from grep or Python.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does my pattern behave differently in Python or grep?

The dialects differ. JavaScript has no atomic groups or possessive quantifiers, and lookbehind support is comparatively recent. The tool shows which flags it is applying.

### Why does .* match more than I expected?

Greedy quantifiers take as much as they can and then backtrack. Append ? to make it lazy — .*? stops at the first opportunity.

## Related guide

For more background, read [Testing Regex Before Shipping It](/guides/regex-testing/).
