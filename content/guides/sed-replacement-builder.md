---
title: sed Replacement Builder Guide
description: Build a sed command to replace text, delete matching lines or print only matches,
  with in-place editing and backups.
date: '2026-09-27'
tags:
- text
tool_guide_slug: sed-replacement-builder
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
---

Build the sed command you would otherwise look up again. Choose between a substitution, deleting matching lines or printing only the matches, then set the regex style, the delimiter and the flags. The page escapes the delimiter inside the pattern and quotes the whole expression, so a copy-paste into the shell behaves the same way it did here.

## Open the tool

[Use sed Replacement Builder](/tools/sed-replacement-builder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is an in-place edit reversible?

Only with the backup. With -i.bak on, sed leaves the original next to the file with a .bak suffix; turn the backup off and there is no undo.

### What does the I flag do?

It makes the pattern match without regard to case. It is a GNU extension, so it works with GNU sed on Linux but not with the old BSD sed on macOS.

### Why does it quote the expression in single quotes?

A sed expression is full of characters the shell would otherwise interpret, like spaces, pipes, stars and dollar signs. Single quotes hand the whole expression to sed untouched.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
