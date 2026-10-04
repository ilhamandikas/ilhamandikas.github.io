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
about: Drop in a CSV, TSV or pipe-separated file and read it as a table. The delimiter is
  guessed from the first line, but you can sort by any column, type in the filter box to narrow
  the rows, and see the shape of the file at a glance. The file is parsed in the page, so
  nothing is uploaded.
faq:
- q: How does it pick the delimiter?
  a: It counts commas, semicolons, tabs and pipes on the first non-empty line and uses whichever
    appears most. A file with a single column falls back to the comma.
- q: How large a file can it open?
  a: The whole file is parsed, but only the first five hundred rows are drawn to keep the
    page responsive. The row count in the corner always reflects the full file, not just what
    is shown.
- q: Does it read quoted fields?
  a: Yes. A field wrapped in double quotes may contain the delimiter, a newline or a doubled
    quote, and the viewer keeps it as one value rather than splitting it.
---

CSV is a simple table written as text. Each line is a row; commas usually separate its cells. [CSV Viewer](/tools/csv-viewer/) lays those lines out as a table so you can find and sort records without opening a spreadsheet.

## Read the example already on the page

Open the tool and look at the example under **Or paste CSV, TSV or pipe-separated text**. The first line is `name,city,total`. With **First row is the header** checked, those words become the column headings. You should see rows for Budi, Ada, and Citra under **Table**.

Type `Jakarta` into **Filter rows**. Only Ada's row should remain. Clear the filter, then click the **total** heading. The rows should sort from `95` to `143`; click it again to reverse the order. **Clear sort** restores the unsorted view. **Clear** removes the input too, so use it only when you want to start over.

## Open your own file

Choose a CSV, TSV, or text file with the file input, or paste its contents. The tool reads it in your browser; it does not upload it. It guesses whether columns are separated by commas, tabs, semicolons, or pipes. If the table has the wrong columns, check the source's separator and quoted fields. Large files may contain more than the first 500 rows shown on screen; use the row count, not only the visible table, to tell how many rows matched.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
