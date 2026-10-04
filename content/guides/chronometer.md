---
title: Chronometer Guide
description: A simple stopwatch with laps.
date: '2026-09-27'
tags:
- math
tool_guide_slug: chronometer
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
about: A stopwatch with lap times, counting in tenths of a second, for timing something without
  leaving the browser.
faq:
- q: Does it keep running if I switch tabs?
  a: Yes. The elapsed time is computed from a clock reading rather than by counting ticks,
    so a backgrounded tab cannot make it drift.
---

[Chronometer](/tools/chronometer/) is a stopwatch. The last two digits in `00:00.00` are **hundredths of a second**, not tenths.

## Time two short laps

Press **Start** and wait briefly. The display changes from `00:00.00`. Press **Lap** to save the current *total elapsed time* as **Lap 1**. Wait again and press **Lap**: **Lap 2** appears above Lap 1, showing the later total, **not** just the time since the first lap. Press **Pause**; the clock stops. Press **Resume** to continue from that value, or **Reset** to clear both the time and the laps.

A lap can be recorded even before starting, in which case it reads `00:00.00`. The stopwatch uses the browser's monotonic clock, but display refresh can pause while a tab is in the background. Do not rely on it as a certified timing device, and record your results elsewhere before closing the page.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
