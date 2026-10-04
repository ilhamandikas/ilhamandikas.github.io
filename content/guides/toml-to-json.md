---
title: TOML to JSON Guide
description: Convert TOML documents to JSON.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: toml-to-json
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Convert TOML to JSON, turning tables into nested objects and arrays of tables into
  arrays. Dates and datetimes are kept as strings in their TOML form.
faq:
- q: How are TOML dates represented?
  a: JSON has no built-in date type. If your TOML contains a date or time, inspect the JSON
    output and confirm the receiving program expects its string form; conversion alone does
    not tell that program how to interpret it.
---

A TOML file groups settings under headings such as `[server]`. JSON groups the same data with braces `{ }`. [TOML to JSON](/tools/toml-to-json/) lets you see the values as JSON without guessing where a heading ends.

## Read one tiny config

Paste this into **TOML**:

```toml
title = "Demo"
[server]
port = 8080
```

In **JSON**, look for `"title": "Demo"` and a `"server"` object containing `"port": 8080`. The number 8080 has no quotes in the result, so it is a number, not text. Use **Copy** or **Download** if another program needs the JSON.

## Before replacing a config

This tool converts values, not the program's rules for what settings are allowed. It also cannot keep TOML comments in JSON because standard JSON has no comment syntax. If you get a parsing error, check quotation marks and table headings in the TOML first. Keep the original file when the comments matter.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
