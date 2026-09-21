---
title: "Why this site is a static site"
date: 2026-08-30
description: "Markdown in, HTML out — and why that is still a good deal in 2026."
tags: ["hugo", "static-sites"]
---

When people hear "blog" they often picture a database, a login screen, and a
dashboard full of plugins. You can absolutely run it that way. But if all you are
publishing is words, a static site is a very good deal.

## The idea is simple

A static site generator reads your content — usually Markdown — and your templates,
then writes a folder full of HTML, CSS, and images. That folder is the entire website.
Serving it is just handing files to whoever asks.

The workflow looks like this:

1. write a Markdown file in `content/posts/`;
2. run the build;
3. copy the output to the web root.

That is the whole pipeline. There is no request-time rendering to reason about.

## What you get

- **Speed**, because there is no application to boot per request.
- **Security**, because there is no admin panel, no session store, and no database to
  attack.
- **Portability**, because the output is plain files that any web server can host.
- **Durability**, because your content is text you own, not rows inside a product.

## What you give up

Static sites are not the right tool for everything. If you need comments,
personalization, or a live editing experience for non-technical writers, you will end
up bolting those on — or you should pick a different tool on purpose.

For a personal site, the trade is usually worth it. The content stays in plain text,
the deployment stays boring, and the only thing that can really break is the build —
which you run before anything goes live anyway.
