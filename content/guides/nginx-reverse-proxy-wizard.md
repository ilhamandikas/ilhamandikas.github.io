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
about: A guided way to write a reverse proxy server block. Step through the domain, the upstream
  pool (one or more hosts, a balancing method and keepalive), TLS with a plain-HTTP redirect,
  and the extras an app usually needs — WebSocket upgrade, streaming, security headers and
  upload size. The config is built live beside the steps and can be copied or downloaded.
faq:
- q: Why is there an upstream block instead of a plain proxy_pass?
  a: An upstream block lets nginx pool several backends, apply a balancing method, and reuse
    connections with keepalive. A bare proxy_pass to one host opens a new connection per request.
    The wizard always writes an upstream so the config can grow without being rewritten.
- q: Why does the WebSocket option add a map block?
  a: nginx cannot choose between the upgrade and close values inline, and the Connection header
    has to match the request. The map block turns $http_upgrade into $connection_upgrade once,
    and the location uses it. Without the map, the header would be wrong for either WebSockets
    or ordinary requests.
- q: Does the app see the real client IP?
  a: The location forwards X-Real-IP, X-Forwarded-For and X-Forwarded-Proto, so the app can
    read the original client and scheme. Make sure the app trusts those headers only from
    nginx, or a client could spoof them.
- q: Why skip keepalive when the target is https?
  a: Keepalive to an upstream needs HTTP/1.1 over a plain connection to reuse cleanly. An
    https target means a TLS handshake per connection, so the wizard leaves keepalive out
    and says so rather than pretending it helps.
---

A guided way to write a reverse proxy server block. Step through the domain, the upstream pool (one or more hosts, a balancing method and keepalive), TLS with a plain-HTTP redirect, and the extras an app usually needs — WebSocket upgrade, streaming, security headers and upload size. The config is built live beside the steps and can be copied or downloaded.

## Step through a proxy config

Step **1 · Domain** holds `app.example.com` in **Server names** with **Canonical host** set to **Keep every name as typed**. The **Config** panel is already filled, so watch it change as you answer. Press **Next** to reach **2 · Upstream**, where **Upstream target** is `http://127.0.0.1:3000`, **Balancing** is **Round robin** and **Keepalive connections** is `32`.

On **3 · TLS**, clear **Serve HTTPS and redirect plain HTTP**: the certificate rows and **Send HSTS** disappear from the form, and the config loses its `ssl_certificate` lines and the port-80 redirect block. Turn it back on. On **4 · Extras**, clear **WebSocket / SSE upgrade** and the `map $http_upgrade $connection_upgrade` block near the top disappears along with the two `Upgrade`/`Connection` proxy headers; it takes a map because nginx cannot choose between `upgrade` and `close` inline. Clear **Disable buffering (streaming)** and `proxy_buffering off;` goes with it.

Put one host per line in **Extra upstream servers** and the upstream block grows a `server` line for each, with the balancing method sitting above them. Switch **Balancing** to **Sticky by IP (ip_hash)** and that directive replaces the default. Change **Upstream target** to `https://127.0.0.1:3000` and the wizard adds a comment that keepalive was skipped, because an HTTPS upstream cannot reuse connections the same way. Type `127.0.0.1:3000` with no scheme and the config empties while the status asks for a URL shaped like `http://host:port`.

The numbered step buttons jump straight to a section, **Back** and **Next** walk through them, and **Copy** and **Download** take the current file.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Nginx Reverse Proxy Configuration](/guides/nginx-reverse-proxy/).
