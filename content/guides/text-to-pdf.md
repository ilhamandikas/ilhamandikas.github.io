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
about: Turn a note, a receipt or a block of plain text into a PDF. The text is wrapped to
  the page width and carried onto a new page when the space runs out, with a choice of page
  size, font, size, margin and line spacing.
faq:
- q: Which characters can be drawn?
  a: The standard PDF fonts cover Latin-1, which is enough for English and Indonesian and
    most Western European text. Characters outside that range, such as emoji or Cyrillic,
    cannot be drawn and are left out, and the count is reported.
- q: How does the wrapping work?
  a: Each word is measured with the chosen font and size, and a line breaks when the next
    word would cross the margin. That keeps the layout correct even in a proportionally spaced
    font like Helvetica or Times.
- q: Can I use my own font?
  a: Not in this version. Embedding a font means shipping the font file, which would add weight
    to the page. The three standard fonts are always available and need nothing extra.
---

Turn a note, a receipt or a block of plain text into a PDF. The text is wrapped to the page width and carried onto a new page when the space runs out, with a choice of page size, font, size, margin and line spacing.

## Turn a note into a PDF

The **Text** box opens with a short receipt, and the **Result** panel reports **Pages**, **Lines** and **File size** as you type; with the sample text that is one page. Change **Page size**, **Font**, **Font size (pt)** (`12`), **Margin (mm)** (`20`) and **Line spacing** (`1.4`) and watch the layout follow, then switch **Page numbers** off and on to see the footer appear or vanish. Choose **Download PDF** to save `text.pdf`.

Words are measured with the chosen font, so a long line breaks at the margin rather than at a guess. The three standard fonts cover Latin-1, which is enough for English and Indonesian; characters outside that range, such as emoji or Cyrillic, cannot be drawn and the status reports how many were left out. There is no option to embed your own font in this version, and the input is capped at 200,000 characters.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With PDFs](/guides/working-with-pdfs/).
