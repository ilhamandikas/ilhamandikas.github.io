---
title: UUID Generator Guide
description: Generate v4 UUIDs, single or in bulk.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: uuid-generator
broader_guide:
  title: IDs and Test Data
  url: /guides/ids-and-test-data/
---

An ID is a label used to tell one thing from another. A UUID is a long label that different programs can create without asking one central server for the next number. [UUID Generator](/tools/uuid-generator/) makes random version 4 UUIDs in your browser.

## Make a few IDs

Open the tool. **How many** starts at `5`, so you should already see five lines. Each line is one UUID. It looks roughly like `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, where the `x` and `y` positions vary. Do not expect the exact same result twice: the tool makes new random values.

Set **How many** to `2` and choose **Generate**. You should now see two lines. If you turn on **Uppercase**, the letters become capital letters; **Wrap in braces** puts `{` and `}` around each ID. These options change how the IDs are written, so check the format the receiving program expects. Use **Copy** when you need the list.

## What these IDs do not prove

A UUID helps avoid accidental duplicates; it does not prove who created a record or make a URL secret. Never use a visible ID alone as an access check. If you need one ID for a test record, generate one and keep a note of where you used it rather than guessing you can recreate the same value later.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Can two generated UUIDs collide?

A v4 UUID carries 122 random bits. You would need to generate around 2.7×10^18 of them before a collision became likely, which is far beyond any realistic workload.

### Are these UUIDs predictable?

No. They come from crypto.getRandomValues rather than Math.random, so earlier values tell you nothing about later ones.

## Related guide

For more background, read [IDs and Test Data](/guides/ids-and-test-data/).
