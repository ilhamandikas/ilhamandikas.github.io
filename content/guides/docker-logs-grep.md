---
title: Docker Logs Grep Guide
description: Filter docker compose logs with grep-style context, invert and dedupe modes.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: docker-logs-grep
broader_guide:
  title: Filtering Docker Logs Effectively
  url: /guides/docker-logs/
---

Paste the output of docker compose logs and filter it like grep. Match with context (the equivalent of grep -C, with separate before and after counts), show matching lines only, invert the match, count matches, or list unique matching lines. Context groups are separated by "--" and line numbers use ":" for a match and "-" for context, so the output looks like grep -n -C. Everything runs in the page, so log contents never leave the browser.

## Open the tool

[Use Docker Logs Grep](/tools/docker-logs-grep/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How do I get 10 lines before and 5 lines after a match?

Leave the grep type on Match with context, set Lines before to 10 and Lines after to 5. That is the same as grep -B 10 -A 5, and grep -C would use the larger of the two.

### What is the difference between Regex and plain search?

With Regex checked, the pattern is a JavaScript regular expression, so error|timeout matches either word and ^api matches the start of a line. With Regex unchecked every character is literal, so a dot matches only a dot.

### Can I dedupe a noisy log?

Yes. Use the Unique matching lines type, which behaves like grep ... | sort | uniq -c and prefixes each distinct line with how many times it appeared. A pattern of . matches every line, so it can dedupe the whole file.

## Related guide

For more background, read [Filtering Docker Logs Effectively](/guides/docker-logs/).
