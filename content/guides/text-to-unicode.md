---
title: Text to Unicode Guide
description: Show the Unicode code points of a string, and rebuild a string from them.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: text-to-unicode
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Show the Unicode code points behind a piece of text, as U+XXXX escapes and as decimal values, and turn those escapes back into text. It is the quickest way to find out what an invisible or look-alike character actually is.

## Open the tool

[Use Text to Unicode](/tools/text-to-unicode/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between a code point and a UTF-8 byte?

A code point is the abstract character number. UTF-8 is one particular way of writing that number as bytes, so the same code point can occupy a different number of bytes in a different encoding.

### Why does text I copied have an invisible character in it?

Usually a zero-width space or a non-breaking space picked up from a web page or a word processor. Listing the code points is what makes it visible.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
