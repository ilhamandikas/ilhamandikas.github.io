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

HTML uses `<` and `>` to mark tags, and `&` to start special character codes called *entities*. If you want to **show** `<b>` as text instead of treating it as a tag, you must write those characters differently. [HTML Entities](/tools/html-entities/) makes that text easy to copy.

## Turn tags into plain text

Type `<b>Hi & bye</b>` in **Text or HTML**. Leave **Decode instead of encode** off. The **Result** should say:

```text
&lt;b&gt;Hi &amp; bye&lt;/b&gt;
```

`&lt;` means `<`, `&gt;` means `>`, and `&amp;` means `&`. In HTML source, that result displays the characters `<b>Hi & bye</b>` as text, rather than making **Hi & bye** bold. Use **Copy** if you need the encoded text.

Now turn on **Decode instead of encode**, replace the input with `&lt;b&gt;Hi &amp; bye&lt;/b&gt;`, and check that the result is `<b>Hi & bye</b>` again.

## What this tool does not do

It converts text; it does not check whether an entire HTML document is safe to show to visitors. When adding untrusted text to a page, prefer your framework's normal text rendering rather than inserting the result as raw HTML. If the output does not look right, check whether **Decode instead of encode** is on.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Which characters actually need escaping?

In HTML text content, & and <. Inside an attribute value, also the quote character you are using to delimit it. Escaping more than that is harmless but makes the source noisy.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
