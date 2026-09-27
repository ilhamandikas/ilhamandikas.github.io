---
title: Nginx Reverse Proxy Configuration
description: Common nginx reverse proxy configuration patterns, headers, upstreams,
  TLS, and debugging checks.
date: '2026-09-27'
tags:
- devops
aliases:
- /posts/how-to-build-a-basic-nginx-config/
- /posts/how-to-build-nginx-reverse-proxy-config/
---

A reverse proxy receives a request and passes it to another service. When a page fails through nginx but works when you call the app directly, first check which part of that path differs.

## Start with a minimal route

Confirm the app listens on the address and port nginx uses, then proxy one location to it. Test the configuration with `nginx -t` before reloading. Keep a known-good version: a generator can give you a starting point, but it cannot know your server's paths, DNS, certificates, or application requirements.

## Follow the headers

An app behind a proxy may need to know the original host and scheme. `Host` and `X-Forwarded-Proto` can carry that information, but the app must be configured to trust the right proxy. For WebSockets, the HTTP upgrade requires additional forwarding headers; a normal HTTP page working does not prove the socket will connect.

If the browser shows a TLS error, check the certificate and hostname before editing upstream settings. If nginx returns `502`, check whether it can actually reach the upstream.

## Related tools

- [nginx Config Generator](/tools/nginx-config-generator/) — Build an nginx server block for a static site, a single-page app, PHP or a reverse proxy.
- [nginx Reverse Proxy Wizard](/tools/nginx-reverse-proxy-wizard/) — Step through domain, upstream, TLS and extras to get a reverse proxy server block.
