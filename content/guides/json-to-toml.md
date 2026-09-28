---
title: JSON to TOML Guide
description: Convert JSON documents to TOML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-to-toml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

TOML is often used for configuration files. It uses `key = value` lines and `[table]` headings to group settings. [JSON to TOML](/tools/json-to-toml/) reads JSON data and writes that shape.

## Turn an object into settings

Paste this into **JSON**:

```json
{"title":"Demo","server":{"port":8080}}
```

Look in **TOML** for `title = "Demo"`, a `[server]` heading, and `port = 8080` below it. The number stays a number; `server` becomes a named group. If you want a file, use **Download**, then check what the program reading that file expects.

## When it cannot convert

TOML needs a **JSON object** at the top level for this tool. A list like `[1,2]` by itself is rejected. TOML also has no `null` value. **This tool can silently leave out a JSON field whose value is `null`**, so compare the output with the source instead of assuming every field survived. Conversion does not check whether the destination program understands your setting names.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is a nested structure sometimes rejected?

JSON and TOML do not have exactly the same types. A top-level list is rejected, but a `null` field can disappear from the TOML without an error. Check the output field by field. Decide for yourself whether the receiving program expects that field to be absent or to have some other value.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
