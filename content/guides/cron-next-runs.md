---
title: Cron Next Runs Guide
description: Preview the next scheduled runs of a cron expression in local time or UTC.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: cron-next-runs
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
---

Cron is a way to say **when** a task should run. A schedule has five parts: minute, hour, day of the month, month, and day of the week. [Cron Next Runs](/tools/cron-next-runs/) shows upcoming times so you can check a schedule before using it.

## Try a daily schedule

Type `0 9 * * *` into **Cron expression**. Read it from left to right: minute `0`, hour `9`, then `*` for any day, any month, and any weekday. Choose **UTC** under **Timezone**. The upcoming rows should be at **09:00 UTC** each day. The exact dates depend on when you open the page; the tool only shows times **after now**.

Switch **Timezone** to **Local (this device)**. The schedule is now read using your device's time zone, so the underlying moments may change. **Count** controls how many future dates you see, not how often the task runs.

## If you see an error or an odd date

Make sure there are exactly five parts separated by spaces. `0 9 * *` is missing one part. The tool understands `*` (every allowed value), `1,2` (a list), `1-5` (a range), and `*/15` (steps of 15). It previews a schedule in your browser; it does not install a job or check your server's time zone.

**Important limitation:** do not rely on this page to check schedules restricted to *only* a weekday or *only* a day of the month. Its current day-matching logic can list extra dates in those cases. Check such schedules with your actual cron implementation before deploying them.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How are day-of-month and weekday combined?

This preview uses an OR between the day-of-month and weekday fields. That is useful to know, but its current logic can also list extra dates when one of those fields is `*` and the other is restricted. For schedules like “weekdays only”, verify the dates using the cron implementation on your server rather than relying on this preview alone.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
