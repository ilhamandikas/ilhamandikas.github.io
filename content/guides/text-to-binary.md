---
title: Text to Binary Guide
description: Convert text to its binary representation and back.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: text-to-binary
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Convert text to its UTF-8 bytes written in binary, and back again. Each character is shown as the eight bits that encode it, which is the clearest way to see how a string becomes bytes on the wire.

## Open the tool

[Use Text to Binary](/tools/text-to-binary/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is one character sometimes more than eight bits?

Because it is not ASCII. UTF-8 uses one byte for ASCII characters and up to four for others, so an accented letter or an emoji comes out as two or more groups of eight bits.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
