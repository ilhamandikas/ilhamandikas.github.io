---
title: XML to JSON Guide
description: Convert XML documents to JSON.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: xml-to-json
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

XML uses tags and attributes; JSON uses named fields and lists. [XML to JSON](/tools/xml-to-json/) chooses a way to represent each XML part in JSON. That choice matters when a tag appears more than once.

## Read a repeated tag

Paste this into **XML**:

```xml
<root><item id="1">one</item><item id="2">two</item></root>
```

In **JSON**, look for a `root` object with an `item` **array** of two entries. Each entry has `"@id"` for the XML `id` attribute and `"#text"` for the text inside the tag. The values `"1"` and `"2"` are strings because XML attributes are text, even when they look like numbers.

## Before you rely on the result

The tool cannot make every XML document round-trip exactly. For example, when an element has both text **and** child elements, its text may not appear in the output. Try a small representative sample first and compare the JSON with the original XML. An unclosed tag should produce **Invalid XML**; fix the source rather than trusting partial output.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is the conversion reversible?

Not always. XML can mix text with child elements; this converter does not preserve all mixed content. It also turns repeated sibling tags into arrays. Check the result against the original if you plan to convert it back.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
