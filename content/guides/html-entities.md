---
title: HTML Entities Guide
description: Escape and unescape HTML special characters.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: html-entities
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
---

Escape and unescape HTML special characters, choosing between named entities and numeric ones, so text can be embedded safely in a page or a snippet read back to see what it really contains. It escapes what needs escaping rather than every non-ASCII character, which keeps the output readable.

## Open the tool

[Use HTML Entities](/tools/html-entities/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Which characters actually need escaping?

In HTML text content, & and <. Inside an attribute value, also the quote character you are using to delimit it. Escaping more than that is harmless but makes the source noisy.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
