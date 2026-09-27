---
title: .env Key Sorter Guide
description: Sort the keys in a .env file alphabetically, keeping each comment with its key
  and optionally dropping duplicates or aligning values.
date: '2026-09-27'
tags:
- text
tool_guide_slug: env-key-sorter
broader_guide:
  title: Working With Configuration Files
  url: /guides/configuration-files/
---

Put a .env file in alphabetical order without shuffling the comments that belong to each setting. The top comment block stays first, a comment above a key travels with that key, and blank lines are closed up. Duplicate keys can be collapsed to the last value, and the equals signs can be lined up for a tidier read.

## Open the tool

[Use .env Key Sorter](/tools/env-key-sorter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it change the values?

No. Only whole lines are moved, so spacing, quotes and inline comments inside a value are untouched. Alignment only pads the space before the equals sign.

### Which duplicate value wins?

The last one, which is what most .env loaders use when a key appears twice.

### Is my file uploaded?

No. The file is read, sorted and written in the browser; nothing leaves the page.

### Does it understand export?

Yes. A line like export PORT=3000 is still recognised as the PORT key and keeps its export prefix.

## Related guide

For more background, read [Working With Configuration Files](/guides/configuration-files/).
