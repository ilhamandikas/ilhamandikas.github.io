---
title: Debugging CORS Without Guessing
description: A practical way to reason about CORS errors, preflight requests, credentials,
  and browser behavior.
date: '2026-09-27'
tags:
- web
aliases:
- /posts/how-to-debug-cors-without-guessing/
---

A CORS error means the browser refused to let a page read a response from a different origin. An origin is the combination of scheme, host, and port: `https://example.com` and `http://example.com` are different origins. CORS is enforced by browsers; it is not an API authentication system.

## Look at the request before changing headers

Open the browser's Network tab and find the failing request. Check its `Origin` header and whether an `OPTIONS` request happened first. That preliminary request is called a *preflight*: the browser asks the server whether the real request is allowed. If preflight fails, your application code may never see the actual response.

## Check the response that failed

The server must return the appropriate `Access-Control-Allow-Origin` value. For a preflight, it may also need to allow the requested method and headers. If credentials are involved, a wildcard origin is not allowed; the server needs a specific allowed origin and the appropriate credentials response header. Fix this on the server serving the request, not by adding `Access-Control-Allow-Origin` to the browser's request.

A command-line request can help confirm the server responds, but success in `curl` does not prove a browser will allow it. Test again from the actual page origin.

## Related tools

- [CORS Checker](/tools/cors-checker/) — Check whether a URL can be read from this browser origin and inspect visible CORS headers.
