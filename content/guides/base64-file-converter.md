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
about: Turn any file into a Base64 string, or a Base64 string back into a file. It is most
  useful for embedding a small image or font directly in a stylesheet as a data URI, or for
  working out what a data URI you were handed actually contains. The file is read locally
  through the File API.
faq:
- q: Is there a size limit?
  a: Whatever your browser can hold in memory. Base64 inflates a file by about a third, so
    a 3 MB image becomes roughly 4 MB of text.
- q: Should I embed images as data URIs?
  a: Only for small files. A data URI cannot be cached separately from the stylesheet it lives
    in and it has to be parsed along with it, so anything past a few kilobytes is usually
    better served as an ordinary file.
---

**Base64** writes file bytes as text so you can transport them in a text-only field. It is an encoding, not encryption. [Base64 File](/tools/base64-file-converter/) reads a selected file in the browser and can turn encoded text back into a download.

## Decode a known example

Paste `SGVsbG8=` into **Base64 → File** and choose **Decode to file**. The status should say **5 bytes ready**, and a **Download file** link appears. Download it: the default name is `decoded.bin`, and its contents are `Hello`. The `.bin` extension is used because bare Base64 has no filename or file-type information. An invalid string instead shows a decoding error; correct the input and try again.

## Encode your own small test file

Create a plain-text file containing exactly `Hello` (no trailing newline). Choose it under **File → Base64** and press **Encode file**. **Base64** should show `SGVsbG8=`. Enable **Include the data URL prefix**, then encode again; the output also includes a `data:` header and a comma before the Base64 text. That header records the browser-reported file type. **Copy** and **Download text** save the *text*, not the original file.

The tool processes file bytes in this tab. Avoid copying sensitive file contents into tickets or shared chats; anyone can decode Base64. Large files create even larger text output and use browser memory.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser File Tools](/guides/browser-file-tools/).
