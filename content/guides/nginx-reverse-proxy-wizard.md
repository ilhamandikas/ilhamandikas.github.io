---
title: nginx Reverse Proxy Wizard Guide
description: Step through domain, upstream, TLS and extras to get a reverse proxy server block.
date: '2026-09-27'
tags:
- workflow
tool_guide_slug: nginx-reverse-proxy-wizard
broader_guide:
  title: Nginx Reverse Proxy Configuration
  url: /guides/nginx-reverse-proxy/
---

A guided way to write a reverse proxy server block. Step through the domain, the upstream pool (one or more hosts, a balancing method and keepalive), TLS with a plain-HTTP redirect, and the extras an app usually needs — WebSocket upgrade, streaming, security headers and upload size. The config is built live beside the steps and can be copied or downloaded.

## Open the tool

[Use nginx Reverse Proxy Wizard](/tools/nginx-reverse-proxy-wizard/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is there an upstream block instead of a plain proxy_pass?

An upstream block lets nginx pool several backends, apply a balancing method, and reuse connections with keepalive. A bare proxy_pass to one host opens a new connection per request. The wizard always writes an upstream so the config can grow without being rewritten.

### Why does the WebSocket option add a map block?

nginx cannot choose between the upgrade and close values inline, and the Connection header has to match the request. The map block turns $http_upgrade into $connection_upgrade once, and the location uses it. Without the map, the header would be wrong for either WebSockets or ordinary requests.

### Does the app see the real client IP?

The location forwards X-Real-IP, X-Forwarded-For and X-Forwarded-Proto, so the app can read the original client and scheme. Make sure the app trusts those headers only from nginx, or a client could spoof them.

### Why skip keepalive when the target is https?

Keepalive to an upstream needs HTTP/1.1 over a plain connection to reuse cleanly. An https target means a TLS handshake per connection, so the wizard leaves keepalive out and says so rather than pretending it helps.

## Related guide

For more background, read [Nginx Reverse Proxy Configuration](/guides/nginx-reverse-proxy/).
