---
title: Markdown to HTML Guide
description: Render Markdown to HTML in the browser.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: markdown-to-html
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
about: Render Markdown to HTML in the browser, with the generated markup shown as text so
  you can copy it straight into a template. It handles headings, lists, tables, code fences,
  links and inline formatting.
faq:
- q: Is the output sanitised?
  a: No. Raw HTML can pass through the renderer, and the preview inserts generated HTML into
    the page. Do not paste untrusted content here; sanitize it before rendering or publishing
    it.
- q: Which flavour of Markdown is this?
  a: CommonMark with the usual table and strikethrough extensions — GitHub-flavoured in practice.
---

**Markdown** uses characters such as `#` for headings and `**` for bold text. [Markdown to HTML](/tools/markdown-to-html/) turns that text into HTML and displays both a live **Preview** and the generated **HTML** source.

## Convert two lines

Type `# Hello`, leave a blank line, then type `This is **bold**.` into **Markdown**. The **Preview** should show a heading and a paragraph with a bold word. The **HTML** box should contain `<h1>Hello</h1>` and `<strong>bold</strong>`. **Copy** takes the HTML text; **Download** saves `document.html`.

If the preview differs from your website, check how that site styles HTML and which Markdown extensions it supports. This tool uses GitHub-flavored features and treats single line breaks as visible breaks, so other Markdown renderers may give different markup.

**Only paste Markdown you trust.** This tool puts the generated HTML directly into its live preview without sanitizing it; embedded raw HTML or event attributes could be unsafe. Do not put untrusted Markdown in this preview or publish the output without sanitizing it first.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
