---
title: HTTP Status Codes Guide
description: Reference list of HTTP response status codes and their meaning.
date: '2026-09-27'
tags:
- web
tool_guide_slug: http-status-codes
broader_guide:
  title: HTTP and API Debugging
  url: /guides/http-api-debugging/
---

A searchable reference of HTTP response status codes, what each one means and when a server should return it.

## Open the tool

[Use HTTP Status Codes](/tools/http-status-codes/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### When should I return 401 instead of 403?

401 means the request is unauthenticated — the client should try again with credentials. 403 means it is authenticated but not allowed, and trying again will not help.

### Does 200 always mean success?

For a GET, usually. For an API, a 200 carrying an error object is a common and unhelpful habit. Prefer a status code that matches the outcome.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
