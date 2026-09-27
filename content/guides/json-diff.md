---
title: JSON Diff Guide
description: Compare two JSON documents and highlight the differences.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: json-diff
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Compare two JSON documents and see what was added, removed or changed, key by key. Because both sides are parsed first, differences in whitespace and key order are ignored and only real changes are reported — which makes it far more useful than eyeballing two formatted blobs.

## Open the tool

[Use JSON Diff](/tools/json-diff/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does key order count as a difference?

No. Both documents are parsed and compared as structures, so reordering keys is not a change.

### Can it merge the two documents?

No. It reports differences. Merging is a separate decision that depends on which side should win, and that is a judgement the tool cannot make for you.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
