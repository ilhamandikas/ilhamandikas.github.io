# SEO Checklist

This document defines the SEO and discoverability checks for **ilham.dev**.

The goal is not to maximize keyword density or create content for search engines.

The goal is to make useful content:

- easy to discover
- easy to understand
- technically correct
- correctly indexed
- stable over time

SEO must never override correctness, privacy, usability, or site identity.

---

# Core Principles

Prefer:

```text
useful content
clear structure
stable URLs
accurate metadata
good internal linking
fast pages
semantic HTML
```

Avoid:

```text
keyword stuffing
doorway pages
mass-generated content
fake freshness
duplicate articles
SEO-only pages
misleading titles
```

---

# Page-Level Checklist

Every public page should be reviewed for:

- [ ] Unique page title
- [ ] Accurate meta description
- [ ] Correct canonical URL
- [ ] Valid heading structure
- [ ] Clear page purpose
- [ ] Useful internal links
- [ ] No accidental `noindex`
- [ ] No broken resources
- [ ] No duplicate canonical
- [ ] Appropriate structured data where relevant

---

# Title

Titles should be:

- descriptive
- concise
- unique
- natural
- aligned with visible page content

Good:

```text
JWT Decoder
Debugging CORS Without Guessing
Why the Comments Live on GitHub
```

Avoid:

```text
Best Free Online JWT Decoder Tool 2026
Ultimate CORS Guide for Developers
```

Do not add unnecessary marketing terms.

---

# Title Consistency

The visible H1 and document title may differ slightly, but they should describe the same page.

Example:

```text
<title>
JWT Decoder — ilham.dev
```

Visible:

```text
JWT Decoder
```

Avoid unrelated or misleading title variations.

---

# Meta Description

Descriptions should explain what the page offers.

Good:

```text
Decode JWT headers and payloads directly in your browser.
```

Good:

```text
A practical guide to understanding and debugging CORS errors.
```

Avoid:

```text
The best and most powerful online tool for all your needs.
```

Descriptions should be written for humans first.

---

# Canonical URL

Every indexable page should have a correct canonical URL.

Example:

```html
<link rel="canonical" href="https://ilham.dev/tools/jwt-decoder/">
```

Canonical URLs should:

- use HTTPS
- use the preferred hostname
- use the final public path
- avoid query strings unless required

---

# Canonical Self-Reference

Normal public pages should usually canonicalize to themselves.

Example:

```text
/tools/jwt-decoder/
→ canonical:
/tools/jwt-decoder/
```

Do not canonicalize unrelated pages together.

---

# URL Rules

Public URLs should be:

```text
short
stable
descriptive
predictable
```

Good:

```text
/tools/cidr-calculator/
/guides/debugging-cors/
/posts/why-comments-live-on-github/
```

Avoid:

```text
/tools/best-free-cidr-ip-subnet-calculator-online-2026/
```

Do not change a URL simply because a title changes.

---

# URL Migration

When moving content:

```text
OLD
/posts/debugging-jwt/

NEW
/guides/debugging-jwt/
```

verify:

- [ ] Old URL redirects permanently
- [ ] New URL returns `200`
- [ ] Canonical points to new URL
- [ ] Sitemap uses new URL
- [ ] Internal links use new URL
- [ ] Related-content links are updated
- [ ] Feeds are updated if applicable
- [ ] No redirect chain is created

Preferred:

```text
A → C
```

Avoid:

```text
A → B → C
```

---

# Redirects

Use permanent redirects for permanent moves.

Prefer:

```text
301
```

or equivalent permanent behavior supported by the platform.

Do not redirect unrelated deleted pages to the homepage.

A removed page should either:

- redirect to a genuine replacement
- return `404`
- return `410` when intentionally gone

---

# Hugo Aliases

If Hugo aliases are used:

```yaml
aliases:
  - /posts/old-url/
```

verify the generated behavior.

Do not assume alias configuration automatically behaves exactly like an infrastructure-level 301 redirect.

---

# Heading Structure

Use semantic heading hierarchy.

Preferred:

```text
H1
  H2
    H3
```

