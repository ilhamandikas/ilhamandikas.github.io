---
title: JSON Minifier Guide
description: Strip all whitespace from JSON to shrink it.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-minifier
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Strip the whitespace out of a JSON document while keeping it valid, so it takes fewer bytes over the wire. It parses first and re-serialises, so a malformed document is rejected rather than mangled.

## Open the tool

[Use JSON Minifier](/tools/json-minifier/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How much smaller does it get?

Typically 20–40% for hand-formatted JSON. If the server gzips its responses the gain is mostly redundant, because gzip already removes repeated whitespace.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
