---
title: URL Parser Guide
description: Break a URL into its parts and query parameters.
date: '2026-09-27'
tags:
- web
tool_guide_slug: url-parser
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
---

Break a URL into its parts — scheme, host, port, path, query parameters and fragment — and show each one both raw and decoded. It is the quickest way to see what a tracking-heavy link is really carrying.

## Open the tool

[Use URL Parser](/tools/url-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is each parameter shown twice?

Once percent-encoded exactly as it appears in the URL, and once decoded. The difference between the two is usually the interesting part.

### Why does a repeated parameter appear twice in the list?

Because it is genuinely there twice. Repeated parameters are legal and often significant, so every occurrence is kept rather than the last one winning.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
