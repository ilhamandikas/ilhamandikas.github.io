---
title: JSON to XML Guide
description: Convert JSON documents to XML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-to-xml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Convert JSON to XML, with a root element you choose and a stated convention for arrays,
  attributes and primitive values.
faq:
- q: What happens to an array?
  a: Each item becomes an element with the same name, which is the standard convention. The
    tool shows the rule it applied so the output is predictable.
---

XML puts data between named tags such as `<item>one</item>`. JSON puts it behind names such as `"item":"one"`. [JSON to XML](/tools/json-to-xml/) follows a simple rule to move between these forms: each JSON name becomes a tag.

## Turn two items into XML

Paste this into **JSON**:

```json
{"root":{"item":["one","two"]}}
```

Look in **XML** for one outer `<root>` and **two** `<item>` elements, one containing `one` and one containing `two`. The array made repeated tags. The output starts with an XML declaration; **Copy** or **Download** takes the whole document.

## Check the shape before using it

This tool uses the **first top-level JSON key** as the XML root. If you paste `{"a":1,"b":2}`, the `b` value is not included. Put all the data you need inside **one** root object before converting. A JSON key starting with `@` becomes an XML attribute, and `#text` can become text inside a tag. This is the tool's convention, not a universal JSON-to-XML rule. Review the output before sending it to another system.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
