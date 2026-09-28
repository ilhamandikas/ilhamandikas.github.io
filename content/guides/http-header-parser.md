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

HTTP **headers** are lines of information that travel with a request or response. A line has a name, a colon, and a value. [HTTP Header Parser](/tools/http-header-parser/) separates a pasted block into rows so you can read it without overlooking repeated names.

## Read a harmless example

Paste this into **Raw header block**:

```text
HTTP/1.1 200 OK
Content-Type: application/json
X-Demo: one
X-Demo: two
```

Under **Summary**, you should see the status line and **Headers: 3**. The first line is not counted as a header; the other three lines are. Under **Headers**, it keeps both `X-Demo` values; the second name is marked **(repeated)**. This is useful because repeated headers are not always safe to merge.

The tool does not contact the URL or server that produced a block. It only reads what you paste.

## Check before pasting real headers

A block from a browser or `curl` may include `Authorization`, cookies, or internal hostnames. Remove secrets before putting it in a screenshot or sending it to someone else. This page parses locally, but copying its visible result into a ticket can still disclose that data. A line without a colon is marked unrecognised instead of being guessed.

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
