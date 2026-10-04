---
title: chmod Calculator Guide
description: Convert between octal and symbolic Unix file permissions.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: chmod-calculator
broader_guide:
  title: Linux Command Line Tasks Without Surprises
  url: /guides/linux-command-line/
about: Convert between octal permissions and symbolic ones, toggling read, write and execute
  for owner, group and others. It shows the resulting chmod command and the rwxr-xr-x string
  side by side, so you can check one against the other before running anything.
faq:
- q: What is the difference between 644 and 755?
  a: 644 gives the owner read and write and everyone else read, which is the normal choice
    for files. 755 adds execute for everyone, which is what directories and scripts need.
- q: What does a leading digit mean?
  a: In a full Unix permission number, the leading digit can hold setuid, setgid, and sticky
    bits. **This calculator does not preserve or report that digit correctly.** Check special
    bits using system tools before changing permissions.
---

On Unix-like systems, *permissions* say who can read, change, or run a file. [chmod Calculator](/tools/chmod-calculator/) shows the three-digit number and the `rwx` letters side by side. It does **not** change any file by itself.

## Read 755

The **Octal** box starts at `755`. Under **Symbolic**, look for `rwxr-xr-x`. Read it in three groups: `rwx` for the file's user (owner), `r-x` for its group, and `r-x` for others. `r` means read, `w` write, and `x` execute. The **Command** row shows `chmod 755 <file>`: `<file>` is a placeholder you would replace with a real path after checking it.

Now type `644` in **Octal**. The result should become `rw-r--r--`: the owner can read and write; group and others can only read. Tick a permission checkbox to see the number change. Recheck the command before running it, especially on directories or shared files.

## Important limit

This tool displays the last three permission digits only. A fourth, leading digit for special bits (such as the sticky bit in `1777`) is **not** preserved in the shown result or command. Do not rely on it to plan setuid, setgid, or sticky-bit permissions. The **Special** row does not correctly detect those bits.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
