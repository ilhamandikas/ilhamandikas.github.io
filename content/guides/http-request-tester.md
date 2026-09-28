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

A request builder that sends the request from your browser with fetch, straight to the address you type, and shows the status, headers and body that come back. Nothing is relayed through this site and no server of ours sees the request. Because the request is made by the browser, the browser's own rules apply — most visibly the same-origin policy, which is the one thing this page cannot work around. If you want to paste and explain a curl command instead, use the [curl Tester](/tools/curl-tester/); the two tools are deliberately kept separate.

## Send a request and read the reply

Pick a **Method**, type a **URL** with its scheme, and press **Send**. To try it without touching anyone else's service you can point at a small public endpoint such as `https://httpbin.org/get` — the request leaves *your* browser and goes straight there, and nothing passes through this site.

Leave **Body** on **No body** with an empty **Headers** box and watch the **Response** panel: the meta line shows the status, the round-trip time and the byte count, **Headers** lists what came back, and **Body** is pretty-printed when it is JSON. Switch **Body** to **JSON**, add `Content-Type: application/json` and a small body, and change **Method** to `POST`; the request-body field appears only when a body type is selected, and a `GET` or `HEAD` carrying a body is refused with a note rather than sent. **Timeout** defaults to 15000 ms and **Cancel** stops a request that is still open.

If no reply arrives, read the error instead of assuming the server is down: the page separates a timeout from the browser blocking a cross-origin reply it was not allowed to read. That block is the same-origin policy, and no static page can work around it. A header line without a colon is reported and left out rather than quietly becoming part of the request, and **Copy body** and **Copy headers** take what you received. Leave **Send cookies** off unless a same-origin or credentials-enabled target explicitly allows it.

## Where your input goes

Some actions send a request to an endpoint you provide. Check what you are sending before using real data.

## Questions you might have

### Why did a request fail with a CORS error instead of returning a response?

Because a page cannot ignore the same-origin policy. The target has to allow cross-origin reads by answering with Access-Control-Allow-Origin, and if it does not, the browser blocks the reply before any script can read it. This is a rule of the browser, not a bug in the tool, and a static site has no server to proxy the request through — a proxy would also mean your headers, cookies and body passing through somebody else's machine. The page says this in the error rather than pretending the server is down.

### Can I paste a curl command here?

No — the form is the only way in on this page. To paste, explain and rebuild a curl command, use the [curl Tester](/tools/curl-tester/), which parses one into method, URL, headers and body and reports the flags it cannot honour instead of dropping them silently. Keeping the two tools separate means the request builder does exactly one thing.

### Why was the body left off my GET request?

Because a GET or HEAD is defined not to carry one. If you selected a body type and typed a body while the method was GET or HEAD, the page refuses to send and tells you the body was left off, rather than sending a request that no server would interpret the way you expect. Switch to POST, PUT or PATCH for a request with a body.

### Can I send cookies to another site?

Only if the request is same-origin or the target explicitly allows credentials. Cross-origin fetch with credentials requires the server to answer with Access-Control-Allow-Credentials as well as a specific origin, and never a wildcard. The Send cookies checkbox lets you ask; the browser decides.

## Related guide

For more background, read [HTTP and API Debugging](/guides/http-api-debugging/).
