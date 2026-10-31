# ilham.dev

**ilham.dev** is my personal website for writing down the things I work on and learn along the way — mostly around backend engineering, servers, infrastructure, databases, automation, and the occasional tool I wish already existed.

The site has three main parts:

- **Posts** — notes, write-ups, incidents, experiments, and lessons from real work.
- **Guides** — longer, more structured walkthroughs for specific topics and tools.
- **Tools** — small browser-based utilities for developers and infrastructure work.

Everything is built as a static site with [Hugo](https://gohugo.io/) and deployed to GitHub Pages. There is no application server or database behind the website.

Visit the site at **https://ilham.dev**.

## Tech stack

- Hugo
- Markdown
- HTML / CSS
- Vanilla JavaScript
- GitHub Actions
- GitHub Pages

Most tools run entirely in the browser. Some third-party libraries are bundled into the repository for tools that need them.

## Run locally

You only need Hugo for the normal site workflow.

```bash
git clone https://github.com/ilhamandikas/ilhamandikas.github.io.git
cd ilhamandikas.github.io
hugo server -D
```

Then open:

```text
http://localhost:1313
```

`-D` includes draft content while developing locally.

## Writing a post

Create a new draft with:

```bash
./new-post.sh my-post-slug
```

Then edit:

```text
content/posts/my-post-slug.md
```

A typical post starts with front matter like this:

```yaml
---
title: "Post title"
date: 2026-09-20
description: "A short summary of the post."
tags: ["infrastructure", "linux"]
draft: false
---
```

Set `draft: false` when the post is ready to publish.

## Tools

The `/tools/` section contains small utilities that run in the browser.

Tool metadata lives in:

```text
data/tools.yaml
```

A tool normally consists of:

```text
content/tools/<slug>.md
layouts/partials/tools/body/<slug>.html
assets/js/tools/<slug>.js
```

After adding or removing a tool, run:

```bash
python3 scripts/sync-tools.py
```

This keeps the tool catalog and generated tool pages in sync.

If you are changing one of the vendored JavaScript libraries, install the dependencies and rebuild them with:

```bash
npm install
npm run vendor
```

The generated bundles are committed to the repository, so a normal Hugo build does not need npm.

## Project structure

```text
.
├── content/
│   ├── posts/          # blog posts
│   ├── guides/         # guides and walkthroughs
│   └── tools/          # tool pages
├── data/               # structured site and tool data
├── layouts/            # Hugo templates and partials
├── assets/
│   ├── css/            # styles
│   └── js/             # site and tool JavaScript
├── static/             # files copied directly to the published site
├── scripts/            # maintenance and build helpers
├── hugo.toml            # Hugo configuration
└── new-post.sh          # helper for creating a new post
```

## Build

To create a production build locally:

```bash
hugo --gc --minify
```

The generated site is written to:

```text
public/
```

## Deployment

The site is deployed automatically.

Every push to `main` triggers GitHub Actions, builds the Hugo site, and publishes it to GitHub Pages.

For the normal workflow, there is no separate server deployment step to run manually.

## About the project

This repository is intentionally both a personal website and a practical knowledge base.

The goal is not to publish polished theory. It is to document real problems, the approaches I tried, what worked, what failed, and the commands or tools that were useful enough to keep around.

That is why the site mixes writing with small utilities: many of the tools started from repetitive tasks I did while working with servers, applications, logs, APIs, certificates, data, and infrastructure.
