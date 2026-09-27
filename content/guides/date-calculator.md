---
title: Date Calculator Guide
description: Add or subtract days, weeks, months and years, or measure the duration and business
  days between two dates.
date: '2026-09-27'
tags:
- math
tool_guide_slug: date-calculator
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
---

Two calculators in one page. The difference mode measures the gap between two dates in calendar years, months and days as well as total days, weeks, months and years, with an option to include the end date and to count business days only. The add/subtract mode shifts a date by a number of days, weeks, months, years or business days and reports the weekday, ISO week and day of the year.

## Open the tool

[Use Date Calculator](/tools/date-calculator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the calendar difference not just the total days?

A month is not a fixed number of days, so 31 Jan to 1 Mar is one month and one day, not 29 days. The calendar figure keeps the day of the month and clamps to the last valid day when a month is shorter, which is what people mean by a one-month difference.

### Does including the end date change the calendar difference?

No. Include the end date adds one day to the total-day counts, which is what you want for a stay that starts and ends on the listed days, but the years/months/days figure still describes the gap between the two dates themselves.

### How are business days counted?

Weekends (Saturday and Sunday) are skipped. No public-holiday calendar is applied, because holidays differ by country and year, so subtract them yourself if it matters.

### What happens when I add a month to 31 January?

The day clamps to the last day of the target month, so 31 Jan + 1 month is 28 February, or 29 February in a leap year. Adding one month twice is not the same as adding two months, which is why the page does it in one step.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
