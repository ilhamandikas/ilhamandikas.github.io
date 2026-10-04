---
title: ASCII Text Guide
description: Render text as large ASCII-art banners.
date: '2026-09-27'
tags:
- text
tool_guide_slug: ascii-text-drawer
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
about: Render text as large ASCII-art banners using a bundled FIGlet-compatible font, and
  copy the result as plain text. It is for README headers, code comments and terminal output.
faq:
- q: Will the banner line up everywhere?
  a: Only in a monospaced font. In a proportional font the columns collapse, which is why
    the preview here is monospaced.
---

**ASCII art** arranges plain-text characters to look like large letters. [ASCII Text](/tools/ascii-text-drawer/) uses bundled FIGlet fonts; it does not turn your text into an image.

## Make a short banner

Replace **Text** with `Hi`. Leave **Font** on **Standard** and **Width** at `80`. **Result** should show several lines of large letters made from text characters. Choose **Big** to change their shape; **Width** controls when longer text wraps. **Copy** takes the displayed characters so you can paste them into a code block or a terminal message. Empty **Text** clears the result.

Paste the result into a **monospaced** font or a fenced code block. In a proportional font, different character widths break the alignment. Test a long banner at the actual width of the place you will publish it, especially on narrow screens.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
