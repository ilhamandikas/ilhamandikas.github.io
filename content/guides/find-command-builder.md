---
title: find Command Builder Guide
description: Assemble a find command with name, type, size, age and depth tests, then choose
  to print, delete or exec on each match.
date: '2026-09-27'
tags:
- devops
tool_guide_slug: find-command-builder
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
---

Build a find command from plain choices instead of remembering the test order. Filter by name, type, size, age, permissions and depth, exclude noisy directories, and then decide what happens to each match: print it, print it with a null separator, delete it, or run a command on it.

## Open the tool

[Use find Command Builder](/tools/find-command-builder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does -delete deserve caution?

It removes matches immediately and asks nothing. Run the same command with the print action first so you can see the exact list, then switch to delete.

### What is the null-separated option for?

-print0 ends each path with a null byte instead of a newline, so a name that contains a space or a newline is still one item. Pair it with xargs -0.

### Does the order of the options matter?

Yes. -maxdepth is a global option and has to come before the tests, and -delete has to come last. The builder already places them in a working order.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
