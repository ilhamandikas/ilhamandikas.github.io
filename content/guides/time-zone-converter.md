---
title: Time Zone Converter Guide
description: Read a log timestamp in one zone and see the same moment in UTC, Jakarta and
  others.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: time-zone-converter
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
---

Paste a timestamp the way it appears in a log — for example "Sep 26, 2026 @ 00:24:20.437" — pick the zone it was written in, and every row shows that same instant in another zone. The default source is UTC because that is what most servers and container runtimes log, which is exactly the thing that is easy to forget when reading an incident. The conversion uses the browser's own time zone database, so daylight-saving changes are handled at the instant you enter, not by a fixed offset.

## Open the tool

[Use Time Zone Converter](/tools/time-zone-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the default source UTC?

Most servers, containers and structured loggers write UTC. Setting the default to UTC means a bare timestamp is read the way the machine that wrote it meant it. Switch the source to Local if the log was written on your own machine in local time.

### Which input formats are understood?

ISO-like dates such as 2026-09-26 00:24:20.437, month-name forms such as Sep 26, 2026 @ 00:24:20.437 or 26 Sep 2026 00:24:20, dates without a time, Unix seconds or milliseconds, and anything the browser can parse when it carries an explicit offset such as Z or +07:00. A value with an offset is taken as an absolute instant and the source-zone selector is ignored.

### How do daylight-saving changes affect the result?

The zone offset is looked up for the exact instant you entered, not for today. If a wall time falls in the hour that repeats or is skipped at a DST change, the page resolves it with the offset that is in force at that moment.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
