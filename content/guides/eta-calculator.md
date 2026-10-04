---
title: ETA Calculator Guide
description: Estimate a finish time from progress, elapsed time and remaining work.
date: '2026-09-27'
tags:
- math
tool_guide_slug: eta-calculator
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
about: Estimate a finish time from how much is done, how long it took and how much is left,
  assuming the current rate holds.
faq:
- q: How accurate is it?
  a: Only as accurate as the assumption that the remaining work resembles the work already
    done. It is most useful for spotting an overrun early, not for planning.
---

**ETA** means estimated time of arrival or finish. [ETA Calculator](/tools/eta-calculator/) divides elapsed time by the number of completed items, then uses that rate to estimate the remaining time. It assumes all items take about the same time.

## Read the default example

The page starts with **Total items** `100`, **Completed** `25`, and **Elapsed (seconds)** `30`. **Progress** should be `25.0%`, **Items remaining** should be `75`, and **Remaining time** should be `1m 30s`. **Estimated finish** is your local clock time plus that remaining time, so it changes depending on when you open the page.

Change **Completed** to `0`. The results disappear: there is no measured speed yet. Enter a positive completed count no greater than **Total items** to get results again. If later items are harder than earlier ones, the ETA will be optimistic. Use it to revisit an estimate, not to promise a deadline.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
