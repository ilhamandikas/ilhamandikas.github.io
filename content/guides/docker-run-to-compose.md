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

`docker run` starts one container; a **Compose** file describes services in YAML so you can review and run them as a group. [Docker Run to Compose](/tools/docker-run-to-compose/) rewrites a subset of common flags as **draft YAML**. It does not start containers or check the Docker installation.

## Convert a small example

Replace **docker run command** with `docker run --name demo -p 8080:80 nginx:alpine`. Under **docker-compose.yml**, you should see a service named `demo`, an `image: nginx:alpine` line, and a `ports` entry containing `8080:80`. Here `8080` is the host-side port and `80` is the container-side port. **Copy** takes the YAML; **Download** saves it as `docker-compose.yml`.

Compare the output to your original command *flag by flag*. This parser recognizes a limited set of options; **unknown flags may be silently skipped**, and complex quoting, `--mount`, or environment values may not translate correctly. A secret passed with `-e` would also appear in the generated YAML. Use dummy values here, and verify the final file with your own Docker Compose installation before using it.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it understand every flag?

No. The parser handles selected flags but silently skips some unknown options. It also treats anything after the image name as a command. Compare every option against the source before trusting or running the result.

## Related guide

For more background, read [Docker Basics](/guides/docker-basics/).
