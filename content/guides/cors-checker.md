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
---

Check whether a URL can be read by JavaScript from this site origin. The tool sends a browser fetch request and, where possible, an OPTIONS-style probe, then reports what the browser allowed the page to see. It cannot spoof arbitrary Origin headers because browsers deliberately do not allow that.

## Open the tool

[Use CORS Checker](/tools/cors-checker/).

## Where your input goes

Some actions send a request to an endpoint you provide. Check what you are sending before using real data.

## Questions you might have

### Why does it say blocked without showing the server headers?

When CORS blocks a response, the browser hides the response from JavaScript. That is the rule this tool is testing, so sometimes the only honest answer is that the page could not read the details.

## Related guide

For more background, read [Debugging CORS Without Guessing](/guides/debugging-cors/).
