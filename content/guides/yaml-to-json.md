---
title: YAML to JSON Guide
description: Convert YAML documents to JSON.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: yaml-to-json
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Convert YAML to JSON, preserving nesting, arrays and types. Anchors and aliases are resolved, so the output is the effective document rather than the shorthand used to write it.

## Open the tool

[Use YAML to JSON](/tools/yaml-to-json/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What happens to a non-string key?

JSON requires string keys, so numeric and boolean keys are converted to their string form. That is a real difference between the two formats, not a bug.

### Are duplicate keys allowed?

No. YAML permits them but almost every parser takes the last one silently, which hides mistakes. This tool reports them instead.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
