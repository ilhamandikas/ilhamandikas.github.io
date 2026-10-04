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
about: 'Turn a list into the shape you need: one item per line, comma-separated, a JSON array,
  a SQL IN clause or a numbered list. Useful for turning a column pasted out of a spreadsheet
  into something a query or a script will accept.'
faq:
- q: Does it deduplicate or sort?
  a: No. This tool has no sort or deduplicate control. It keeps the order and duplicates from
    the input (after optional trimming and empty-line removal). Use another tool if you need
    to clean the list first.
- q: Why is my SQL IN clause broken?
  a: Almost always because an item contained a single quote. The tool escapes what it can,
    but read the output before running it.
---

[List Converter](/tools/list-converter/) takes items written **one per line** and writes them in a different form. This is useful when the next program wants a JSON array, CSV, or a numbered list.

## Turn two lines into JSON

Type `apple` on one line and `banana` on the next in **List — one item per line**. Leave **Format** on **JSON array**. **Converted** should show `"apple"` and `"banana"` inside square brackets `[ ]`. A JSON array is a list that a program can read.

Change **Format** to **Numbered lines**. The output should start `1. apple` and `2. banana`. Choose **CSV** if the next place expects one comma-separated row instead. **Copy** takes whatever format is currently shown.

## Check what was removed

**Trim items** removes spaces at the ends of a line; **Drop empty** removes blank lines. Turn either off when those characters matter. The tool keeps the order and repeated items; it does **not** sort or remove duplicates. The **SQL IN (…)** output can help draft a query, but application code should use parameters rather than building SQL from user-supplied strings.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
