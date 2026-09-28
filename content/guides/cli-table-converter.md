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

Terminal commands often print **aligned columns**, but pasting them into a document loses the table. [CLI Table Converter](/tools/cli-table-converter/) splits lines into cells and rewrites them as Markdown, CSV (comma-separated), or TSV (tab-separated) text.

## Convert a tiny terminal table

Replace **Paste command output** with:

```text
NAME  STATUS
api   ready
web   pending
```

Leave **How the columns are separated** on **Detect automatically**, **Output** on **Markdown table**, and **First row is the header** checked. The output should include `| NAME | STATUS |` as its first line and `| api | ready |` below the separator. Switch **Output** to **CSV**: the first row becomes `NAME,STATUS`. **Copy** uses whatever output is currently shown.

The automatic detector uses two-or-more spaces for aligned columns when it finds enough of them; otherwise it may split on *every* space. If a multiword cell gets split incorrectly, select the right separator yourself and review each row. This is a text converter, not a full parser for every command's format. Redact hostnames, IPs, and tokens before pasting terminal output into a shared document.

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
