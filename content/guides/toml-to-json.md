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
---

Convert TOML to JSON, turning tables into nested objects and arrays of tables into arrays. Dates and datetimes are kept as strings in their TOML form.

## Open the tool

[Use TOML to JSON](/tools/toml-to-json/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How are TOML dates represented?

JSON has no date type, so they become ISO 8601 strings — the same text, with the type information lost. That is a limitation of the target format.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
