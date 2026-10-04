---
title: Zip Builder Guide
description: Bundle several files into a zip archive in the browser, with a choice of compression
  level.
date: '2026-09-27'
tags:
- web
tool_guide_slug: zip-builder
broader_guide:
  title: Browser File Tools
  url: /guides/browser-file-tools/
about: Pick a handful of files and get one zip back, without installing anything. The archive
  is assembled in the page from the bytes already on your disk, so nothing is uploaded, and
  a compression level lets you trade a little time for a smaller download.
faq:
- q: Why do two files with the same name both survive?
  a: A zip cannot hold two entries under one name, so the second becomes name-1, then name-2
    and so on. That keeps both files instead of quietly losing one.
- q: Which compression level should I use?
  a: The balanced level suits almost everything. Store only is quicker and is the right choice
    for files that are already compressed, such as a JPEG or another zip, where no level can
    help.
- q: Is there a size limit?
  a: Only what your device's memory allows, since the archive is built in the page. A few
    hundred megabytes of photographs is fine on a desktop and heavy on a phone.
---

Pick a handful of files and get one zip back, without installing anything. The archive is assembled in the page from the bytes already on your disk, so nothing is uploaded, and a compression level lets you trade a little time for a smaller download.

## Bundle two small files

Choose one or two throwaway files with **Files**. The **Contents** table should list each one with the name it will carry inside the zip and its size, and the **Archive** line shows the total compressed size. Switch **Compression** to **Store only, no compression**, then to **Fastest**, and watch the **Archive** size change. Choose **Download zip** to save the archive under **Archive name**, and **Remove** a row to drop a file.

A zip cannot hold two entries under one name, so a second file with the same name becomes `name-1`, then `name-2`, and the table shows the rename rather than losing a file. **Store only** is the right choice for files that are already compressed, such as JPEGs or another zip. The archive is assembled in memory, so a few hundred megabytes is fine on a desktop but heavy on a phone, and the files are never uploaded.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser File Tools](/guides/browser-file-tools/).
