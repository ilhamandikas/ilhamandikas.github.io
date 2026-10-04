---
title: HTML Editor Guide
description: A small rich-text editor that exports clean HTML.
date: '2026-09-27'
tags:
- web
tool_guide_slug: html-wysiwyg-editor
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
about: A small rich-text editor that writes HTML, with bold, italic, headings, lists and links,
  and shows the markup it produced so you can copy it out.
faq:
- q: Is the generated HTML clean?
  a: It is browser-generated, which is tidier than a word processor's output but still carries
    some inline styling. Expect to tidy it before using it in production.
---

A **rich-text editor** lets you style text with buttons instead of typing HTML tags. [HTML Editor](/tools/html-wysiwyg-editor/) uses your browser's editable page area and shows its current HTML as text below. The exact tags can differ between browsers.

## Write a small heading

Click inside **Editor**, replace the starter paragraph with `Demo note`, then select those words and choose **Heading**. **HTML** should update to include an `h2` heading (possibly with browser-specific markup). Use **Bold**, **Italic**, or list buttons on another test line. **Copy HTML** copies the markup currently shown, not an image. **Clear** removes formatting from selected text; it does not empty the whole editor.

**Only edit content you trust.** Pasted rich HTML and link URLs are not sanitized by this tool, and the editor uses browser `contenteditable` and `execCommand`. Do not paste untrusted HTML, open unknown links, or publish its generated markup without sanitizing and reviewing it. This page is a draft editor, not a safe viewer for hostile HTML.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
