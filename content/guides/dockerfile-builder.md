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
about: Fill in a form and get a Dockerfile. Start from a preset for Node, Python, Go, a static
  site on Nginx, PHP or a Java Maven build, or from scratch, then adjust the base image, workdir,
  ENV, ARG, COPY, RUN, EXPOSE, VOLUME, USER, LABEL, HEALTHCHECK, ENTRYPOINT and CMD. Multi-stage
  builds get a builder stage and copy the artifacts into the runtime image. The output is
  built in the page and can be copied or downloaded as a Dockerfile.
faq:
- q: When is a multi-stage build worth it?
  a: 'When the tools that build the app are not the tools that run it: a Go binary needs the
    Go toolchain only at build time, and a Node app needs dev dependencies only to bundle.
    The runtime image then carries just the artifact, which is smaller and has fewer things
    to patch.'
- q: What is the difference between ENTRYPOINT and CMD?
  a: ENTRYPOINT is the program that always runs; CMD supplies default arguments that a docker
    run command can override. If you set both, put the executable in ENTRYPOINT and the defaults
    in CMD. The page writes either as JSON when the value starts with [, otherwise as shell
    form.
- q: Why order the instructions this way?
  a: Docker caches one layer per instruction and rebuilds from the first changed layer onward.
    Copying dependency manifests and installing before copying the rest of the source means
    a code change does not re-install dependencies. Keep the slow, rarely-changing steps near
    the top.
- q: COPY or ADD?
  a: 'The page emits COPY, which is what you almost always want: it copies files and directories.
    ADD also unpacks local tarballs and can fetch URLs, which is convenient but surprising,
    so use it deliberately rather than by default.'
---

Fill in a form and get a Dockerfile. Start from a preset for Node, Python, Go, a static site on Nginx, PHP or a Java Maven build, or from scratch, then adjust the base image, workdir, ENV, ARG, COPY, RUN, EXPOSE, VOLUME, USER, LABEL, HEALTHCHECK, ENTRYPOINT and CMD. Multi-stage builds get a builder stage and copy the artifacts into the runtime image. The output is built in the page and can be copied or downloaded as a Dockerfile.

## Generate a Node image from a preset

Open the **Preset** list and choose **Node.js (build + run)**. The **Dockerfile** panel fills in immediately, and the toolbar reports the line count. Read it top to bottom: an `# syntax` line, a `build` stage that copies `package*.json`, runs `npm ci` and `npm run build`, then a runtime stage that copies `dist` out of the build stage with `COPY --from=build`, runs the production install, exposes port 3000 and ends with a `CMD`.

Now switch **Preset** to **Go (static binary)** and compare: the runtime stage uses a distroless base and an `ENTRYPOINT` instead of a `CMD`, because a Go binary needs no package manager at runtime. Tick and untick **Multi-stage build** and watch the **Build stage** fields appear and disappear from the form. Turn on **Join RUN commands with &&** to see several commands collapse into one layer, and turn off **Add section comments** to drop the `#` headings.

Change **Base image** to something wrong, such as empty it, and the status asks you to pick one. Put a bad value like `3000, 8080` in **EXPOSE** and it becomes `EXPOSE 3000 8080`. **Copy** takes the text and **Download** saves it as a file literally named `Dockerfile`.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Docker Basics](/guides/docker-basics/).
