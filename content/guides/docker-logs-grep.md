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
about: Paste the output of docker compose logs and filter it like grep. Match with context
  (the equivalent of grep -C, with separate before and after counts), show matching lines
  only, invert the match, count matches, or list unique matching lines. Context groups are
  separated by "--" and line numbers use ":" for a match and "-" for context, so the output
  looks like grep -n -C. Everything runs in the page, so log contents never leave the browser.
faq:
- q: How do I get 10 lines before and 5 lines after a match?
  a: Leave the grep type on Match with context, set Lines before to 10 and Lines after to
    5. That is the same as grep -B 10 -A 5, and grep -C would use the larger of the two.
- q: What is the difference between Regex and plain search?
  a: With Regex checked, the pattern is a JavaScript regular expression, so error|timeout
    matches either word and ^api matches the start of a line. With Regex unchecked every character
    is literal, so a dot matches only a dot.
- q: Can I dedupe a noisy log?
  a: Yes. Use the Unique matching lines type, which behaves like grep ... | sort | uniq -c
    and prefixes each distinct line with how many times it appeared. A pattern of . matches
    every line, so it can dedupe the whole file.
---

A log is a list of messages from a program. A busy container may print too many messages to read one by one. [Docker Logs Grep](/tools/docker-logs-grep/) lets you find the lines you care about **and the lines next to them**. You paste logs into the page; the tool does not fetch logs from Docker for you.

## Find a failure in four lines

Paste this made-up example into **Paste docker compose logs output**:

```text
api-1 | starting
api-1 | connected to database
api-1 | ERROR request failed
api-1 | retrying request
```

Type `error` into **Search pattern**. Leave **Ignore case** on, so lowercase `error` also finds uppercase `ERROR`. Pick **Matching lines only** under **Grep type**. The result should contain only the third line. With **Line numbers** on, it starts with `3:`; that means the match was on line 3 of the pasted text, not that Docker assigned it an ID.

Now choose **Match with context**. Set **Lines before** to `1` and **Lines after** to `1`. You should see the database message, the error, and the retry. The lines around a match help you see what happened just before and after it. A `-` after a line number marks context; a `:` marks the matching line.

## If you get no matches

Check the spelling and whether **Ignore case** is on. Turn **Regex** off if you want special characters such as `.` to be matched literally. Regex means a search pattern with special rules; for example, `error|timeout` finds either word when **Regex** is on. You can switch to **Count matches** if you only need a number.

Real logs can contain tokens, cookies, and personal data. Check and redact them before sharing an excerpt with anyone.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Filtering Docker Logs Effectively](/guides/docker-logs/).
