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

When a browser asks a server for something, the server sends back a **status code**. The first digit gives you a clue: `2xx` is usually a successful response, `4xx` often means the request needs attention, and `5xx` points to a server-side failure. [HTTP Status Codes](/tools/http-status-codes/) is a short list to help you read the code.

## Look up a missing page

Open the tool and type `404` in the search box. The list should narrow to **404 Not Found**. This means the server did not find the resource at that address. Check the URL and the response body before assuming the entire server is down.

Now search for `502`. You should see **Bad Gateway**. That often means a server acting as a gateway or proxy did not get a usable response from the service behind it. Check the proxy and the upstream service rather than only the page in your browser.

## What this reference does not tell you

Search works by **number or status name**, not a full explanation of every cause. The same code can come from different failures. This page does not make a request to your server; inspect the actual request and response when debugging. Read the related HTTP guide for a workflow.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### When should I return 401 instead of 403?

`401` means the request lacks valid authentication credentials for the resource; a client may need to authenticate or renew them. `403` means the server understood the request but refuses it. Do not assume a `403` always means the client was successfully authenticated; check your application's access rules.

### Does 200 always mean success?

For a GET, usually. For an API, a 200 carrying an error object is a common and unhelpful habit. Prefer a status code that matches the outcome.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
