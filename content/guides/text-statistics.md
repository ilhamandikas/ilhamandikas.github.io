---
title: Text Statistics Guide
description: Count characters, words, sentences, lines and reading time.
date: '2026-09-27'
tags:
- text
tool_guide_slug: text-statistics
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
about: Count characters, words, sentences, paragraphs and lines, with and without spaces,
  plus an estimated reading time. Useful for checking a draft against a length limit.
faq:
- q: How is the reading time worked out?
  a: Words divided by a fixed reading speed. It is a rough figure — technical material with
    code reads considerably slower than prose.
---

[Text Statistics](/tools/text-statistics/) counts pieces of the text you type. A *character* is one visible letter, number, space, or punctuation mark in this example. A *word* is a group the tool recognises between separators.

## Count a short sentence

Type `Hi Ana.` in **Text**. You should see **7 characters** (the space and period count) and **2 words** (`Hi` and `Ana`). **Characters (no spaces)** should be `6`: the space is removed from that count, but the period is still there. You should also see **1 sentence** and **1 line**.

Add a new line and type `Hi Ana.` again. **Lines** should become `2`, and **Words** should become `4`. **Top words** shows which words repeat; it is a clue to how much repetition is in a draft, not a grammar check. The results update as you type.

## About reading time

The tool divides the word count by an assumed rate of 200 words per minute, so a short example says **<1 min**. People read code, unfamiliar terms, and dense instructions at different speeds. Treat reading and speaking times as estimates, not promises.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
