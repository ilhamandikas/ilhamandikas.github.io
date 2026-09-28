---
title: XML Formatter Guide
description: Pretty-print XML with two-space indentation and report parsing errors.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: xml-formatter
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

XML uses opening and closing tags to group text. [XML Formatter](/tools/xml-formatter/) puts those tags on separate indented lines so you can see what belongs inside what. It checks that the XML can be parsed first.

## Indent a short document

Paste `<root><item>1</item><item>2</item></root>` into **XML**. In **Formatted XML**, you should see `root` on the outside and two `item` elements indented inside it. The tool uses **two spaces** per level. It updates as you type; use **Copy** if you need the formatted text.

Now try `<root><item>1</root>`. The `item` tag was never closed, so the tool should report **Invalid XML** instead of writing an output you might mistake for valid XML.

## Do not use formatting as a data conversion

This tool has **no Minify button** and **no indent selector**. Its small formatter changes whitespace between tags. In XML that whitespace can sometimes be meaningful, especially when text and child elements are mixed. Keep the original and compare the output before using it as a replacement for a production document.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it preserve CDATA and comments?

Do not assume it preserves every CDATA section, comment, or bit of significant whitespace unchanged. It checks the XML with a parser, then formats the original text with a small indenter. For documents that rely on exact text or mixed content, keep the original and inspect the result closely.

### Why does it refuse my file?

The parser is strict. A stray ampersand, an undeclared namespace prefix or a mismatched tag will stop it, and the error names the position.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
