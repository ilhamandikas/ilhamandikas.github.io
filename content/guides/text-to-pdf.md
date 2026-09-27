---
title: Text to PDF Guide
description: Write plain text out as a PDF, with wrapping, page size, margins and page numbers.
date: '2026-09-27'
tags:
- web
tool_guide_slug: text-to-pdf
broader_guide:
  title: Working With PDFs
  url: /guides/working-with-pdfs/
---

Turn a note, a receipt or a block of plain text into a PDF. The text is wrapped to the page width and carried onto a new page when the space runs out, with a choice of page size, font, size, margin and line spacing.

## Open the tool

[Use Text to PDF](/tools/text-to-pdf/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Which characters can be drawn?

The standard PDF fonts cover Latin-1, which is enough for English and Indonesian and most Western European text. Characters outside that range, such as emoji or Cyrillic, cannot be drawn and are left out, and the count is reported.

### How does the wrapping work?

Each word is measured with the chosen font and size, and a line breaks when the next word would cross the margin. That keeps the layout correct even in a proportionally spaced font like Helvetica or Times.

### Can I use my own font?

Not in this version. Embedding a font means shipping the font file, which would add weight to the page. The three standard fonts are always available and need nothing extra.

## Related guide

For more background, read [Working With PDFs](/guides/working-with-pdfs/).
