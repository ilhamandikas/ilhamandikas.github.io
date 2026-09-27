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

Sometimes you have an old copy of a file and a new one, but cannot see what changed. [Text Diff](/tools/text-diff/) puts the lines beside the question: which lines stayed, which disappeared, and which were added?

## Compare two short lists

Paste this into **Original text**:

```text
apple
banana
```

Paste this into **Changed text**:

```text
apple
orange
```

Choose **Compare**. The result keeps `apple` as an unchanged line, shows `- banana` for the removed line, and `+ orange` for the added line. The status should show one addition and one removal. Read `-` as “in the old copy but not here now” and `+` as “in the new copy”.

## If you expected no changes

This is a **line-by-line** comparison. A space at the end of a line can make two lines different even if they look identical on screen. Check line breaks and whitespace if the result surprises you. For two JSON documents where key order should not matter, use [JSON Diff](/tools/json-diff/) instead. Neither diff tool changes the originals.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it compare word by word?

It compares line by line, which is the right granularity for configs and code. A whitespace-only change still shows up as a change.

### Is there a version for structured data?

Yes. The JSON Diff tool compares two documents structurally, so it ignores formatting and key order and reports only real differences.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
