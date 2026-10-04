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
about: 'Build an nginx server block by answering a few questions: which hostnames, static
  files or a reverse proxy, TLS or plain HTTP, caching, compression, security headers and
  logging. The output is a complete file you can drop into sites-available, and every line
  of a nested block is indented so it reads as the block it is. Anything the tool could not
  do properly is written into the output as a # !! comment rather than left in a status line,
  so a config that would not load cannot be mistaken for one that will.'
faq:
- q: Is the generated config checked against a real nginx?
  a: No, and that is worth being clear about. nginx is not installed on the machine this was
    built on, so the output is checked structurally — every server_name is validated against
    the hostname pattern, braces are balanced, indentation is consistent — and not with nginx
    -t. Read it before you reload, which is good practice with any generated config.
- q: Why is the www redirect written out as two server blocks?
  a: Because nginx has no variable that means "this host without the leading www". There is
    no way to derive one hostname from another inside a server block, so the only correct
    output is one redirect block per literal pair you typed. A single clever regex would silently
    fail for the domains it did not match.
- q: Why is http2 on; mentioned in the notes?
  a: Because that directive only exists from nginx 1.25.1 onwards; older versions used the
    http2 parameter on the listen line. The generated file uses the current form and the notes
    say which version it needs, so you find out before the reload fails rather than after.
- q: Why are the security headers repeated inside the cache location?
  a: Because add_header does not merge. A location block that sets any header of its own discards
    every add_header inherited from the parent, so the asset-cache block would quietly lose
    the security headers — on exactly the responses that are cached and served most often.
    Repeating them is the standard workaround, and the notes say why they are there twice.
---

Build an nginx server block by answering a few questions: which hostnames, static files or a reverse proxy, TLS or plain HTTP, caching, compression, security headers and logging. The output is a complete file you can drop into sites-available, and every line of a nested block is indented so it reads as the block it is. Anything the tool could not do properly is written into the output as a # !! comment rather than left in a status line, so a config that would not load cannot be mistaken for one that will.

## Generate a static-site config and read it

**Server names** already holds `example.com www.example.com`, **Serve** is **Files from a directory**, and **Serve HTTPS** and **Send HSTS** are ticked, so the **Config** panel fills in as soon as the page loads and the meta line reads `2 names · HTTPS · static`.

Skim the file in order. First the `www` redirect: a `server` block on port 80 whose `server_name` is `www.example.com` and whose only rule is `return 301 $scheme://example.com$request_uri`. It is written as one literal pair rather than one clever regex because nginx has no variable meaning \"this host without the leading www\". Then the port-80 block for `example.com` that answers `/.well-known/acme-challenge/` and redirects everything else to HTTPS, and finally the port-443 block with the certificate paths, gzip, the security headers and the `try_files $uri $uri/ =404;` location.

Click the **Reverse proxy** preset: **Serve** switches to **A program on another port**, the document-root row is replaced by **Forward to**, **Cache static assets for a year** switches off, and an `upstream` block plus `map $http_upgrade $connection_upgrade` appear at the top. Now break something on purpose by typing `exa mple.com` into **Server names**. The status turns red and a `# !! not a valid server name …` comment is written into the file itself, so a config nginx would refuse to start cannot be mistaken for a good one. A comma-separated list such as `example.com, www.example.com` is split into two names instead of becoming one invalid host.

The output is checked structurally — balanced braces, consistent indentation, hostnames against a pattern — not with `nginx -t`, because nginx is not installed here. **Copy** and **Download .conf** save the text, and the note under the file points out that `http2 on;` needs nginx 1.25.1 or newer.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Nginx Reverse Proxy Configuration](/guides/nginx-reverse-proxy/).