Avoid:

```text
H1
H4
H2
```

unless the document structure genuinely requires it.

---

# H1

Each primary page should normally have one clear H1.

The H1 should explain what the page is.

Good:

```text
CIDR Calculator
```

Avoid generic headings:

```text
Welcome
Tool
Article
```

---

# Semantic HTML

Prefer:

```html
<header>
<nav>
<main>
<article>
<section>
<footer>
```

where appropriate.

Do not use layout `<div>` elements to replace semantic document structure unnecessarily.

---

# Robots

Review:

```text
/robots.txt
```

Check that important public content is not blocked.

Verify rules for:

```text
/tools/
/guides/
/posts/
```

Do not block resources required to render the page.

---

# `noindex`

Use `noindex` intentionally.

Possible candidates:

- internal search results
- unfinished pages
- duplicate utility states
- private/internal pages

Do not accidentally apply `noindex` globally.

---

# Sitemap

The sitemap should include canonical public URLs.

Check:

- [ ] Homepage
- [ ] About
- [ ] Posts
- [ ] Guides
- [ ] Tools
- [ ] Important taxonomy pages where relevant

Exclude pages that should not be indexed.

---

# Sitemap Consistency

A sitemap entry should not:

- redirect
- return `404`
- canonicalize to another page
- be `noindex`

Sitemap URLs should represent final canonical pages.

---

# Search Console

After major structural changes, review Google Search Console.

Useful areas:

```text
Pages
Sitemaps
URL Inspection
Core Web Vitals
Enhancements
```

Look for:

```text
Crawled - currently not indexed
Discovered - currently not indexed
Duplicate without user-selected canonical
Blocked by robots.txt
Excluded by noindex
Redirect error
Not found
```

Do not assume every non-indexed page indicates a problem.

---

# URL Inspection

After important changes, inspect examples from each section:

```text
/
 /about/
 /posts/example/
 /guides/example/
 /tools/example/
```

Verify Google sees:

- correct canonical
- expected HTML
- expected indexability
- current content

---

# Bing

Where useful, also verify:

```text
Bing Webmaster Tools
```

especially for:

- sitemap submission
- crawl errors
- indexing status

---

# Internal Linking

Internal links should help users navigate related knowledge.

Preferred relationship:

```text
Tool ↔ Guide ↔ Post
```

Examples:

```text
JWT Decoder
→ Debugging JWTs

Debugging JWTs
→ JWT Decoder

Real authentication incident
→ Debugging JWTs
```

Do not create links only to manipulate rankings.

---

# Anchor Text

Use descriptive anchor text.

Good:

```text
Understanding CIDR and subnet masks
```

Avoid:

```text
click here
read more
this page
```

when better context is available.

---

# Broken Links

Regularly check for:

- broken internal links
- broken external references
- redirected internal links
- outdated URLs

Internal links should ideally point directly to final URLs.

---

# Related Content

Related content should be topic-relevant.

Do not automatically list:

```text
previous
next
```

as the only discovery mechanism.

Topic relationships are more useful.

---

# Content Quality

Before indexing a new article, ask:

```text
Does this page add unique value?
```

Do not publish indexable pages that merely repeat:

```text
Enter input.
Click button.
Copy result.
```

if the tool page already explains this.

---

# Thin Content

Potential thin-content warning signs:

- very short pages with no unique value
- tool instructions duplicated across articles
- many near-identical article structures
- pages created only for one keyword variation
- category pages with no meaningful purpose

Prefer:

```text
merge
improve
remove
noindex
```

depending on context.

---

# Duplicate Content

Before creating content, search existing:

```text
/posts/
/guides/
/tools/
```

Avoid pages such as:

```text
JSON Formatter Guide
JSON Beautifier Guide
Pretty JSON Guide
JSON Pretty Print Guide
```

when one strong guide would be better.

---

# Publication Dates

Preserve original publication dates.

Use modification dates for meaningful updates.

Do not reset:

```text
datePublished
```

simply because:

- a URL moved
- formatting changed
- spelling was fixed
- taxonomy changed

---

# Modified Dates

