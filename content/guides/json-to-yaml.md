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

Convert JSON to YAML, preserving the structure rather than reformatting the text. It is the usual way to move a config between a tool that speaks one and a file that is written in the other.

## Open the tool

[Use JSON to YAML](/tools/json-to-yaml/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Are comments kept?

JSON has no comments, so converting JSON to YAML cannot invent any. Going the other way, YAML comments are dropped because JSON has nowhere to put them.

### Why does my document fail to convert?

Usually an anchor or a custom tag with no equivalent, or a duplicate key. The error names the position.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
