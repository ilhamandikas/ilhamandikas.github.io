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
├── data/tool-guides.yaml               # long-form prose + FAQ per tool, keyed by slug
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

That script is also where three mistakes are caught before they ship, because each
one is silent otherwise: a catalog entry with no content page (a dead link in the
menu), a body partial with no catalog entry (a page nothing links to), and a tool
that is done but has no entry in `data/tool-guides.yaml` (a page with a form and no
prose for a crawler to read).

Shared building blocks keep the per-tool code small:

- `layouts/partials/tools/io.html` — the standard input → output panel
- `layouts/partials/tools/bulk.html` — "generate many" panel
- `layouts/partials/tools/cheatsheet.html` — searchable reference panel
- `assets/js/toolkit.js` — `tk.transform()`, `tk.live()`, clipboard, downloads, Base64

`assets/js/pem.js` holds the PEM/DER plumbing that only two tools need, so it is a
module rather than another toolkit helper: esbuild inlines it into the RSA and JWT
bundles and no other page downloads it. It reads PEM blocks as bytes, rebuilds the
PKCS#1 wrappers that `openssl genrsa` still prints into the PKCS#8 and SPKI shapes
WebCrypto accepts, and normalises ECDSA signatures.

That last one is worth a note, because the obvious implementation is backwards.
The WebCrypto ECDSA sign steps say to *"convert r to a byte sequence of length n and
append it to result"* — the signature is raw `R||S`, not DER, which is also exactly
what a JWS `ES256` signature already is. OpenSSL and Node's `crypto` module print
DER, so `ecdsaToRaw()` accepts either shape and returns raw. Raw is exactly `2n`
bytes and no DER `SEQUENCE` of these curves can be, so the two never collide.

Three more modules follow the same rule — shared code that only a few pages need is
a module, not a toolkit addition, so no unrelated page pays for it:

- `assets/js/jws.js` — the JWS mechanism itself (header/payload encoding, key
  import, signing, verification), used by the JWT parser and the JWT editor. It
  refuses `alg: none`, refuses algorithm confusion, and refuses SEC1 EC keys
  instead of guessing the curve.
- `assets/js/qr.js` — the QR renderer, used by the generator, the Wi-Fi generator
  and the editor. One encoder, three pages, one set of measured logo limits.
- `assets/js/hash.js` — MD5 plus the WebCrypto digests, used by the text hasher and
  the file hash checker.

### Remembering what you typed

Two small modules keep state on your device, and both are opt-in.

`assets/js/tools-recent.js` records **only the slug and a timestamp** of the tools
you open, so the sidebar and the catalog can offer a "Recently used" list. It never
records what you typed. `assets/js/tools-memory.js` is the part that can record what
you typed, and it asks first: a bar appears under the tool explaining that the
values would be stored in this browser, that they would survive a refresh, and that
anything stored on a device can be read by someone else who gets access to it. Say
no and nothing is written. Say yes and the fields of that one tool are restored next
time, with a "Forget" button to delete them.

Passwords, file inputs, hidden fields and anything marked `data-no-memory` are never
written down, whatever the answer is — a tool page can hold a private key or a signed
token, and a convenience feature is not a reason to persist one. Every `localStorage`
access is wrapped, because private mode throws rather than returning null.

### What the pages cost

The numbers below are the built bundles in `public/`, raw and gzip -9. Only the
bundle a page actually names is loaded, so a tool that does not use the QR renderer
never downloads it — that is the whole point of the module split.

| bundle | raw | gzip |
| --- | --- | --- |
| `toolkit.js` | 5.2 KB | 2.3 KB |
| `tools-nav.js` (sidebar search) | 6.6 KB | 2.9 KB |
| `tools-catalog.js` (catalog page, includes the recent list) | 5.4 KB | 2.4 KB |
| `tools-memory.js` | 3.3 KB | 1.4 KB |
| `qr-code-generator.js` (includes `qr.js`) | 32.6 KB | 12.6 KB |
| `qr-editor.js` (includes `qr.js`) | 34.5 KB | 13.1 KB |
| `image-metadata.js` | 16.7 KB | 6.6 KB |
| `nginx-config-generator.js` | 11.7 KB | 4.7 KB |
| `http-request-tester.js` | 11.8 KB | 4.5 KB |
| `ssh-key-generator.js` | 7.8 KB | 3.3 KB |
| `file-hash-checker.js` (includes `hash.js`) | 6.0 KB | 2.7 KB |
| `jwt-editor.js` (includes `jws.js` + `pem.js`) | 6.0 KB | 2.5 KB |
| `websocket-tester.js` | 4.9 KB | 2.1 KB |

The QR bundle is the outlier because it carries the encoder. Splitting the encoder
out would turn one request into two for the three pages that need it and save
nothing for the ninety-five that do not.

That last one is worth a note, because the obvious implementation is backwards.
The WebCrypto ECDSA sign steps say to *"convert r to a byte sequence of length n and
append it to result"* — the signature is raw `R||S`, not DER, which is also exactly
what a JWS `ES256` signature already is. OpenSSL and Node's `crypto` module print
DER, so `ecdsaToRaw()` accepts either shape and returns raw. Raw is exactly `2n`
bytes and no DER `SEQUENCE` of these curves can be, so the two never collide.

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

`assets/js/tools-search.js` is the whole matcher — about 300 lines, no
`fuse.js`. It scores instead of filtering, because plain substring matching ranks
badly: `haystack.includes('ip')` puts JSON Minifier first (`str-IP`),
AES Encryption second (`c-IP-her`) and the actual IP tool fourth.

