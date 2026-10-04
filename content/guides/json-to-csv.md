---
title: JSON to CSV Guide
description: Flatten a JSON array of objects into CSV.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-to-csv
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Flatten an array of JSON objects into CSV, using the union of the keys as the header
  row. It is the usual way to get an API response into a spreadsheet.
faq:
- q: What happens to nested objects?
  a: This tool does **not** create dotted columns. It writes a nested object or array as JSON
    text in one CSV cell, with quotes escaped when needed. Decide how to handle that cell
    in the receiving program.
- q: Why are some cells empty?
  a: Because not every object has every key. The header is the union of all keys, so an object
    missing one simply leaves that cell blank.
---

CSV is a table of rows and columns. JSON can hold a list of records with named fields. [JSON to CSV](/tools/json-to-csv/) turns each record into a row so it can be opened in a spreadsheet.

## Make a small table

Paste this in **JSON array of objects**:

```json
[{"name":"Ada","total":120},{"name":"Budi"}]
```

With **Delimiter** on **Comma**, the **CSV** output should contain `name,total` on the first line, `Ada,120` on the next, and `Budi,` on the last. Budi has no `total` field, so that cell is empty. The tool builds the headings from **all** the field names it finds, not just the first record.

If the next program uses semicolons instead of commas, change **Delimiter** to **Semicolon** and check the output again. Use **Copy** or **Download** to take the text.

## Watch nested data

CSV cells cannot hold a real nested object or list. If a field contains one, this tool writes its JSON text into a cell rather than making new columns. Review that cell before importing it. Also remember that CSV cells are text when another program reads them; make sure the receiving program treats `120` as a number if you need arithmetic.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
