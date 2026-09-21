---
title: "Hello, world"
date: 2026-08-20
description: "Why this site exists, what I plan to write about, and how it is built."
tags: ["meta", "writing"]
---

This is the first post on a site that has been a long time coming. I have wanted a
quiet corner of the internet for a while — somewhere to write down what I learn,
without the noise and the feed.

## What to expect

I plan to write about the things I actually spend my days on:

- backend services and the data models behind them;
- Linux, containers, networking, and running real workloads on small machines;
- automation, tooling, and the small decisions that make systems easier to live with.

Posts will be short and practical. If something took me an afternoon to figure out,
it is probably worth a few paragraphs so the next person does not have to.

## How this site is built

The whole site is generated from Markdown. Every post is a plain `.md` file with a
little front matter, and a static site generator turns those files into HTML at build
time. No database, no admin panel, nothing to patch — the output is just files.

That means the published site is:

1. **fast**, because every page is served as a static file;
2. **cheap to run**, because there is no application server involved;
3. **hard to break**, because there is so little moving at request time.

You can read more about that choice in
[Why this site is a static site](/posts/why-this-site-is-static/).

Thanks for stopping by. More soon.
