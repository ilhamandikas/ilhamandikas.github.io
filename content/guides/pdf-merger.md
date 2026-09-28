---
title: PDF Merger Guide
description: Join several PDFs into one document, in the order you set.
date: '2026-09-27'
tags:
- web
tool_guide_slug: pdf-merger
broader_guide:
  title: Working With PDFs
  url: /guides/working-with-pdfs/
---

Combine several PDFs into a single document. The files are listed in the order they will appear, and the order can be changed before the result is built, which matters when a cover page or an appendix has to land in the right place.

## Merge two throwaway PDFs

Choose two disposable PDFs with **PDF files**. The **Order** panel lists them with their page counts, and the status reports the total. Use **Up** and **Down** in the **Actions** column to move a document, and **Remove** to drop one; each change rebuilds the result and updates the **Pages** total. Choose **Download merged PDF** to save it under **Output name** (default `merged.pdf`).

Files are taken in the order the picker returned them, which is usually the order your file browser shows, so set the order explicitly rather than assuming it. Each page keeps its own size, so a mixed document has pages of different dimensions. A file that cannot be read, such as an encrypted PDF, is named in the status and skipped while the rest are merged. The original files are not modified.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Can I merge PDFs with different page sizes?

Yes. Each page keeps its own size, so a mixed document will have pages of different dimensions. Readers and printers handle that; a print shop may prefer a consistent size.

### What happens if one file cannot be read?

That file is named in the status and skipped, while the rest are merged. An encrypted PDF is the usual reason, since it cannot be parsed without its password.

### Is the order the order I selected them in?

Files are taken in the order the picker returned them, which is usually the order shown in your file browser. Use the Up and Down buttons to set the order you actually want.

## Related guide

For more background, read [Working With PDFs](/guides/working-with-pdfs/).
