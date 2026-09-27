---
title: Slugify Guide
description: Turn any text into a clean URL slug.
date: '2026-09-27'
tags:
- web
tool_guide_slug: slugify
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
---

Turn any text into a URL-safe slug: lowercased, accents folded to ASCII, punctuation dropped and words joined with a separator you choose. Non-Latin scripts are transliterated where that is possible.

## Open the tool

[Use Slugify](/tools/slugify/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why should a slug be ASCII?

Percent-encoded characters are hard to read, easy to mangle when copied and awkward in analytics. A plain ASCII slug survives every tool it passes through.

### Should I use dashes or underscores?

Dashes. Search engines treat a hyphen as a word separator and an underscore as joining two words, so my-post reads as two words and my_post as one.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
