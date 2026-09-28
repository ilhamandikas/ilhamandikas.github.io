---
title: SQL Prettify Guide
description: Reformat SQL queries so they are readable.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: sql-prettify
broader_guide:
  title: SQL Formatting and Test Data
  url: /guides/sql-formatting-and-test-data/
---

**SQL** is a language for asking a database for data. [SQL Prettify](/tools/sql-prettify/) makes some common clauses easier to see in a long line. It is a small text rewriter, **not** a SQL parser or a validator.

## Read a small query

Paste `select id, name from users where active = 1` into **SQL**. **Formatted SQL** should have `SELECT`, `FROM`, and `WHERE` on their own lines and finish with a semicolon. It does not run the query or connect to a database. **Copy** takes the formatted text; **Download** saves `query.sql`.

If a keyword appears inside a quoted value or a comment, this simple formatter can change it too. For example, it does not know that the letters `from` inside a string are data. Review a before/after diff and check against your database's dialect before using the output in production. Use this page to *read* a disposable query, not to certify one.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it understand my dialect?

It replaces text that resembles common keywords, without understanding quoting or dialect rules. It might even change a quoted string or comment. Always check the output; it cannot validate a query or predict its effect.

## Related guide

For more background, read [SQL Formatting and Test Data](/guides/sql-formatting-and-test-data/).