Each query token is scored against the name, the keywords and the description,
and keeps its best tier — `word` (+40), `stem` (+35), `prefix` (+25), `substring`
(+10), `typo` (+5) or `subsequence` (0) — with the field deciding the base (name
100, keywords 60, description 30). **Every token must match something**, so
`json yaml` cannot quietly degrade into "anything mentioning json". Four guards
keep the fuzzy tiers from becoming noise, and every one of them was found by
trying the obvious version first and watching it fail:

- a typo must agree on the first letter, or `time` matches `mime`
- a subsequence must start a word and cover 45% of it, or `hash` matches
  `cheatsheet` (`h-a-s-h` in order) and every search returns rubbish
- a token may not fuzzy-match at all until the query has more than one token to
  agree on it, or `ean` finds `expander`
- the run-together comparison is not a substring comparison, or `imei` finds
  Timestamp Converter — it sits inside `date time iso` once the spaces go

Singular and plural meet in the middle, so `html entity` finds HTML Entities and
`status code` finds HTTP Status Codes. Two fallbacks cover the rest, and both are
fallbacks rather than extra scores, so neither can displace a match that already
worked:

- the query with its spaces removed is compared against the field with its spaces
  removed, which is how `qrcode`, `qrgenerator` and `jsonformatter` find their
  tools
- if the strict pass finds nothing at all *and* the query has more than one token,
  it is scored again with the guards loosened. That is how `qt generater` finds
  QR Code Generator: `generater` pins the entry down, so `qt` is allowed to be
  one edit from `qr` even though it is also one edit from `js`, `go` and `os`

A bare `2` is read as `to` at token level, which unlocks all ten "X to Y" tools
at once; whole tokens only, so `sha 256` is left alone.

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

The index is built from the 98 names already in the sidebar plus a
`data-keywords` attribute per link: **+1.7 KB gzip per tool page** (5.3 KB →
7.0 KB, measured by gzipping the built page with and without the attributes), no
extra request. Moving the keywords into the shared JS bundle would save that, but
Hugo 0.123 does not inject `js.Build` `params`, and a build-time `defines` blob is
more machinery than 1.7 KB is worth.

Keywords decide what is findable at all, and no algorithm can invent them: the
phrases `unique id`, `bearer`, `bcrypt generator`, `color picker`, `screen size`
and `keyboard shortcut` all returned nothing until the word was added to
`data/tools.yaml`. When a search "does not work", check the data before the
matcher.

**The sidebar survives a navigation.** Pressing Enter on a result replaces the
whole document, so a query that only lived in `tools-nav.js` vanished and the
list snapped back to its full 98 entries — which reads as a page refresh. The
query and the sidebar's scroll offset now go into `sessionStorage` on `pagehide`
(`pagehide`, not `beforeunload`, so the back/forward cache is covered too) and
are restored before the first paint. The effect is that you can keep narrowing a
search from one tool to the next: delete a character and more tools appear,
clear the field and all 98 come back.

`.tool-aside` also carries `view-transition-name: tool-nav`, so a cross-document
view transition holds the panel still instead of fading it out with the rest of
the page. The scroll offset has to be restored for that to look right — without
it the two snapshots would cross-fade two different scroll positions.

Deleting characters widening the list is not special code: every `input` event
re-runs the same filter, so the list is simply recomputed from a shorter query.

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
  renders them under the tool. All 98 tools are written up, by hand — there is
  deliberately **no generated fallback**, because padding a page with
  near-identical filler would be worse for a reader and worse for a crawler than
  leaving it short. To add or change one, edit the file; `sync-tools.py` fails the
  build if a key does not match a real slug, and it also fails if a tool is done
  and has no entry at all, because "I will write it later" is how a page ends up
  with no prose.
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
  unavailable the previously stamped date is kept rather than dropped. The same
  limitation applies to `data/tool-guides.yaml`: it is one file covering every
  tool, so a prose change cannot be attributed to a single page and does not move
  that page's date.

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

Two parts of the suite are worth calling out because they would otherwise be easy
to fake. The network tools run against a mocked `fetch`, so the assertions are
about the parsing rather than the internet. The crypto tools generate their keys
and signatures at test time with Node's `crypto` module — two unrelated RSA pairs
and one EC pair, a real HMAC, and real RS256, PS256 and ES256 tokens — so the
verifier is checked against an independent implementation instead of against a
stored fixture that could encode the same misunderstanding twice. The suite has
already caught one such misunderstanding: ECDSA signatures are raw `R||S` in
WebCrypto, and a test written the other way round fails loudly.

Where a real tool can act as an oracle it is used instead of a second copy of the
same logic:

- **QR codes** are rasterised by a second, independent implementation and decoded
  with `jsqr`. The oracle samples module cell centres the way a scanner does and
  classifies shapes by role rather than colour, so it cannot agree with a bug in the
  renderer.
- **SSH keys** are handed to the real `ssh-keygen`: `-y` to derive the public key,
  `-lf` and `-E md5 -lf` for both fingerprint forms, a `-Y sign` / `-Y verify` round
  trip to prove the private key works, and `openssl pkey -check` on the PKCS#8 copy.
  This is where the OpenSSH private-key format decision came from — PKCS#8 Ed25519
  is *measured* to be unreadable by OpenSSH 9.6, not assumed to be.
- **File hashes** are compared against `crypto.createHash` over bytes that are
  deliberately not valid UTF-8.

Two limits are worth stating rather than glossing over. jsdom has no layout engine,
no canvas and no `<script type="module">`, so the PNG export path, the QR logo
upload and anything that depends on real geometry are not covered here. And `nginx`
is not installed, so the generated config is checked structurally — every
`server_name` against the hostname pattern, brace balance, indentation — and not
with `nginx -t`. The PASS count is a `grep` tally of `PASS` lines, and a green suite
is not a substitute for clicking through the pages once.

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
