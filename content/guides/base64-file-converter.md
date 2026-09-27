---
title: Base64 File Guide
description: Turn any file into a Base64 data string, or decode one back to a file.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: base64-file-converter
broader_guide:
  title: Browser File Tools
  url: /guides/browser-file-tools/
---

Turn any file into a Base64 string, or a Base64 string back into a file. It is most useful for embedding a small image or font directly in a stylesheet as a data URI, or for working out what a data URI you were handed actually contains. The file is read locally through the File API.

## Open the tool

[Use Base64 File](/tools/base64-file-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is there a size limit?

Whatever your browser can hold in memory. Base64 inflates a file by about a third, so a 3 MB image becomes roughly 4 MB of text.

### Should I embed images as data URIs?

Only for small files. A data URI cannot be cached separately from the stylesheet it lives in and it has to be parsed along with it, so anything past a few kilobytes is usually better served as an ordinary file.

## Related guide

For more background, read [Browser File Tools](/guides/browser-file-tools/).
