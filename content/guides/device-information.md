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
---

Show what the browser reports about the current device: screen and viewport size, pixel ratio, platform, language, timezone, CPU core count, memory where it is exposed, and whether the device claims to support touch.

## Open the tool

[Use Device Information](/tools/device-information/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the reported platform sometimes wrong?

User-agent strings are unreliable, and some browsers deliberately reduce them for privacy. Treat what you see as a hint rather than a fact.

## Related guide

For more background, read [Browser Debugging Utilities](/guides/browser-debugging/).
