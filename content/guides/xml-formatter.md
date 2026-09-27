---
title: XML Formatter Guide
description: Pretty-print and minify XML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: xml-formatter
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Pretty-print or minify XML at the indentation you choose. It parses the document first, so mismatched and unclosed tags are reported instead of being passed through.

## Open the tool

[Use XML Formatter](/tools/xml-formatter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it preserve CDATA and comments?

Yes. Both are kept as they are; only the whitespace between elements changes.

### Why does it refuse my file?

The parser is strict. A stray ampersand, an undeclared namespace prefix or a mismatched tag will stop it, and the error names the position.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
