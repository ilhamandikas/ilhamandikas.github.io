---
title: Age Calculator Guide
description: Work out an age in years, months and days, with totals and the next birthday.
date: '2026-09-27'
tags:
- math
tool_guide_slug: age-calculator
broader_guide:
  title: Dates, Timestamps, and Time Zones
  url: /guides/dates-times-and-time-zones/
about: 'Work out an age the way a birthday works: whole years, then whole months, then the
  leftover days. Alongside that it shows the totals in days, weeks, months and hours, the
  weekday someone was born on, and how long until the next birthday. Move the second date
  to see an age at any point.'
faq:
- q: Why not just divide the total days by 365?
  a: Because a year is not 365 days on average and months have different lengths. Counting
    whole years, then months, then days is how people read an age, and it stays correct across
    leap years.
- q: Which date is the second field for?
  a: It is the date you are measuring the age at. It defaults to today, but you can set it
    to a past date for a record or a future date to see how old someone will be.
- q: How is the next birthday counted?
  a: The page takes the birth month and day in the current year, or the next one if that has
    already passed this year, and counts the days between. A birthday today shows as today.
---

An age in years changes on a birthday, not every time another 365 days pass. [Age Calculator](/tools/age-calculator/) compares a birth date with the date you choose under **Age as of**.

## Try a birthday

Set **Date of birth** to `2000-01-01` and **Age as of** to `2024-01-01`. Under **Result**, **Age** should say `24 years, 0 months, 0 days`. The birthday happened on the date you chose. **Next birthday** should say **today** for this example because it is measured *as of* that date, even if the real date today is different.

Now change **Age as of** to `2023-12-31`. The person has not reached the 2024 birthday yet, so the age should be **23 years**, plus months and days. The tool also shows total days, weeks, and hours; those are ways to measure the same span, not separate ages.

## If it refuses your dates

The birth date must be on or before **Age as of**. The second date starts at today, but you can choose a past date for a record or a future date for planning. For an official form, check which date it asks you to calculate the age on. Do not put a real person's date of birth in a public screenshot unless they agreed to share it.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Dates, Timestamps, and Time Zones](/guides/dates-times-and-time-zones/).
