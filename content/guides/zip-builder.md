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
---

Pick a handful of files and get one zip back, without installing anything. The archive is assembled in the page from the bytes already on your disk, so nothing is uploaded, and a compression level lets you trade a little time for a smaller download.

## Open the tool

[Use Zip Builder](/tools/zip-builder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why do two files with the same name both survive?

A zip cannot hold two entries under one name, so the second becomes name-1, then name-2 and so on. That keeps both files instead of quietly losing one.

### Which compression level should I use?

The balanced level suits almost everything. Store only is quicker and is the right choice for files that are already compressed, such as a JPEG or another zip, where no level can help.

### Is there a size limit?

Only what your device's memory allows, since the archive is built in the page. A few hundred megabytes of photographs is fine on a desktop and heavy on a phone.

## Related guide

For more background, read [Browser File Tools](/guides/browser-file-tools/).