Update modification date when substantial content changes.

Examples:

- technical instructions changed
- large sections added
- obsolete behavior corrected
- major rewrite completed

Do not update `dateModified` on every build automatically.

---

# Structured Data

Use structured data only when it correctly describes the page.

Possible types:

```text
Article
BlogPosting
BreadcrumbList
Person
WebSite
```

Do not add schema merely because it exists.

---

# Article Schema

For posts and guides where appropriate, validate:

```text
headline
datePublished
dateModified
author
mainEntityOfPage
```

Metadata must match visible content.

---

# Breadcrumbs

Breadcrumbs may help both users and crawlers.

Example:

```text
Home
→ Guides
→ Debugging CORS
```

Structured breadcrumbs should match visible navigation structure.

---

# Person Metadata

Where Person schema exists, keep identity information consistent.

Do not create conflicting names, descriptions, or profiles across different templates.

---

# Open Graph

Important pages should have appropriate:

```text
og:title
og:description
og:url
og:type
```

and image metadata where used.

---

# Social Images

If social images are generated:

- keep text readable
- avoid huge file sizes
- do not expose private information
- keep branding consistent

Do not block page publishing merely because a custom social image is unavailable.

---

# Images

Images should use:

- meaningful filenames where practical
- correct dimensions
- efficient formats
- descriptive alt text when appropriate

---

# Alt Text

Describe meaningful content.

Good:

```text
Terminal showing MySQL replication with Replica_IO_Running set to Yes and Replica_SQL_Running set to No.
```

Avoid:

```text
image
screenshot
picture
```

Decorative images may use empty alt text.

---

# Image Performance

Avoid serving a multi-megabyte image when a much smaller version would provide the same information.

Prefer appropriate formats such as:

```text
WebP
AVIF
```

where supported by the site architecture.

---

# Performance

SEO should not make the site slower.

Avoid:

- large client-side SEO libraries
- unnecessary tracking scripts
- large third-party widgets
- render-blocking dependencies

Preserve the site's static and fast architecture.

---

# Core Web Vitals

When making layout or asset changes, avoid regressions in:

```text
LCP
CLS
INP
```

Especially avoid:

- images without dimensions
- content shifting after load
- heavy JavaScript
- blocking third-party scripts

---

# Tool SEO

Tool pages should clearly state what they do.

Example:

```text
CIDR Calculator

Calculate network address, broadcast address,
subnet mask, usable range, and host count.
```

Do not hide the page purpose behind clever copy.

---

# Tool Search Intent

Useful terms may appear naturally in:

```text
title
description
tool metadata
aliases
keywords
supporting explanation
```

Do not stuff visible content with variations.

---

# Guide SEO

Guides should focus on solving a real question.

A good guide should usually include:

```text
what the concept is
when it matters
how to diagnose or use it
examples
common mistakes
limitations
```

Do not create guides solely because a keyword has search volume.

---

# Post SEO

Personal posts should remain personal.

Do not rewrite real engineering stories into generic search-oriented tutorials.

The unique value is often the real incident itself.

---

# Taxonomy

Avoid excessive tag pages.

Broad useful tags may include:

```text
linux
devops
networking
database
security
privacy
storage
automation
```

Avoid creating many one-page tags unless they provide useful navigation.

---

# Thin Taxonomy Pages

Consider whether thin tag/category pages should be:

```text
kept
merged
hidden
noindexed
```

depending on usefulness.

Do not automatically index every taxonomy page.

---

# Pagination

Paginated archives should have consistent canonical behavior.

Each pagination page should normally reference itself if indexable.

Do not canonicalize every archive page to page 1 unless that is intentional and technically justified.

---

# Search Pages

Internal search result pages usually do not need to be indexed.

Consider:

```text
noindex
```

for generated search states.

---

# Query Parameters

Avoid creating indexable duplicate URLs based only on:

```text
?sort=
?filter=
?query=
?theme=
```

Canonicalize or `noindex` parameter states when appropriate.

---

# HTTP Status

Verify correct status codes.

Expected:

```text
200 successful page
301 permanent redirect
404 missing page
```

