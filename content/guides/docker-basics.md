---
title: Docker Basics
description: Dockerfiles, Compose conversion, logs, and the small container details
  that matter during development and ops.
date: '2026-09-27'
tags:
- devops
aliases:
- /posts/how-to-turn-docker-run-into-compose/
- /posts/how-to-write-a-dockerfile-without-copying-random-examples/
---

A container is a process with its own filesystem view and isolation rules, not a tiny server you never need to inspect. When something fails, start with the container's state and logs instead of rebuilding the image immediately.

## Find out what stopped

Run `docker ps -a` to see containers that have exited, then `docker logs <container>` to read their output. With Compose, `docker compose ps` and `docker compose logs <service>` keep the focus on the service you named. An exit code tells you the process stopped; the logs may explain why.

## Keep build, run, and data separate

A Dockerfile describes how to build an image. Compose describes how services run together: ports, environment, volumes, and dependencies. A volume is where data can outlive a container; deleting and recreating a container does not restore data you never stored outside its writable layer. Review generated configurations before using them, especially mounts and environment variables.

## Related tools

- [Docker Logs Grep](/tools/docker-logs-grep/) — Filter docker compose logs with grep-style context lines, invert and dedupe modes.
- [Docker Run to Compose](/tools/docker-run-to-compose/) — Turn a docker run command into a docker-compose service.
- [Dockerfile Builder](/tools/dockerfile-builder/) — Build a Dockerfile from a form, with multi-stage presets for Node, Python, Go, Nginx and more.
