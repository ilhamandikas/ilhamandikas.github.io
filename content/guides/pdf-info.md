---
title: PDF Page Counter and Info Guide
description: Read a PDF to see its page count, page sizes, version and document information.
date: '2026-09-27'
tags:
- web
tool_guide_slug: pdf-info
broader_guide:
  title: Working With PDFs
  url: /guides/working-with-pdfs/
about: 'Open a PDF to see what it is made of: how many pages there are, the exact size of
  each one, the format version and the document information the producer wrote, such as the
  title and the author.'
faq:
- q: What are the point and millimetre figures?
  a: A PDF measures its pages in points, where seventy-two points make an inch. Both units
    are shown because print shops usually ask in millimetres while the file stores points.
- q: Why is some document information missing?
  a: The title, author and subject are optional fields. Plenty of producers leave them empty
    or fill in only a producer name, and this page shows what is actually there rather than
    guessing.
- q: Can it read an encrypted PDF?
  a: A password-protected PDF cannot be parsed without the password, so the page says so instead
    of showing an empty report. Removing the password with the owner's permission has to happen
    in a reader that can open it.
---

A **PDF page size** is usually stored in points (72 points per inch). [PDF Page Counter and Info](/tools/pdf-info/) opens a file in your browser to list its page count, dimensions in points and approximate millimeters, PDF version, and any embedded document information. It does not upload the file.

## Check a one-page test PDF

Make or download a disposable one-page PDF containing only the word `Demo`. Choose it with **PDF file**; there is no separate Run button. If it can be read, **Report** should show **Pages: 1 page**. In the **Pages** table, find page 1's width, height, and **Orientation** (Portrait, Landscape, or Square according to the page dimensions). **Version** comes from the PDF header. If your file has no title or author in its internal metadata, the report does not invent them.

A PDF can contain personal metadata even if the visible page looks harmless; review fields before sharing a screenshot. Only the first **300 page-size rows** are displayed for a longer file, though the overall page count covers the document. An encrypted or damaged file shows an error rather than a report.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With PDFs](/guides/working-with-pdfs/).
