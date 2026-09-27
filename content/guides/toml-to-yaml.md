---
title: TOML to YAML Guide
description: Convert TOML documents to YAML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: toml-to-yaml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Convert TOML to YAML, turning tables into nested mappings and arrays of tables into sequences. Handy when a tool wants YAML but the config is written in TOML.

## Open the tool

[Use TOML to YAML](/tools/toml-to-yaml/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How are TOML dates represented?

As ISO 8601 strings. YAML does have a timestamp type, but writing one that other parsers agree on is unreliable, so plain strings are the safer output.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
