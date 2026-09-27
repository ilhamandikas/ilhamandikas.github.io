---
title: List Converter Guide
description: Convert between line lists, CSV, JSON arrays and other list formats.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: list-converter
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Turn a list into the shape you need: one item per line, comma-separated, a JSON array, a SQL IN clause or a numbered list. Useful for turning a column pasted out of a spreadsheet into something a query or a script will accept.

## Open the tool

[Use List Converter](/tools/list-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it deduplicate or sort?

Only if you ask it to. By default the order and the duplicates are exactly as you pasted them.

### Why is my SQL IN clause broken?

Almost always because an item contained a single quote. The tool escapes what it can, but read the output before running it.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
