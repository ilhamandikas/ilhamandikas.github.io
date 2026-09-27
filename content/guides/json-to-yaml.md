---
title: JSON to YAML Guide
description: Convert JSON documents to YAML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-to-yaml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

JSON and YAML can hold the same simple data in different-looking text. JSON uses braces and square brackets; YAML often uses indentation and dashes. [JSON to YAML](/tools/json-to-yaml/) reads the JSON first, then writes the data as YAML.

## Convert a name and a list

Paste this into **JSON**:

```json
{"name":"Ana","tags":["editor","reader"]}
```

Look in **YAML** for `name: Ana`, then a `tags:` line with `- editor` and `- reader` below it. The exact spacing is chosen by the YAML writer, but `tags` should still contain two values. Use **Copy** or **Download** if you need the result in another file.

## If it does not convert

Check the JSON first. For example, `{name:"Ana"}` is not valid JSON because `name` needs quotation marks. The tool cannot fix invalid input or decide whether the YAML keys are right for your application. After converting configuration, review the output before replacing a working file.

This converts data, not comments: standard JSON has no comments to bring over. For nested data or unfamiliar values, compare the output with the original rather than assuming a different-looking result means the same thing.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Are comments kept?

JSON has no comments, so converting JSON to YAML cannot invent any. Going the other way, YAML comments are dropped because JSON has nowhere to put them.

### Why does my document fail to convert?

This tool parses **JSON** input, not YAML. A missing quote or comma in JSON can cause an error. YAML-only features such as anchors are not valid input here; start with valid JSON instead.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
