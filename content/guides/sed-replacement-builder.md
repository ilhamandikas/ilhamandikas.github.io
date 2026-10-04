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
about: Build the sed command you would otherwise look up again. Choose between a substitution,
  deleting matching lines or printing only the matches, then set the regex style, the delimiter
  and the flags. The page escapes the delimiter inside the pattern and quotes the whole expression,
  so a copy-paste into the shell behaves the same way it did here.
faq:
- q: Is an in-place edit reversible?
  a: When both **Edit in place** and **Keep a .bak backup** are checked, the generated command
    uses `-i.bak` so sed normally writes a `.bak` copy of each file. Check that copy yourself
    before relying on it; without a backup there is no tool-provided undo.
- q: What does the I flag do?
  a: It makes the pattern match without regard to case. It is a GNU extension, so it works
    with GNU sed on Linux but not with the old BSD sed on macOS.
- q: Why does it quote the expression in single quotes?
  a: The builder shell-quotes the sed expression **when its characters require it**; this
    simple `cat` example needs no quotes. The **Files** field is *not* quoted by the builder;
    a path with spaces or shell metacharacters needs manual review.
---

**`sed`** is a command that edits lines of text. [sed Replacement Builder](/tools/sed-replacement-builder/) **writes a command** for replacement, deletion, or printing matching lines; it does not run the command or touch your files.

## Build a harmless replacement

Leave **What should sed do?** on **Replace text**, enter `cat` as **Pattern**, and `dog` as **Replacement**. Leave **Files** empty and **Global (g)** and **Extended regex (-E)** checked. **Command** should show `sed -E s/cat/dog/g`. With no file, `sed` would read standard input. For example, piping the test line `cat cat` through this command would produce `dog dog`.

For a real file, use a disposable copy first. **Edit in place (-i)** modifies the named file, and **Keep a .bak backup** only takes effect when in-place editing is on. If **Files** is empty and in-place editing is enabled, the tool asks for a file. File names and globs are inserted as typed—not shell-escaped—so inspect the *entire* command before running it, and quote file names with spaces yourself. Do not paste untrusted file text into a shell command.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
