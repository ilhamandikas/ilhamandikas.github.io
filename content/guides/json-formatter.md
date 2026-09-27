---
title: JSON Formatter Guide
description: Validate, pretty-print and minify JSON, with optional key sorting.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-formatter
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Paste JSON and this validates it, pretty-prints it at the indentation you choose, or minifies it back down. The optional sort control reorders object keys at every level, ascending or descending, while leaving array order alone — which is exactly what you want when two API responses differ only in key order. Parsing uses the browser's own JSON parser, so it fails on exactly what a real parser fails on.

## Open the tool

[Use JSON Formatter](/tools/json-formatter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## What to watch for

- Sorting only changes object keys
- Array order is preserved

## Questions you might have

### Does sorting also reorder arrays?

No, and that is deliberate. Only object keys are reordered. Array order is data, so changing it would change the meaning of the document.

### What is the difference between this and the JSON Viewer?

This one gives you text you can copy and paste. The viewer renders a collapsible tree, which is better for finding your way around a document whose shape you do not know yet.

### Is my data uploaded anywhere?

No. Parsing happens locally with JSON.parse and nothing leaves the browser.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
