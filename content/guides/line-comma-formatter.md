---
title: Line Comma Formatter Guide
description: Add commas, quotes, arrays or SQL IN formatting to one-item-per-line lists.
date: '2026-09-27'
tags:
- text
tool_guide_slug: line-comma-formatter
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

A list often arrives with one item per line, but the place you want to paste it expects commas or quotes. [Line Comma Formatter](/tools/line-comma-formatter/) changes the **shape** of that list. It does not look up or validate the items.

## Start with two items

Put `apple` on the first line and `banana` on the second line of **Input list**. With **Output** set to **Add comma at end of each line**, the result should be two lines: `apple,` and `banana,`.

Choose **JavaScript array** to see the same items inside `[` and `]`, surrounded by double quotes. Choose **SQL IN list** to see `('apple', 'banana')`. The result updates as you change a control; **Copy** takes only the current output.

## Keep track of the input

**Trim** removes spaces at the start and end of each line. **Skip empty** removes blank lines. If those spaces or blank lines are meaningful, turn the checkboxes off and compare the output. **Remove duplicates** and **Sort** change which items remain and their order, so leave them off unless you actually want those changes.

A generated SQL list is for inspecting or drafting a query, **not** a replacement for parameterized queries in application code. Do not put untrusted user input directly into a SQL string.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Can it keep blank lines?

Yes. Turn off Skip empty if the blank lines are meaningful. Turn off Trim lines if leading or trailing spaces should be preserved.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
