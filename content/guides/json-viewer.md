---
title: JSON Viewer Guide
description: Explore a JSON document as a collapsible tree or as a table of records, with
  a live count of nested values.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-viewer
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Two reads of one JSON document. The tree view collapses every branch, with a count of the nested values inside it and buttons to expand or collapse everything at once. The table view lays a list of records out as a grid, one row per record and one column per key, which is usually the fastest way to scan an API response. Both views are built for finding your way around a payload you have not seen before — an API response, a config file, a webhook body. The document is parsed locally.

## Open the tool

[Use JSON Viewer](/tools/json-viewer/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What decides the columns in the table view?

Every key that appears anywhere in the records becomes a column, in the order the keys first appear, with a row number in front when the document is an array. A key that only some records carry leaves an empty cell rather than shifting the row.

### How are nested objects and arrays shown in a cell?

As compact JSON, cut off after about 120 characters. The full text is kept in the cell's tooltip. Use the tree view when you need to read a nested value properly.

### Can it open a large file?

It handles documents in the megabytes. The browser still has to lay out every visible node, so very large files are easier to explore with the deep branches left collapsed.

### Can I get a single value out?

Yes. The tree is there for reading, and the JSON Formatter is the tool for copying the whole document back out as text.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
