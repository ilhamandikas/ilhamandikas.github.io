# ilham.dev

Static site for **https://ilham.dev**, generated with [Hugo](https://gohugo.io/)
from Markdown. Flat-white theme, static and serverless, no database.

## Layout

```
ilham-dev/
├── hugo.toml              # site config (title, author, email for Gravatar, params)
├── content/
│   ├── posts/*.md         # blog posts (Markdown + front matter)
│   └── *.md               # profile and legal pages
├── layouts/               # templates (flat-white theme) + robots.txt
├── assets/css/            # styles.css + generated chroma.css, bundled at build
├── static/                # copied as-is: favicon, og.png, .well-known/
├── deploy.sh              # optional: publish to a static web root
└── new-post.sh            # scaffold a new draft post
```

## Writing a post

```bash
./new-post.sh my-post-slug        # creates content/posts/my-post-slug.md
$EDITOR content/posts/my-post-slug.md
# set `draft: false` when ready
git add -A && git commit -m "post: my post" && git push   # live in ~1 minute
```

Front matter:

```yaml
---
title: "Post title"
date: 2026-09-20
description: "One-line summary shown in lists and meta tags."
tags: ["infrastructure", "linux"]
draft: false
---
```

## Local preview

```bash
hugo server -D            # http://localhost:1313, live reload, drafts included
```

## Deploy

Pushing to `main` triggers `.github/workflows/hugo.yml`, which builds the site and
publishes it to GitHub Pages at <https://ilham.dev>. There is nothing else to run.

`./deploy.sh` is an optional fallback that builds `public/` and rsyncs it to a static
web root, in case the site ever needs to be served from a server again. The target is
the current directory (`$PWD`); run it from there, or set `SITE_DIR` to override:

```bash
cd /srv/www/ilham.dev && /path/to/ilham-dev/deploy.sh
# or
SITE_DIR=/srv/www/ilham.dev ./deploy.sh
```

Setting `SUDO=sudo` and `OWNER=user:group` is optional and only needed when the target
directory requires elevated rights and a specific ownership:

```bash
SITE_DIR=/srv/www/ilham.dev SUDO=sudo OWNER=www-data:www-data ./deploy.sh
```

CSS is minified and fingerprinted by Hugo (hashed filename), so caches are bypassed
automatically on every build.

## Configuration notes

- **Gravatar**: the profile picture is derived from `params.email` in `hugo.toml`
  (MD5 of the lowercase address). Change that value to change the avatar.
- **Analytics**: none. The Site is fully static and serverless; no analytics service is
  loaded.
- **Legal pages**: edit `content/terms.md` and `content/privacy.md`; update the
  `lastmod` field when you change them.
- **Syntax highlighting**: `assets/css/chroma.css` is generated with
  `hugo gen chromastyles --style=github` and must stay in sync with
  `markup.highlight.style` in `hugo.toml`; it is concatenated with `styles.css`
  into a single stylesheet at build time.
