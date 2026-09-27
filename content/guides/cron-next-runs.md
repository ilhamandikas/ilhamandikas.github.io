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

Read a five-field cron expression and see the next scheduled runs as real dates, in local time or UTC, with a relative label. Useful for checking that a schedule means what you think before saving it to a crontab.

## Open the tool

[Use Cron Next Runs](/tools/cron-next-runs/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How are day-of-month and weekday combined?

Like standard cron: when both fields are restricted, a run matches if either one matches. When both are wildcards, every day matches.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
