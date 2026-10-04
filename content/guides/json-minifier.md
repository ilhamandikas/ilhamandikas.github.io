---
title: JSON Minifier Guide
description: Strip all whitespace from JSON to shrink it.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-minifier
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Strip the whitespace out of a JSON document while keeping it valid, so it takes fewer
  bytes over the wire. It parses first and re-serialises, so a malformed document is rejected
  rather than mangled.
faq:
- q: How much smaller does it get?
  a: It depends on how much spacing the original contains. A one-line document may barely
    change. If your server already compresses responses, removing spaces may save much less
    on the actual download than the text boxes suggest.
---

JSON stores data as text. Extra spaces and new lines can make it easier for a person to read, but a computer does not need most of them. [JSON Minifier](/tools/json-minifier/) reads valid JSON and writes a more compact version.

## Watch spaces disappear

Paste this into **JSON**:

```json
{
  "name": "Ana",
  "active": true
}
```

The **Minified JSON** box should show `{"name":"Ana","active":true}`. You did not lose `name` or `active`; you only lost the spaces and new lines outside the values. The result updates as you type, and **Copy** takes the compact text.

There is an important difference between spaces **around** values and spaces **inside** quoted text. In `"name":"Ana Maria"`, the space between `Ana` and `Maria` stays. It is part of the name.

## If the tool reports an error

It checks whether the input is valid JSON before writing output. Try `{name:"Ana"}` to see an error: JSON names need quotation marks. Change it to `{"name":"Ana"}`. The tool may also rewrite how a number is spelled, such as `1.0` becoming `1`, because it parses and writes JSON again; do not use it when the original text itself must remain byte-for-byte identical.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
