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

## Read a log timestamp in every zone

Type the timestamp the **Date and time** field suggests, `Sep 26, 2026 @ 00:24:20.437`, and leave **The time above is in** at its default, `UTC`. Every row fills in at once: **Instant (UTC)** reads `2026-09-26T00:24:20.437Z`, **Unix (s)** reads `1789863860`, and below those one row per zone shows the same instant as that zone's wall clock with its offset and the weekday. The **Jakarta · WIB** row is `07:24:20`, and **New York** is `20:24:20` on the previous day.

Press **Use current UTC time** to fill the field with now, or paste a value you are actually debugging. The parser accepts ISO-like dates, month-name forms, bare dates, Unix seconds or milliseconds, and anything carrying an explicit `Z` or `+07:00` — a value with its own offset is an absolute instant and the source selector is ignored. Switch **The time above is in** to `Local (this browser)` for a log written on your own machine in local time.

The offset is looked up for the exact instant you entered, not for today, so a time that falls near a daylight-saving change resolves with the rule in force at that moment. **Copy table** copies the plain-text version, which drops neatly into a ticket.

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
