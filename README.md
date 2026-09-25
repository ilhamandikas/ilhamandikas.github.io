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

## Tools (`/tools/`)

A catalog of small browser-side utilities. Everything runs locally — no data is ever
sent anywhere.

The list of tools lives in `data/tools.yaml` (grouped by category). It is the single
source of truth for the catalog page, the sidebar menu, search and the "soon" badges.

```
├── data/tools.yaml                     # catalog: slug, name, description, keywords, status
├── content/tools/<slug>.md             # front matter only (title, description, js)
├── layouts/tools/list.html             # catalog + search
├── layouts/tools/single.html           # one tool page (sidebar + body partial)
├── layouts/partials/tools/body/*.html  # the UI for each tool (one partial per tool)
├── assets/js/toolkit.js                # shared helpers exposed as window.tk
├── assets/js/tools/<slug>.js           # the logic for each tool
└── assets/js/vendor/*.js               # pre-bundled third-party libraries (committed)
```

A tool is "done" once it has a body partial under
`layouts/partials/tools/body/`. After adding or removing one, run:

```bash
python3 scripts/sync-tools.py     # flips `status` in data/tools.yaml, normalises front matter
rm -rf public && hugo --gc --minify
```

Shared building blocks keep the per-tool code small:

- `layouts/partials/tools/io.html` — the standard input → output panel
- `layouts/partials/tools/bulk.html` — "generate many" panel
- `layouts/partials/tools/cheatsheet.html` — searchable reference panel
- `assets/js/toolkit.js` — `tk.transform()`, `tk.live()`, clipboard, downloads, Base64

### Vendored libraries

Most tools are written from scratch on top of browser APIs (WebCrypto, `DOMParser`,
`MediaRecorder`, …). A few need a library, and those are bundled ahead of time:

```bash
npm install          # once
npm run vendor       # rebuilds assets/js/vendor/*.js with esbuild
```

The generated bundles are **committed**, so the Hugo build and the CI workflow stay
npm-free. Only the MIT-licensed sources in `package.json` are bundled; the tools,
markup, styling and copy are original.

### Page loading

Navigation is a normal full document swap, so three small things keep it feeling
quick. All three are progressive enhancement — a browser that doesn't understand
them navigates exactly as it did before.

- **Modules are declared in `<head>`.** Every per-page `scripts` block holds only
  `type=module` tags, and modules are deferred, so they never block parsing.
  Putting them at the top means the browser starts downloading them while it is
  still reading the page instead of only spotting them at the very end.
- **Speculation rules prerender on hover.** `head.html` emits a
  `type=speculationrules` block with `"eagerness": "moderate"`, so the page under
  the pointer is built in the background and the click lands on something already
  rendered. Feeds are excluded, and any link can opt out with
  `data-no-prerender`.
- **Cross-document view transitions.** `@view-transition { navigation: auto }` in
  `styles.css` cross-fades the content and holds the header still, so the swap
  reads as one page flowing into the next.

A background prerender **runs the page's script**. Anything a tool does on load
that costs something real — a network request, opening a camera — has to wait for
the page to actually be shown:

```js
tk.whenActive(lookup);   // not: lookup();
```

`tk.whenActive()` runs the callback straight away in every ordinary visit, and
otherwise waits for the `prerenderingchange` event. `ip-lookup` is the one tool
that needs this today; it is a requirement for any future tool that fetches on
load.

### Testing

The tools are plain browser code, so they are tested against a real DOM rather than
a bundler or a framework. `scripts/domtest/` boots every built page in jsdom, runs
the bundled script, then fills each field, clicks each button and checks the output:

```bash
npm install          # once — jsdom is a devDependency
rm -rf public && hugo --gc --minify
npm run test:dom     # smoke test + end-to-end assertions
```

`smoke.cjs` reports anything that throws outside a tool's own error handling, plus
any page that shows an error before the visitor has typed anything. `e2e.cjs` pins
exact expected output (Base64, slugify, roman numerals, JSON key sorting, …) and
checks the converter round trips (JSON→YAML→JSON, XML→JSON→XML, and so on).

This is a development aid only: it is not part of the build and CI never runs it.

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
