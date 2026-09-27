---
title: Dockerfile Builder Guide
description: Build a Dockerfile from a form, with multi-stage presets for Node, Python, Go,
  Nginx and more.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: dockerfile-builder
broader_guide:
  title: Docker Basics
  url: /guides/docker-basics/
---

Fill in a form and get a Dockerfile. Start from a preset for Node, Python, Go, a static site on Nginx, PHP or a Java Maven build, or from scratch, then adjust the base image, workdir, ENV, ARG, COPY, RUN, EXPOSE, VOLUME, USER, LABEL, HEALTHCHECK, ENTRYPOINT and CMD. Multi-stage builds get a builder stage and copy the artifacts into the runtime image. The output is built in the page and can be copied or downloaded as a Dockerfile.

## Open the tool

[Use Dockerfile Builder](/tools/dockerfile-builder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### When is a multi-stage build worth it?

When the tools that build the app are not the tools that run it: a Go binary needs the Go toolchain only at build time, and a Node app needs dev dependencies only to bundle. The runtime image then carries just the artifact, which is smaller and has fewer things to patch.

### What is the difference between ENTRYPOINT and CMD?

ENTRYPOINT is the program that always runs; CMD supplies default arguments that a docker run command can override. If you set both, put the executable in ENTRYPOINT and the defaults in CMD. The page writes either as JSON when the value starts with [, otherwise as shell form.

### Why order the instructions this way?

Docker caches one layer per instruction and rebuilds from the first changed layer onward. Copying dependency manifests and installing before copying the rest of the source means a code change does not re-install dependencies. Keep the slow, rarely-changing steps near the top.

### COPY or ADD?

The page emits COPY, which is what you almost always want: it copies files and directories. ADD also unpacks local tarballs and can fetch URLs, which is convenient but surprising, so use it deliberately rather than by default.

## Related guide

For more background, read [Docker Basics](/guides/docker-basics/).
