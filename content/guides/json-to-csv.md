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
---

Flatten an array of JSON objects into CSV, using the union of the keys as the header row. It is the usual way to get an API response into a spreadsheet.

## Open the tool

[Use JSON to CSV](/tools/json-to-csv/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What happens to nested objects?

They are flattened into dotted column names like user.address.city. An array inside a row is joined into a single cell, because CSV has no way to express nesting.

### Why are some cells empty?

Because not every object has every key. The header is the union of all keys, so an object missing one simply leaves that cell blank.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
