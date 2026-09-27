---
title: Filtering Docker Logs Effectively
description: How to filter Docker container logs without losing useful context, timestamps,
  and failure clues.
date: '2026-09-27'
tags:
- devops
aliases:
- /posts/how-to-filter-docker-logs-without-losing-context/
---

When a container fails, start by asking when it happened and what the process wrote just before it stopped. `docker logs <container>` shows the container's standard output and standard error. It does not automatically include files an application writes inside the container.

## Narrow the time window

Try `docker logs --since 10m --timestamps <container>` for a recent failure. With Compose, use `docker compose logs --since 10m <service>`. Check the timestamp and time zone before comparing the result with alerts or other services. If nothing appears, check whether the app writes to a file instead.

## Keep the lines around a match

Searching for `error` can help you find a starting point, but the reason may be on the lines before it. Save or inspect a little context around each match. A stack trace may cover several lines, and a warning may appear in healthy runs too. Compare the same period across related services before deciding what caused the failure.

Logs can include tokens, request bodies, and personal information. Redact those before sharing an example.

## Related tools

- [Docker Logs Grep](/tools/docker-logs-grep/) — Filter Docker logs with grep patterns, context, timestamps and container names.
