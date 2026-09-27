---
title: CSV Viewer Guide
description: Open a CSV, TSV or pipe-separated file, filter it and sort it column by column
  in a table.
date: '2026-09-27'
tags:
- data
tool_guide_slug: csv-viewer
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Drop in a CSV, TSV or pipe-separated file and read it as a table. The delimiter is guessed from the first line, but you can sort by any column, type in the filter box to narrow the rows, and see the shape of the file at a glance. The file is parsed in the page, so nothing is uploaded.

## Open the tool

[Use CSV Viewer](/tools/csv-viewer/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How does it pick the delimiter?

It counts commas, semicolons, tabs and pipes on the first non-empty line and uses whichever appears most. A file with a single column falls back to the comma.

### How large a file can it open?

The whole file is parsed, but only the first five hundred rows are drawn to keep the page responsive. The row count in the corner always reflects the full file, not just what is shown.

### Does it read quoted fields?

Yes. A field wrapped in double quotes may contain the delimiter, a newline or a doubled quote, and the viewer keeps it as one value rather than splitting it.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
