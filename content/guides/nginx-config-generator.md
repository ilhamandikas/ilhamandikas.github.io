---
title: nginx Config Generator Guide
description: Build an nginx server block for a static site, a single-page app, PHP or a reverse
  proxy.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: nginx-config-generator
broader_guide:
  title: Nginx Reverse Proxy Configuration
  url: /guides/nginx-reverse-proxy/
---

Build an nginx server block by answering a few questions: which hostnames, static files or a reverse proxy, TLS or plain HTTP, caching, compression, security headers and logging. The output is a complete file you can drop into sites-available, and every line of a nested block is indented so it reads as the block it is. Anything the tool could not do properly is written into the output as a # !! comment rather than left in a status line, so a config that would not load cannot be mistaken for one that will.

## Open the tool

[Use nginx Config Generator](/tools/nginx-config-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is the generated config checked against a real nginx?

No, and that is worth being clear about. nginx is not installed on the machine this was built on, so the output is checked structurally — every server_name is validated against the hostname pattern, braces are balanced, indentation is consistent — and not with nginx -t. Read it before you reload, which is good practice with any generated config.

### Why is the www redirect written out as two server blocks?

Because nginx has no variable that means "this host without the leading www". There is no way to derive one hostname from another inside a server block, so the only correct output is one redirect block per literal pair you typed. A single clever regex would silently fail for the domains it did not match.

### Why is http2 on; mentioned in the notes?

Because that directive only exists from nginx 1.25.1 onwards; older versions used the http2 parameter on the listen line. The generated file uses the current form and the notes say which version it needs, so you find out before the reload fails rather than after.

### Why are the security headers repeated inside the cache location?

Because add_header does not merge. A location block that sets any header of its own discards every add_header inherited from the parent, so the asset-cache block would quietly lose the security headers — on exactly the responses that are cached and served most often. Repeating them is the standard workaround, and the notes say why they are there twice.

## Related guide

For more background, read [Nginx Reverse Proxy Configuration](/guides/nginx-reverse-proxy/).
