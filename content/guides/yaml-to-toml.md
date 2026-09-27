---
title: YAML to TOML Guide
description: Convert YAML documents to TOML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: yaml-to-toml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Convert YAML to TOML, preserving nesting, arrays and types. TOML has no null, so a null value is reported rather than quietly dropped or turned into an empty string.

## Open the tool

[Use YAML to TOML](/tools/yaml-to-toml/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What happens to a null value?

TOML has no null type, so it cannot be represented. The converter tells you which key it was, so you can decide what the absence should mean.

### Does key order survive?

Yes, and it matters in TOML, because keys have to be defined before any table that uses them. The converter keeps the order it was given.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
