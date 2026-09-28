---
title: PDF Page Extractor Guide
description: Keep only the pages you choose from a PDF and download the rest as a new file.
date: '2026-09-27'
tags:
- web
tool_guide_slug: pdf-page-extractor
broader_guide:
  title: Working With PDFs
  url: /guides/working-with-pdfs/
---

[PDF Page Extractor](/tools/pdf-page-extractor/) copies selected pages from a PDF into a **new** file in your browser. It does not alter the original file on disk.

## Keep just one page

Choose a disposable two-page PDF under **PDF file**. In **Pages to keep**, enter `2`. After processing, **Source** should say `2 pages`, **Kept** should say `1 of 2 pages`, and **Output** should show the new file size. Choose **Download** to save it under the **Output name** (by default `extracted.pdf`). Open the downloaded file and check it contains only the second page. Typing `3` for this file instead reports a page-range error and does not offer a new download until you correct it.

For more pages, `1-3, 7, 10-` means the first three, page seven, and page ten to the end; selected pages are sorted into source order and duplicate numbers are collapsed. Do not rely on removing a page to remove **all** sensitive content, metadata, links, or annotations without inspecting the resulting PDF. The tool cannot open an encrypted PDF without a compatible reader and permission.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How do I write a page range?

Separate the parts with commas: 1-3, 7, 10- means the first three pages, page seven and everything from page ten onward. A leading dash as in -4 means from the first page to the fourth.

### Does the original file change?

No. The file on your disk is only read. The result is a separate download, and the original keeps all of its pages.

### Do links and form fields survive?

Do not assume either way. This tool copies pages using pdf-lib, and annotations, forms, links, and metadata may need separate inspection in the exported PDF. Review the result before sending it.

## Related guide

For more background, read [Working With PDFs](/guides/working-with-pdfs/).
