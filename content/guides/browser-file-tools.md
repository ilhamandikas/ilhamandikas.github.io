---
title: Browser File Tools
description: Small browser-side file tasks such as zip creation and Base64 conversion,
  with privacy boundaries.
date: '2026-09-27'
tags:
- privacy
---

A file does not have to leave your computer just because you open it in a web page. Browsers can read a file you select, process it in memory, and offer a download. But that depends on how the particular tool is built; check its processing notes before using sensitive files.

## Keep the original

Work on a copy when you can. Image conversion may discard metadata; PDF operations may change signatures; text conversions can alter encoding. After downloading a result, open it with another program and check that it still contains what you expected.

## Watch the size

A large file can use much more memory than its size on disk, especially when decoded as an image or converted to Base64. If the tab slows down, try a smaller input instead of assuming the output is ready.

## Related tools

- [Base64 File](/tools/base64-file-converter/) — Turn any file into a Base64 data string, or decode one back to a file.
- [Zip Builder](/tools/zip-builder/) — Bundle several files into a zip archive in the browser, with a choice of compression level.
