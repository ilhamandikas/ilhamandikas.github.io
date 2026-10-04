---
title: ULID Generator Guide
description: Generate sortable ULIDs, single or in bulk.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: ulid-generator
broader_guide:
  title: IDs and Test Data
  url: /guides/ids-and-test-data/
about: ULIDs are 128-bit identifiers like UUIDs, except the first 48 bits are a millisecond
  timestamp. That makes them sortable by creation time while staying unique, which is handy
  as a primary key when you want insertion order without keeping a separate timestamp column.
faq:
- q: Should I use a ULID or a UUID?
  a: A ULID carries its creation time in its first characters and can sort roughly by time.
    A random UUID v4 does not expose that timestamp. Choose the format your application accepts;
    neither one replaces access control.
- q: Are ULIDs case-sensitive?
  a: The canonical form is uppercase Crockford Base32, and that is what this tool produces.
---

An **ID** is a label for one item. A ULID is a 26-character ID whose first part records when it was made. [ULID Generator](/tools/ulid-generator/) makes IDs in your browser without asking a server for the next number.

## Make two test IDs

Open the tool, set **How many** to `2`, and choose **Generate**. You should see **two lines** under **ULIDs**. Each line has 26 uppercase letters and digits. The values will differ from mine and from your next run; they are generated when you click the button. **Copy** takes the lines shown.

The time portion means ULIDs made at different times *often* sort in time order as text. This tool does **not** promise a strict order for IDs made in the same millisecond. Do not use an ID as proof that an event happened first; keep an explicit timestamp if order matters to your application.

## What an ID does not do

It helps label a record without asking one server for a counter. It does not make the record private or authorize someone to read it. Check what format your database or API expects before using a ULID where it expects a UUID.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [IDs and Test Data](/guides/ids-and-test-data/).
