---
title: HTTP Request Tester Guide
description: Send an HTTP request from the browser and inspect responses.
date: '2026-09-27'
tags:
- network
tool_guide_slug: http-request-tester
broader_guide:
  title: HTTP and API Debugging
  url: /guides/http-api-debugging/
---

A request builder that also speaks curl. Paste a curl command and it is parsed into method, URL, headers and body; fill the form in and you can copy the equivalent curl command back out. The request itself is sent from your browser with fetch, straight to the address you type — nothing is relayed through this site, and no server of ours sees it. That also means the browser's own rules apply, which is the one thing this page cannot work around.

## Open the tool

[Use HTTP Request Tester](/tools/http-request-tester/).

## Where your input goes

Some actions send a request to an endpoint you provide. Check what you are sending before using real data.

## Questions you might have

### Why did a request fail with a CORS error instead of returning a response?

Because a page cannot ignore the same-origin policy. The target has to allow cross-origin reads by answering with Access-Control-Allow-Origin, and if it does not, the browser blocks the reply before any script can read it. This is a rule of the browser, not a bug in the tool, and a static site has no server to proxy the request through — a proxy would also mean your headers, cookies and body passing through somebody else's machine. The page says this in the error rather than pretending the server is down.

### Which curl flags are supported?

The ones that describe a request: -X, -H, -d, --data-raw, --data-binary, --data-urlencode, --json, -G, -I, -u, -b, -A, -e, -m, --url and the common clusters such as -sSL. Flags that ask for something a page cannot do — -k, -o, --http2, --cert, --limit-rate — are named in a "Left out" list rather than silently dropped, and flags that ask for something the browser already does, such as --compressed or -L, are reported as adjustments instead. The two lists are kept separate on purpose: mixing them teaches you to ignore the one that matters.

### Is the curl command I export the same as the one I pasted?

For the parts that describe the request, yes — and where it differs, the page says so. Two examples it will tell you about: --data-binary sends no Content-Type at all in curl, while this form always sends one; and --data-urlencode encodes its value as a whole, where curl encodes only the part after the first =. Everything else, including -G moving data into the query string with the values percent-encoded, round-trips unchanged.

### Can I send cookies to another site?

Only if the request is same-origin or the target explicitly allows credentials. Cross-origin fetch with credentials requires the server to answer with Access-Control-Allow-Credentials as well as a specific origin, and never a wildcard. The credentials dropdown lets you ask; the browser decides.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
