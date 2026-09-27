---
title: SQL Formatting and Test Data
description: Formatting SQL, generating inserts, and preparing small data sets for
  review or testing.
date: '2026-09-27'
tags:
- database
aliases:
- /posts/how-to-format-sql-before-reviewing-a-query/
---

A SQL query can look tidy and still be unsafe. Formatting is for reading; correctness and safety depend on the query, its parameters, and the database schema.

## Separate values from SQL

Use parameterized queries in application code instead of building SQL by concatenating user input. A generated `INSERT` statement may help prepare sample rows, but review types, null values, quoting, and constraints before running it.

## Run experiments where mistakes are cheap

Try a statement on a small test database first. For `UPDATE` or `DELETE`, inspect the matching rows with a `SELECT` using the same condition. Back up important data and check the transaction behavior before applying a bulk change.

## Related tools

- [SQL Insert Generator](/tools/sql-insert-generator/) — Turn JSON or CSV rows into SQL INSERT statements for MySQL, PostgreSQL, SQLite or SQL Server.
- [SQL Prettify](/tools/sql-prettify/) — Reformat SQL queries so they are readable.
