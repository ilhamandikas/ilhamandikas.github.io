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
about: 'Build the Authorization: Basic header value from a username and password, and optionally
  produce a ready-to-use curl command. The encoding is plain Base64, which is exactly why
  it is only safe over HTTPS.'
faq:
- q: Is Basic authentication encrypted?
  a: No. The credentials are Base64-encoded, which anyone can reverse. They are protected
    only by the TLS connection carrying them, so never use it over plain HTTP.
---

**HTTP Basic authentication** turns `username:password` into Base64 text for an HTTP `Authorization` header. [Basic Auth Header](/tools/basic-auth-generator/) produces the *value* of that header, not a curl command. Base64 is reversible; it does not encrypt the credentials.

## Check the default example

The page starts with **Username** `user` and **Password** `pass`. The **Authorization header** box should show `Basic dXNlcjpwYXNz`. The letters after `Basic ` are Base64 for `user:pass`. Change either field and the output updates automatically. **Copy** takes the full header value; **Copy prefix** copies only `Basic `, not your credentials.

When entering a value in an HTTP client, use header name `Authorization` and the tool's entire output as the value. For a real account, only send this header over **HTTPS** to a service you trust. The password is visible in this page's plain-text field and can remain in your clipboard after copying; prefer disposable credentials for learning.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
