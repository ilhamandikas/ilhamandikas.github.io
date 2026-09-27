---
title: Network Info Guide
description: Show what this browser exposes about its connection, device, screen and locale.
date: '2026-09-27'
tags:
- network
tool_guide_slug: network-info
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

A snapshot of the connection and device facts a browser exposes to a page: online state, the Network Information values where they exist, screen and viewport size, pixel ratio, language, CPU threads, memory hint and time zone. It is read locally and never uploaded.

## Open the tool

[Use Network Info](/tools/network-info/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why are some values blank?

Support varies. The Network Information API, deviceMemory and hardwareConcurrency are not in every browser, and some are rounded or capped for privacy. A dash means the browser did not provide a value, not that it is zero.

### How accurate is the downlink and round-trip time?

They are estimates the browser derives from recent traffic and are deliberately coarse. They are fine for choosing an image size or deciding whether to prefetch, but not for measuring a connection.

### Does this reveal my IP address or location?

No. The page only reads values the browser already exposes to JavaScript. It does not call an IP service, does not use geolocation and does not make a network request.

### Why does the time zone matter?

It is handy when you are debugging a timestamp bug and need to know what the browser thinks local time is. It comes from Intl, so it reflects the system setting rather than anything you typed.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
