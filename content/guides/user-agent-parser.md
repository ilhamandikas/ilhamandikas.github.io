---
title: User Agent Parser Guide
description: Read the browser, engine, OS and device from a user-agent string.
date: '2026-09-27'
tags:
- web
tool_guide_slug: user-agent-parser
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
---

Break a user-agent string into browser, version, engine and operating system, and explain what each part is for.

## Open the tool

[Use User Agent Parser](/tools/user-agent-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the browser detected wrongly?

Because user-agent strings lie, deliberately. Every browser claims to be Mozilla, and some reduce or freeze the rest of the string. Treat any detection as a hint, and feature-detect instead whenever you can.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
