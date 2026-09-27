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

When an API response or configuration changes, comparing two walls of text is tiring. [JSON Diff](/tools/json-diff/) reads both pieces of JSON and points to values that were added, removed, or changed.

## Compare two tiny objects

Paste `{"user":{"name":"Ana","active":true}}` in **Original JSON**. Paste `{"user":{"name":"Ana","active":false}}` in **Changed JSON**, then choose **Compare**.

You should see a line starting with `~ user.active: true → false`. Read it like this: inside `user`, the value named `active` changed from `true` to `false`. The `~` means changed. If a value exists only on the right, it starts with `+`; if it exists only on the left, it starts with `-`.

Now set `active` to `true` on **both** sides. Reverse the order of `name` and `active` on the right, but leave their values alone. Choose **Compare** again. The result should say **Identical**: moving names around in a JSON object did not change the data.

## If the result surprises you

Check which side you put into each box: left is *original*, right is *changed*. Both must be valid JSON; a missing quote or comma produces an error instead of a partial comparison. This tool compares array items by their positions, so moving a list item may look like several changes. It shows differences; it does not merge files or decide which version is correct.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does key order count as a difference?

No. Both documents are parsed and compared as structures, so reordering keys is not a change.

### Can it merge the two documents?

No. It reports differences. Merging is a separate decision that depends on which side should win, and that is a judgement the tool cannot make for you.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
