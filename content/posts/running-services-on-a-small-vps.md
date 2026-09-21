---
title: "Running real services on a small VPS"
date: 2026-09-12
description: "You do not need a large machine to run real things. You need a small number of good habits."
tags: ["infrastructure", "linux", "self-hosting"]
---

A lot of what looks like a scaling problem is really a maintenance problem. On a
small VPS with a gigabyte or two of RAM you can run a surprising amount — as long as
you keep the number of moving parts low and make the boring things automatic.

## Keep the request path short

The fastest request is the one you never have to serve dynamically. Static files,
cached responses, and a sensible CDN in front of the origin remove most of the load
before it ever reaches your box. What is left is usually small enough to fit.

## Make the machine easy to reason about

A few rules I keep coming back to:

- one job per container, one process per container;
- explicit resource limits, so one service cannot take the whole box down;
- health checks and restart policy, so failures are boring;
- configuration in files under version control, not in a shell history.

Resources are finite, so treat them as a budget:

```sh
# What is actually using memory right now?
docker stats --no-stream --format \
  'table {{.Name}}\t{{.MemUsage}}\t{{.CPUPerc}}'
```

## Back up the small things that matter

Most of a server is disposable. The database, the configuration, and the certificates
are not. If you can restore those three, you can rebuild everything else in an
afternoon.

> Boring, small, and reproducible beats clever, large, and fragile almost every time.

None of this is exotic. It is just a set of habits that keep a small machine honest —
and keep you out of the terminal at midnight.
