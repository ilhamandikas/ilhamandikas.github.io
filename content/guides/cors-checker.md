---
title: CORS Checker Guide
description: Check whether a URL can be read from this browser origin and inspect visible
  CORS headers.
date: '2026-09-27'
tags:
- network
tool_guide_slug: cors-checker
broader_guide:
  title: Debugging CORS Without Guessing
  url: /guides/debugging-cors/
about: Check whether a URL can be read by JavaScript from this site origin. The tool sends
  a browser fetch request and, where possible, an OPTIONS-style probe, then reports what the
  browser allowed the page to see. It cannot spoof arbitrary Origin headers because browsers
  deliberately do not allow that.
faq:
- q: Why does it say blocked without showing the server headers?
  a: When CORS blocks a response, the browser hides the response from JavaScript. That is
    the rule this tool is testing, so sometimes the only honest answer is that the page could
    not read the details.
---

A web page sometimes asks another website for data. That other website may answer, but the browser can still refuse to show the answer to the page. This browser rule is called **CORS**. [CORS Checker](/tools/cors-checker/) helps you see what this browser can read from a URL. It does not change that website's settings.

## Check an endpoint you control

Use a test API you are allowed to contact. Do not use a private address or a production endpoint just to follow this example: clicking **Check** makes a real network request.

1. Put your test endpoint's full `https://` URL in **URL**. Leave **Method** on **GET** for the first check. GET asks the server for data.
2. Leave **Origin to check** as the value the page filled in. An *origin* is a page's scheme, host, and port. The tool runs on ilham.dev, so it can test what **this page** can read, not pretend to be your app on another domain.
3. Leave **Request headers** empty for now and choose **Check**.
4. Look at **Simple request**. If it says **Allowed**, this browser could read a response; its HTTP status is shown too. If it says **Blocked by CORS, network, DNS, TLS, or server refusal**, the result alone cannot tell which of those caused the failure. Check the browser's Network tab and the server logs next.

The **OPTIONS probe** is a second request the tool tries to send. It is a clue, not proof that your app's real preflight request works. The browser decides which headers a page may send and read; it may hide the server's CORS headers even if the server replied.

## If your own app still fails

Run a request from the app's real page and compare its origin, method, and headers in the browser's Network tab. A successful test from ilham.dev does **not** prove that another page is allowed. CORS is decided by the server's response to that page's origin. For the bigger picture, read the related guide below.

## Where your input goes

When you choose **Check**, your browser sends requests to the URL you entered. That server can see the request. Do not test a sensitive endpoint unless you are allowed to contact it. The tool does not need a token for the example above.

## Related guide

For more background, read [Debugging CORS Without Guessing](/guides/debugging-cors/).
