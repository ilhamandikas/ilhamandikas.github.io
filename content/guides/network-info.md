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

[Network Info](/tools/network-info/) displays a local snapshot of what the browser reports about your connection and device. It does **not** test a remote host, discover a private IP address, or measure your real download speed.

## Read and refresh the snapshot

Open the tool. Under **Details**, find **Online**, **Screen**, **Viewport**, and **Time zone**. Resize the browser window and press **Refresh**: **Viewport** should reflect the new page area, while the physical **Screen** value usually stays the same. Where supported, **Downlink** is shown in Mbps and **Round-trip time** in milliseconds; other browsers display a dash because they do not expose those estimates.

**Online: Yes** means the browser thinks it has network connectivity, not that `example.com` or your API is reachable. The network information values are coarse hints, not speed-test results. The page reads browser properties locally; consider what user-agent, locale, and screen details you include before posting a screenshot.

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
