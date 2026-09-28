---
title: grep Pattern Builder Guide
description: Build a grep command with the right regex style, recursion, includes and context
  lines, then copy it.
date: '2026-09-27'
tags:
- text
tool_guide_slug: grep-pattern-builder
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
---

**`grep`** searches lines of files for a pattern. [grep Pattern Builder](/tools/grep-pattern-builder/) assembles a shell command from the choices you make; it does **not** search files in the browser.

## Find a marker in a test folder

Set **Pattern** to `TODO` and **Path** to `src` (use a folder you actually have before running the command). Leave the defaults on: **Extended regex (-E)**, **Recursive (-r)**, **Ignore case (-i)**, **Line numbers (-n)**, and **Skip binary files (-I)**. The displayed command should contain `grep -E -r -i -n -I TODO src`. If you ran it against a suitable folder, matching lines would include file names and line numbers; an empty result might mean the folder has no matches, not that the command failed.

Try **Fixed string (-F)** when the pattern is literal text such as `a.b`, where the dot should *not* mean “any character.” **Include files** accepts one glob such as `*.js`, not a comma-separated list. The **Path** is left unquoted so shell globs can expand: review it before running, particularly if it came from someone else. **Copy** takes the command, not search results.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### When should I use -F?

When you are searching for literal text that contains regex characters, such as an IP address with dots or a string with brackets. -F treats the pattern as plain text, so nothing needs escaping.

### What is the difference between -E and -P?

`-E` uses extended regular expressions for groups and alternation. `-P` requests Perl-compatible patterns such as lookarounds, but not every version of grep supports it. Test on the machine where you will run the command.

### How do I pass several extensions?

The builder writes **one** `--include` for the exact text in the field and shell-quotes it. To use several patterns, add separate `--include` options to the copied command yourself; brace expansion inside the quoted field will not expand.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
