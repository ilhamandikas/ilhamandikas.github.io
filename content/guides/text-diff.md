---
title: Text Diff Guide
description: Compare two blocks of text line by line.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: text-diff
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Compare two blocks of text line by line and see exactly which lines were added, removed or left alone. Useful for checking what actually changed between two versions of a config, a query or a paragraph.

## Open the tool

[Use Text Diff](/tools/text-diff/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it compare word by word?

It compares line by line, which is the right granularity for configs and code. A whitespace-only change still shows up as a change.

### Is there a version for structured data?

Yes. The JSON Diff tool compares two documents structurally, so it ignores formatting and key order and reports only real differences.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
