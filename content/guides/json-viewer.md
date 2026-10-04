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
about: Two reads of one JSON document. The tree view collapses every branch, with a count
  of the nested values inside it and buttons to expand or collapse everything at once. The
  table view lays a list of records out as a grid, one row per record and one column per key,
  which is usually the fastest way to scan an API response. Both views are built for finding
  your way around a payload you have not seen before — an API response, a config file, a webhook
  body. The document is parsed locally.
faq:
- q: What decides the columns in the table view?
  a: Every key that appears anywhere in the records becomes a column, in the order the keys
    first appear, with a row number in front when the document is an array. A key that only
    some records carry leaves an empty cell rather than shifting the row.
- q: How are nested objects and arrays shown in a cell?
  a: As compact JSON, cut off after about 120 characters. The full text is kept in the cell's
    tooltip. Use the tree view when you need to read a nested value properly.
- q: Can it open a large file?
  a: It handles documents in the megabytes. The browser still has to lay out every visible
    node, so very large files are easier to explore with the deep branches left collapsed.
- q: Can I get a single value out?
  a: Yes. The tree is there for reading, and the JSON Formatter is the tool for copying the
    whole document back out as text.
---

JSON can hold one item or a list of items. When the list is long, it is easy to lose track of which value belongs to which item. [JSON Viewer](/tools/json-viewer/) shows the same data as a tree you can open and close, or as a table with rows and columns.

## Look at two records

Paste this into **JSON**:

```json
[{"name":"Ana","role":"editor"},{"name":"Bo","role":"reader","active":true}]
```

You should see a **Tree** first. The square brackets mean this is a list. Open each item to see its names and values. **Expand all** opens everything; **Collapse all** helps when there are too many parts on screen.

Choose **Table**. You should see two rows, one for Ana and one for Bo. The columns include `name`, `role`, and `active`. Ana's `active` cell is empty because that name was not present in her record; it does **not** mean `false`. Bo's cell shows `true`.

This tool is for **reading**, not changing or copying a formatted document. If you need formatted text to paste elsewhere, use the related [JSON Formatter](/tools/json-formatter/).

## If nothing appears

Make sure the text is valid JSON: names such as `"name"` need quotation marks, and each list item needs a comma between it and the next one. The status near the controls shows parsing errors. Fix the input first; changing Tree to Table cannot repair broken JSON.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
