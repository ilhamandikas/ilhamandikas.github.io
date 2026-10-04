---
title: Open Graph Debugger Guide
description: Extract Open Graph and Twitter Card tags from pasted HTML and preview the shared
  card.
date: '2026-09-27'
tags:
- network
tool_guide_slug: open-graph-debugger
broader_guide:
  title: Web Metadata
  url: /guides/web-metadata/
about: Paste a page's HTML and the page pulls out its Open Graph and Twitter Card tags, the
  title and the canonical link, then draws a preview of the card a link would produce. It
  is the quick way to see why a shared link shows the wrong title or no image.
faq:
- q: Why does the preview look different from the real one?
  a: Every platform renders the card its own way and may crop the image or ignore a tag. This
    preview shows the values that were found and the order of priority, which is what you
    need to debug, not a pixel-perfect copy of any one site.
- q: Which title wins if several are present?
  a: Open Graph is preferred over Twitter Card, and both are preferred over the plain title
    element. That matches how most crawlers resolve it, and the tag table still lists every
    value so you can see what else is there.
- q: The image is missing from the preview. Why?
  a: 'The tool does not load images: it only displays the image URL as text when present.
    If the tag is missing, the preview has no image section. On a live page, verify that the
    URL is absolute and publicly reachable using the platform you care about.'
- q: Is the page fetched for me?
  a: No. You paste the HTML and it is parsed in the browser with a local DOM parser. Nothing
    is requested, so you can inspect a staging page behind a login or a page that is not public
    yet.
---

**Open Graph** tags tell some social platforms what title, summary, and image to show when sharing a page. [Open Graph Debugger](/tools/open-graph-debugger/) reads **HTML you paste**; it does not fetch a page from a URL or contact a crawler.

## Preview two tags

Paste `<meta property="og:title" content="Demo article"><meta property="og:description" content="A short summary">` into **Page HTML**. **Preview** should show `Demo article` and `A short summary`. Under **Tags**, both metadata rows should appear. Add `<meta property="og:image" content="https://example.com/card.png">`: the preview shows that image **URL as text**, not the image pixels.

The tool prefers `og:title` over `twitter:title` and then the page's `<title>` as a fallback. A platform may use different rules, cache old tags, or fail to load an image even when a tag exists. Inspect the real deployed page with the platform's own debugger before assuming the preview matches a public card. Do not paste private staging HTML into a screenshot.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Web Metadata](/guides/web-metadata/).
