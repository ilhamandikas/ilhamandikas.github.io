---
title: HTTP Header Parser Guide
description: Turn a pasted header block into a clean table, including cookies and repeated
  fields.
date: '2026-09-27'
tags:
- network
tool_guide_slug: http-header-parser
broader_guide:
  title: HTTP and API Debugging
  url: /guides/http-api-debugging/
---

Paste a raw header block from curl, a proxy log or the browser network panel and the page turns it into a clean table. A status line is optional, folded continuation lines are rejoined, and repeated fields such as Set-Cookie are kept and marked so nothing is silently dropped.

## Open the tool

[Use HTTP Header Parser](/tools/http-header-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why are some headers marked as repeated?

Because the same field name appears more than once. Some headers, like Set-Cookie, are supposed to repeat and must not be merged; others are combined by the recipient. The label shows you which is which before you act on the values.

### How are folded lines handled?

Older systems wrapped long header values onto the next line with leading whitespace. The parser treats a line that starts with a space or tab as a continuation of the previous header and joins it back with a single space, which is what the HTTP rules say to do.

### What is the status line?

The HTTP/1.1 200 OK line that opens a response. It is optional here, so you can paste just the headers, but when it is present it is reported separately and not mistaken for a header.

### Is anything sent over the network?

No. The text you paste is parsed in the page. That is deliberate: header blocks often carry cookies, tokens and internal hostnames that should not leave your machine.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