Do not return:

```text
200
```

for a fake "page not found" page.

That creates soft 404 behavior.

---

# 404 Page

The 404 page should:

- clearly state the page was not found
- provide navigation
- return HTTP `404`

Do not redirect all missing URLs to `/`.

---

# Trailing Slash

Choose one URL style and remain consistent.

Example:

```text
/tools/jwt-decoder/
```

Avoid serving both:

```text
/tools/jwt-decoder
/tools/jwt-decoder/
```

as independent indexable pages.

---

# HTTPS

Canonical public URLs should use:

```text
https://
```

Avoid mixed HTTP/HTTPS references.

---

# Hostname Consistency

Choose the preferred host:

```text
ilham.dev
```

or:

```text
www.ilham.dev
```

and redirect the other version consistently.

Do not allow both to index independently.

---

# Old Metadata

Search the repository for obsolete branding or descriptions after major site changes.

Examples:

```bash
grep -RInE 'old title|old description|old tagline' .
```

Check:

```text
config
layouts
partials
JSON-LD
Open Graph
RSS
manifest
README
```

---

# RSS / Feed

When content structure changes, verify:

- correct titles
- correct URLs
- no broken links
- no duplicated migrated content
- publish dates preserved

---

# `llms.txt`

`llms.txt` may improve machine discovery, but it does not replace normal SEO.

Keep it:

- concise
- accurate
- linked to canonical sections

Do not depend on it for indexing.

---

# AI Discoverability

Good SEO and good AI discoverability overlap heavily.

Prefer:

```text
semantic content
clear descriptions
stable URLs
structured relationships
machine-readable catalogs
```

over crawler-specific hacks.

---

# Indexing Priority

Not every page needs equal indexing priority.

High-value pages include:

```text
homepage
about
important posts
useful guides
strong tools
```

Low-value generated pages may not need indexing.

---

# Before Publishing a New Page

Check:

- [ ] Does the page solve a real need?
- [ ] Is there already a similar page?
- [ ] Is the title unique?
- [ ] Is the URL stable?
- [ ] Is metadata correct?
- [ ] Does the page have internal links?
- [ ] Does it deserve to be indexed?
- [ ] Does it provide unique value?
- [ ] Is the content technically correct?
- [ ] Does it work without unnecessary JavaScript?

---

# Before Moving a Page

Check:

- [ ] Why is the move necessary?
- [ ] Old URL known?
- [ ] Redirect implemented?
- [ ] Canonical updated?
- [ ] Sitemap updated?
- [ ] Internal links updated?
- [ ] Structured data updated?
- [ ] Feed links updated?
- [ ] Publication date preserved?
- [ ] Search metadata preserved?

---

# After Deployment

Verify:

```text
old URL
new URL
canonical
robots
sitemap
page source
structured data
internal links
```

Then inspect representative URLs through webmaster tools where useful.

---

# Agent Rules

AI agents modifying SEO-related behavior must:

1. Inspect existing site conventions first.
2. Preserve stable URLs.
3. Never create keyword-stuffed content.
4. Never fabricate search statistics.
5. Never fake publication freshness.
6. Never add misleading schema.
7. Update internal links when URLs move.
8. Keep canonical and sitemap behavior consistent.
9. Prefer primary-source documentation for technical SEO decisions.
10. Avoid changing unrelated content.

---

# Definition of Done

An SEO-related change is complete when:

- [ ] Public URL is correct
- [ ] Page returns expected status
- [ ] Canonical is correct
- [ ] Title is useful
- [ ] Description is useful
- [ ] Indexability is intentional
- [ ] Sitemap state is correct
- [ ] Internal links are correct
- [ ] Redirects are direct
- [ ] Structured data is accurate
- [ ] No duplicate page was created
- [ ] Performance did not regress unnecessarily
- [ ] Content remains written for humans

---

# Final Principle

The best SEO strategy for ilham.dev is:

> Make useful things, explain them clearly, keep URLs stable, and make the site's structure easy to understand.

Search visibility should be the result of good engineering and good content, not the reason the content exists.
