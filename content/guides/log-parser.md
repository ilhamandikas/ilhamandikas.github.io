---
title: Log Parser Guide
description: Parse JSON Lines, Apache/Nginx access logs, syslog, logfmt and plain logs into
  a searchable table.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: log-parser
broader_guide:
  title: Reading Logs Before Searching Randomly
  url: /guides/reading-logs/
---

Turn a wall of log text into rows you can read. The page detects the shape of the log — JSON Lines, Apache/Nginx access logs (common and combined), syslog (RFC 3164 and 5424), nginx error logs, logfmt and plain timestamp-level-message lines — then pulls out the time, the level and the message, and keeps every other field as its own column. Filter by level, search with a substring or a regular expression, and copy or download the result as JSON or CSV. Nothing is uploaded.

## Parse a few nginx lines

Paste two access-log lines into **Log content**:

```text
192.168.1.10 - - [10/Oct/2000:13:55:36 -0700] "GET /index.html HTTP/1.0" 200 2326
192.168.1.10 - - [10/Oct/2000:13:55:37 -0700] "GET /missing HTTP/1.0" 404 153
```

Press **Parse**. **Format** reports `combined`, **Entries** is `2`, and the two **First timestamp** and **Last timestamp** rows show the same times converted to ISO 8601. The level chips read `info 1` and `warn 1`, because the parser maps the 404 status to `warn` and 200 to `info`, and the table gives each request its own row with `ip`, `method`, `path` and `status` columns.

Use the **Level** dropdown to keep only `warn`, then type `missing` in **Search** to narrow further; **Search** also accepts a regular expression written as `/404|500/`. A line that does not fit the detected shape is not dropped — the **Unparsed lines** row counts it and it stays visible as plain text. **Copy JSON**, **Copy CSV** and **Download JSON** export whatever is currently in the table, not just the rows on screen; up to 2,000 rows are shown and the first 8 extra fields get a column.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How does auto-detect choose a format?

It looks at the first 25 non-empty lines and scores each shape: JSON parses, an access-log pattern matches, a syslog header matches, or two or more key=value pairs appear. The highest score wins, and a log that matches nothing is treated as plain text. Pick the format by hand if the first lines are misleading.

### What happens to a line that does not match the chosen format?

It falls back to plain text instead of being dropped, and the summary counts it as an unparsed line. That way a stray stack trace or a blank banner line is still visible rather than silently vanishing.

### How are timestamps normalised?

Recognised timestamps become ISO 8601 so they sort and compare. Access-log times like 10/Oct/2000:13:55:36 -0700, nginx 2026/09/26 00:24:20, syslog Oct 11 22:14:15 and 10/13-digit epochs are all understood. A timestamp with no year uses the current year.

### How are log levels mapped?

WARN and WARNING become warn, ERR and ERROR become error, CRIT/CRITICAL/FATAL/ALERT/EMERG/PANIC become fatal, and TRACE/DEBUG/INFO/NOTICE map to themselves. Access logs use the status code: 5xx is error, 4xx is warn, everything else is info. Syslog RFC 5424 levels come from the priority value.

## Related guide

For more background, read [Reading Logs Before Searching Randomly](/guides/reading-logs/).
