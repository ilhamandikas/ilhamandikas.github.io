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

A timestamp is a way to record **one moment**. Unix time counts from 1 January 1970 in UTC. Some systems count seconds; others count milliseconds, which are thousandths of a second. [Timestamp Converter](/tools/timestamp-converter/) shows both counts and readable dates.

## Convert a number you can check

1. Type `1700000000` in **Timestamp or date**. Leave **Numeric input is** on **seconds**.
2. Look at **ISO 8601**. You should see `2023-11-14T22:13:20.000Z`. The `Z` means the time is in UTC, not your own time zone.
3. Look at **Unix (ms)**. It should say `1700000000000`: the same moment measured in milliseconds.
4. Replace the input with `1700000000000` and switch **Numeric input is** to **milliseconds**. **ISO 8601** should show the same moment as before.

**Local** may show another clock time or even another date. That is normal: it uses the time zone of the browser you are using. **Relative** changes with the current time, so do not expect a fixed value there.

## If the date looks wrong

Check **Numeric input is** first. Reading milliseconds as seconds can produce an impossible date; reading seconds as milliseconds can land near 1970. For text input, try a full date with a zone, such as `2023-11-14T22:13:20Z`. An unclear date like `11/14/23` can be interpreted differently, so do not rely on it.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is my timestamp in seconds or milliseconds?

A ten-digit number is seconds; a thirteen-digit number is milliseconds. JavaScript's Date.now() returns milliseconds, while most Unix tooling works in seconds.

### Why is my date off by a day?

Almost always a timezone issue. The converter shows UTC and your local zone side by side so you can see which one you were reading.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
