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
---

Convert between octal permissions and symbolic ones, toggling read, write and execute for owner, group and others. It shows the resulting chmod command and the rwxr-xr-x string side by side, so you can check one against the other before running anything.

## Open the tool

[Use chmod Calculator](/tools/chmod-calculator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between 644 and 755?

644 gives the owner read and write and everyone else read, which is the normal choice for files. 755 adds execute for everyone, which is what directories and scripts need.

### What does a leading digit mean?

It carries the setuid, setgid and sticky bits — 1777 for a shared directory like /tmp, for example.

## Related guide

For more background, read [Linux Command Line Tasks Without Surprises](/guides/linux-command-line/).
