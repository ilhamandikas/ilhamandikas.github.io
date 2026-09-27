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

Dates can be counted in two ways: measure the gap **between** two dates, or move a date forward or backward. [Date Calculator](/tools/date-calculator/) has one mode for each question.

## Count days between two dates

Leave **Mode** on **Difference between two dates**. Set **Start date** to `2024-01-01` and **End date** to `2024-01-03`. **Total days** should say `2`: from the start of January 1 to the start of January 3 is two days. Turn on **Include the end date** and it should say `3`, counting January 1, 2, **and** 3. The **Calendar difference** describes the gap and stays at two days.

If you choose **Count business days (Mon–Fri)**, the tool counts weekdays, not public holidays. A business day in your country may still be a holiday.

## Move a date forward

Change **Mode** to **Add or subtract from a date**. Set **Start date** to `2024-01-31`, **Operation** to **Add**, **Amount** to `1`, and **Unit** to **Months**. The **Result** should be `2024-02-29`. February does not have a 31st, so the tool uses its last valid day. In 2024 that is February 29 because it was a leap year.

The tool starts with dates near today; replace them to repeat these examples. Check which mode is selected before interpreting a result. These are calendar calculations on the device running your browser, not scheduled changes to an account or server.

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
