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
---

Move between the two shapes that CSV and JSON use for tabular data. Going to JSON, each row becomes an object keyed by the header; going to CSV, the keys become the header and any key a row is missing is left empty. The delimiter is detected for CSV input and can be set by hand.

## Open the tool

[Use CSV and JSON Converter](/tools/csv-json-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What does the JSON have to look like?

An array. Each item can be an object, whose keys become columns, or an array, which is written as a plain row. Anything that is not an array is rejected with a message rather than a partial result.

### Where does the extra header come from?

When objects have different keys, the header is the union of all of them, in the order the keys first appear. A row that lacks one of those keys simply gets an empty cell.

### Are values converted to numbers?

No. CSV cells are text, so 120 in a CSV file becomes the string "120" in JSON. Convert the types in your own code if the number matters.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
