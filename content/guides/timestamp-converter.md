---
title: Timestamp Converter Guide
description: Convert between Unix timestamps, ISO strings and local time.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: timestamp-converter
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
---

Convert between Unix timestamps, ISO 8601 strings and local time, in both directions. It handles seconds and milliseconds, which is the mix-up that produces dates in 1970 or in the year 55000.

## Open the tool

[Use Timestamp Converter](/tools/timestamp-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is my timestamp in seconds or milliseconds?

A ten-digit number is seconds; a thirteen-digit number is milliseconds. JavaScript's Date.now() returns milliseconds, while most Unix tooling works in seconds.

### Why is my date off by a day?

Almost always a timezone issue. The converter shows UTC and your local zone side by side so you can see which one you were reading.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
