---
title: CSV and JSON Converter Guide
description: Convert CSV to JSON, or JSON back to CSV, with configurable delimiter and pretty-printing.
date: '2026-09-27'
tags:
- data
tool_guide_slug: csv-json-converter
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Move between the two shapes that CSV and JSON use for tabular data. Going to JSON,
  each row becomes an object keyed by the header; going to CSV, the keys become the header
  and any key a row is missing is left empty. The delimiter is detected for CSV input and
  can be set by hand.
faq:
- q: What does the JSON have to look like?
  a: An array. Each item can be an object, whose keys become columns, or an array, which is
    written as a plain row. Anything that is not an array is rejected with a message rather
    than a partial result.
- q: Where does the extra header come from?
  a: When objects have different keys, the header is the union of all of them, in the order
    the keys first appear. A row that lacks one of those keys simply gets an empty cell.
- q: Are values converted to numbers?
  a: No. CSV cells are text, so 120 in a CSV file becomes the string "120" in JSON. Convert
    the types in your own code if the number matters.
---

CSV is a table written as lines of text. JSON can describe the same rows using names and values. [CSV and JSON Converter](/tools/csv-json-converter/) moves between those two shapes. It does not guess which values are dates or numbers.

## Turn two CSV rows into JSON

Open the tool. Leave **Direction** on **CSV to JSON**, **Delimiter** on **Detect automatically**, and **First row is the header** checked. The input already contains this sample:

```csv
name,city,total
Ada,Jakarta,120
Budi,Surabaya,95
```

Look at **Output**. You should see a list of two JSON objects. The first row supplies the names `name`, `city`, and `total`. Ada's row becomes an object with `"name": "Ada"`, `"city": "Jakarta"`, and `"total": "120"`. Notice the quotes around `"120"`: CSV cells are text, so this tool does not turn it into the number `120`.

## Go the other way

Choose **JSON to CSV**. The tool switches its unchanged example input to a JSON list. You should see a header row followed by rows for Ada and Budi. If you paste your own JSON, make it a list such as `[{"name":"Ana"},{"name":"Bo"}]`; one object without square brackets is not accepted. **Copy** or **Download** takes the current output.

If columns split in the wrong place, check **Delimiter**. A comma and a semicolon are different separators. If the first row holds data rather than column names, turn off **First row is the header** and inspect the result before using it elsewhere.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
