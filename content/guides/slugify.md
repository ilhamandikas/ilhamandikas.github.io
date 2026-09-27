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

A *slug* is the short piece of text in a page address, such as `my-first-post` in `/posts/my-first-post/`. [Slugify](/tools/slugify/) turns a title into a simpler string you can use as a starting point for a new slug.

## Try a title with punctuation

Type `Hello, World!` in **Text**. Leave **Separator** on **dash -** and **Lowercase** checked. **Slug** should say `hello-world`. The comma and exclamation mark are dropped, and the space becomes one dash.

Try `Café Notes`. You should see `cafe-notes`: the accent on `é` is removed. Choose **underscore _** to get `cafe_notes`, or turn off **Lowercase** if you need capital letters. The result updates as you type.

## Before you publish it

The tool keeps ASCII letters and digits. It **does not transliterate** non-Latin writing into Latin letters: characters it cannot keep are removed, which can leave an empty or incomplete result. Read the slug yourself and choose a meaningful one when that happens.

For an existing page, a new slug means a new URL. Do not replace a live page address just because this output looks tidier; preserve the old address or add a permanent redirect first.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why should a slug be ASCII?

ASCII slugs can be easier to type and share, but Unicode URLs are also valid. This tool makes ASCII output by design; it does not mean every non-ASCII slug is wrong.

### Should I use dashes or underscores?

Use whichever convention your project already uses. Dashes are common for readable page addresses; underscores may fit code or file names. Consistency matters more than turning every existing URL into a new one.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
