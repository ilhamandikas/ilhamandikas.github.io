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

Linux `find` walks through a directory and looks for paths that match your rules. [find Command Builder](/tools/find-command-builder/) writes a command from the fields you choose. It **does not run the command**. That is important: a generated command still needs your review.

## Build a read-only search

1. Make a small test directory you control. In **Start path**, enter its path, for example `./test-data` if you created it there. Use your **actual** test path before running anything.
2. In **Name pattern (optional)**, type `*.log`. Set **Type** to **File (f)**.
3. Leave **Do this with each match** on **Print the path**. Under **Command**, check that you see `find`, your start path, `-name`, `-type f`, and the name pattern. The generated command searches for matching file paths; it does not read the log contents.
4. Copy it to a terminal **only after checking the path**. Compare the printed matches with what you expected.

## Before changing the action

**Delete it** uses `find -delete`, which removes matches immediately and has no undo. **Run a command for each match** also executes the command you entered on matching paths. Do not switch to either mode just because a preview looks plausible; verify the command and the exact paths first. For unfamiliar input, stay with **Print the path**. Blank optional fields mean no extra rule; if your output is too broad, narrow the search before doing anything destructive.

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
