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

### Finding a tool

`assets/js/tools-search.js` is the whole matcher — about 150 lines, no
`fuse.js`. It scores instead of filtering, because plain substring matching ranks
badly: `haystack.includes('ip')` puts JSON Minifier first (`str-IP`),
AES Encryption second (`c-IP-her`) and the actual IP tool fourth.

Each query token is scored against the name, the keywords and the description,
and keeps its best tier — `word` (+40), `prefix` (+25), `substring` (+10), `typo`
(+5) or `subsequence` (0) — with the field deciding the base (name 100, keywords
60, description 30). **Every token must match something**, so `json yaml` cannot
quietly degrade into "anything mentioning json". Two guards keep the fuzzy tiers
from becoming noise, and both were found by trying the obvious version first:

- a typo must agree on the first letter, or `time` matches `mime`
- a subsequence must start a word and cover 45% of it, or `hash` matches
  `cheatsheet` (`h-a-s-h` in order) and every search returns rubbish

Ranking is applied with CSS `order` rather than by moving nodes, so the
prerendered markup stays put and no DOM is rebuilt on each keystroke.
`tools-catalog.js` ranks cards inside their grid and the groups around them;
`tools-nav.js` ranks the sidebar. Both read the name and description back out of
the markup and take only `data-keywords` as an attribute.

`order` only works on flex and grid items, which is a trap: a flex item's
default `order` is `0` and ranked items use negative values, so anything that
shares the container with them silently sorts *below* the results. In the sidebar
that put the search field at the bottom of the list. Only the ranked groups
belong in that container, so they get their own `.tool-nav-list` wrapper and the
field stays outside it — asserted structurally, since jsdom cannot measure
layout.

**Cmd+K works everywhere, not just on `/tools/`.** On a tool page the sidebar
carries its own field: typing filters and ranks, ↑/↓ move the selection, Enter
opens the row, and Escape clears then blurs. The categories are dropped while a
query is active so the sidebar reads as one flat result list — which is also what
makes Enter safe, since the preselected row is then the best match instead of
whichever tool happens to come first in the menu. The field lives inside the
collapsible `.tool-nav`, so on narrow screens it appears with "Browse all tools"
rather than pushing the tool down the page.

The index is built from the 90 names already in the sidebar plus a
`data-keywords` attribute per link: **+1.6 KB gzip per tool page** (4.0 KB →
5.6 KB), no extra request. Moving the keywords into the shared JS bundle would
save that, but Hugo 0.123 does not inject `js.Build` `params`, and a build-time
`defines` blob is more machinery than 1.6 KB is worth.

Keywords decide what is findable at all, and no algorithm can invent them: the
phrases `unique id`, `bearer`, `bcrypt generator`, `color picker`, `screen size`
and `keyboard shortcut` all returned nothing until the word was added to
`data/tools.yaml`. When a search "does not work", check the data before the
matcher.

A related bug this work surfaced: `el.hidden = true` did **not** hide anything
styled `display: flex`, because an author rule beats the user-agent `[hidden]`
rule. The catalog filter had been updating the property without hiding the cards.
`styles.css` now carries `[hidden] { display: none !important }`, and because
jsdom has no layout engine the test asserts it by reading the built stylesheet.

### Search and indexing

A tool page is a form and some labels. Left alone that is about thirty words of
crawlable text, which is not enough for a search engine to decide the page is
about anything in particular. Two things fix that, and one thing deliberately
isn't done.

- **Written content, per tool.** `data/tool-guides.yaml` holds an `about`
  paragraph and a short `faq` for each tool, and `partials/tools/about.html`
  renders them under the tool. All 90 tools are written up. A tool with no entry
  renders no section — there is deliberately **no generated fallback**, because
  padding a page with near-identical filler would be worse for a reader and
  worse for a crawler than leaving it short. To add or change one, edit the file;
  `sync-tools.py` fails the build if a key does not match a real slug, so a typo
  cannot quietly render nothing.
- **Structured data.** `partials/schema.html` emits one `@graph` per page. Tool
  pages get `SoftwareApplication` (free, browser-based, `offers.price` of `0`)
  plus a `BreadcrumbList`, and an `FAQPage` when the tool has written questions.
  The catalog gets `CollectionPage` with an `ItemList` of every tool. Posts stay
  `BlogPosting`; the home page stays `WebSite`.
- **Freshness.** `sync-tools.py` stamps a `lastmod` into each tool's front
  matter, which is what puts a date in the sitemap. It is derived from the last
  commit that touched that tool's **JS and body partial only** — the content file
  is generated by the same script, so counting it would make every sync look like
  a change to every tool and the dates would drift forever. If git history is
  unavailable the previously stamped date is kept rather than dropped.

`head.html` also asks for the full search snippet:
`max-snippet:-1, max-image-preview:large, max-video-preview:-1`.

What this does **not** do is win a competitive head term. "QR code generator" is
held by sites with years of backlinks and real domain authority, and no amount of
on-page markup changes that. What the work above does buy is correct indexing,
rich results (breadcrumbs, an app listing) and a real chance at the long tail —
"qr code generator no signup", "json formatter sort keys", "whois lookup rdap".

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
