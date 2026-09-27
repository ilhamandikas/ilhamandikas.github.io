---
title: Basic Auth Header Guide
description: Build an HTTP Basic Authorization header from a user and password.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: basic-auth-generator
broader_guide:
  title: HTTP and API Debugging
  url: /guides/http-api-debugging/
---

Build the Authorization: Basic header value from a username and password, and optionally produce a ready-to-use curl command. The encoding is plain Base64, which is exactly why it is only safe over HTTPS.

## Open the tool

[Use Basic Auth Header](/tools/basic-auth-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is Basic authentication encrypted?

No. The credentials are Base64-encoded, which anyone can reverse. They are protected only by the TLS connection carrying them, so never use it over plain HTTP.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
