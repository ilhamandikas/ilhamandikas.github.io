---
title: Docker Run to Compose Guide
description: Turn a docker run command into a docker-compose service.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: docker-run-to-compose
broader_guide:
  title: Docker Basics
  url: /guides/docker-basics/
---

Turn a docker run command into a docker-compose.yml service, mapping ports, volumes, environment variables, restart policy and the command into their Compose equivalents.

## Open the tool

[Use Docker Run to Compose](/tools/docker-run-to-compose/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it understand every flag?

It covers the common ones — ports, volumes, environment, restart, network, command and entrypoint. Anything it does not recognise is reported rather than silently dropped.

## Related guide

For more background, read [Docker Basics](/guides/docker-basics/).
