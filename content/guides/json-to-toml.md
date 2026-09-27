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

Convert JSON to TOML, mapping objects to tables and arrays of tables to the TOML equivalent. Useful for turning an API response into a config file.

## Open the tool

[Use JSON to TOML](/tools/json-to-toml/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is a nested structure sometimes rejected?

TOML requires that a table is fully defined before it is extended. A document that is legal JSON can therefore be inexpressible in TOML without restructuring, and the tool says so rather than emitting something invalid.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
