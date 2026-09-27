---
title: Dates, Timestamps, and Time Zones
description: Dates, durations, timestamps, time zones, age calculations, stopwatches,
  and ETA estimates.
date: '2026-09-27'
tags:
- data
aliases:
- /posts/how-to-add-or-subtract-dates-without-calendar-counting/
- /posts/how-to-calculate-age-accurately/
- /posts/how-to-convert-time-zones-for-logs-and-meetings/
- /posts/how-to-read-unix-timestamps-without-guessing-seconds-or-milliseconds/
---

A date and an instant are not the same thing. “Monday at 9” needs a time zone before two people in different places can agree on when it happens. A Unix timestamp, by contrast, points to one instant.

## Keep the zone with the time

When arranging a meeting or reading a log, record the time zone or UTC offset alongside the clock time. An offset like `+07:00` describes that one timestamp; a named zone can also account for rule changes and daylight saving time.

## Watch boundaries

Adding 24 hours is not always the same as moving to the same local clock time tomorrow when daylight saving changes. For schedules, check the result around a zone's transition dates instead of assuming every day has the same number of local hours.

## Related tools

- [Age Calculator](/tools/age-calculator/) — Work out an age in years, months and days, with totals and the next birthday.
- [Chronometer](/tools/chronometer/) — A simple stopwatch with laps.
- [Date Calculator](/tools/date-calculator/) — Add or subtract days, weeks, months and years, or measure the duration and business days between two dates.
- [ETA Calculator](/tools/eta-calculator/) — Estimate a finish time from progress, elapsed time and remaining work.
- [Percentage Calculator](/tools/percentage-calculator/) — Work out percentages, increases and decreases.
- [Time Zone Converter](/tools/time-zone-converter/) — Read a timestamp from a log and see the same moment in UTC, Jakarta and other zones.
- [Timestamp Converter](/tools/timestamp-converter/) — Convert between Unix timestamps, ISO strings and local time.
- [User Agent Parser](/tools/user-agent-parser/) — Read the browser, engine, OS and device from a user-agent string.
