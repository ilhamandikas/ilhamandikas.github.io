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

Dockerfiles, Compose conversion, logs, and the small container details that matter during development and ops.

This guide is the canonical guide page for related tools on ilham.dev. It should grow into practical explanations, caveats, examples, and references instead of creating one thin article per utility.

## Related tools

- [Docker Logs Grep](/tools/docker-logs-grep/) — Filter docker compose logs with grep-style context lines, invert and dedupe modes.
- [Docker Run to Compose](/tools/docker-run-to-compose/) — Turn a docker run command into a docker-compose service.
- [Dockerfile Builder](/tools/dockerfile-builder/) — Build a Dockerfile from a form, with multi-stage presets for Node, Python, Go, Nginx and more.

## Notes for future edits

- Keep the guide reusable and factual.
- Link to personal posts only when there is a real incident, measurement, migration, or lesson.
- For sensitive inputs, mention whether the related tool runs locally in the browser and warn against pasting production secrets without understanding the trust boundary.
