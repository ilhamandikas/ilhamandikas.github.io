---
title: Device Information Guide
description: Show what the browser reports about the current device.
date: '2026-09-27'
tags:
- web
tool_guide_slug: device-information
broader_guide:
  title: Browser Debugging Utilities
  url: /guides/browser-debugging/
about: 'Show what the browser reports about the current device: screen and viewport size,
  pixel ratio, platform, language, timezone, CPU core count, memory where it is exposed, and
  whether the device claims to support touch.'
faq:
- q: Why is the reported platform sometimes wrong?
  a: User-agent strings are unreliable, and some browsers deliberately reduce them for privacy.
    Treat what you see as a hint rather than a fact.
---

[Device Information](/tools/device-information/) shows a **snapshot** of what this browser reports about your screen and environment. It does not scan the hardware or detect your exact device model.

## Compare screen and viewport

Open the tool and look for **Screen** and **Viewport**. **Screen** reports display dimensions and pixel ratio; **Viewport** is the browser's available page area. Resize the browser window, press **Refresh**, and compare: the viewport should change even if the physical screen stays the same. Values depend on your device, so there is no fixed expected number. **CPU threads**, **Device memory**, and **Touch points** are browser hints, not guaranteed hardware specifications.

**Online** reflects `navigator.onLine`, which is not proof that a particular site or API is reachable. **Reduced motion** and **Dark mode** reflect browser preferences, not a diagnosis. This page reads local browser properties; avoid posting full user-agent, locale, or screen details if you do not want to disclose them.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
