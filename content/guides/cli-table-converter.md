---
title: CLI Table Converter Guide
description: Turn aligned terminal output such as docker ps or df into a Markdown table, CSV
  or TSV.
date: '2026-09-27'
tags:
- convert
tool_guide_slug: cli-table-converter
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Turn the columns printed by docker ps, ps, df or kubectl into a table you can paste into a document or a ticket. The separator is detected from the text, and the output can be a Markdown table, CSV or TSV. Rows of different lengths are padded so the result is always rectangular.

## Open the tool

[Use CLI Table Converter](/tools/cli-table-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does the automatic mode choose two spaces?

In aligned terminal output a single space can appear inside a value, while two or more spaces are the gap between columns. Splitting on two spaces keeps names with one space intact, and any-run-of-spaces is available when a column is narrow.

### What happens to a pipe in the data?

In a Markdown table a pipe would end the cell, so it is escaped as a backslash followed by the pipe. In CSV and TSV output the usual quoting rules apply instead.

### Can I drop the header?

Clear the first-row box and the table is written without one. In Markdown output that means generic column names are used, because the format expects a header line.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
