---
title: MIME Types Guide
description: Look up the MIME type for a file extension.
date: '2026-09-27'
tags:
- web
tool_guide_slug: mime-types
broader_guide:
  title: HTTP and API Debugging
  url: /guides/http-api-debugging/
---

A **MIME type** is a label telling a browser or another program what kind of content it received. For example, a server might send `Content-Type: application/json` for JSON data. [MIME Types](/tools/mime-types/) is a small table of common extensions and labels.

## Find a type from a file name

Type `json` in the search box. Look for `.json` next to `application/json`. Type `png` and look for `.png` next to `image/png`. You can also search for part of a type: `image` shows several image extensions. This is a **reference list**, not a test of any file you own.

## Do not trust the extension alone

Renaming `photo.txt` to `photo.png` does not turn text into a picture. This table tells you a **usual** type for an extension, not what bytes are inside a file or what a server actually sent. If a download behaves oddly, check its response `Content-Type` and the file itself. The table does not upload or open your file.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does one extension have two types?

Because of history. .js is text/javascript today, but application/javascript still appears in older configurations, and servers generally accept both.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
