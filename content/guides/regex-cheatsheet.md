---
title: Regex Cheatsheet Guide
description: A quick reference of regular-expression syntax.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: regex-cheatsheet
broader_guide:
  title: Testing Regex Before Shipping It
  url: /guides/regex-testing/
---

A regular expression, or **regex**, is a pattern for finding text. Small symbols can have special meanings. [Regex Cheatsheet](/tools/regex-cheatsheet/) lists common symbols so you can look one up while building a pattern.

## Find the symbol for a digit

Type `digit` in the search box. Look for `\d`, which means one digit such as `0` through `9` in the basic example. If you want **three** digits together, combine `\d` with `{3}` to make `\d{3}`. Search for `Exactly three` to find the `{3}` entry.

For example, `\d{3}` can find `123` inside `x123y`. If you want a whole string of three digits rather than a fragment, add `^` at the start and `$` at the end: `^\d{3}$`. The cheatsheet explains the pieces; use the related [Regex Tester](/tools/regex-tester/) to try the complete pattern with examples that should and should not match.

## Use it as a reference, not a validator

Search filters the list; it does not test your data. The **Everyday patterns** section contains rough starting points, not complete validators for email addresses, dates, or passwords. Regex rules can differ between JavaScript, grep, and other tools, so test the pattern in the program where you will actually use it.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Which dialect does this describe?

The syntax is common to most engines. Where JavaScript, PCRE and POSIX diverge, the entry says so explicitly.

## Related guide

For more background, read [Testing Regex Before Shipping It](/guides/regex-testing/).
