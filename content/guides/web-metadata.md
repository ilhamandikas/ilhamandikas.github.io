---
title: Web Metadata
description: Meta tags, Open Graph previews, UTM links, and the page data used by
  browsers, crawlers, and social apps.
date: '2026-09-27'
tags:
- web
aliases:
- /posts/how-to-preview-link-cards-with-open-graph/
- /posts/how-to-write-meta-tags-for-a-page/
---

A link preview comes from page metadata, not from how the page looks in your browser. Search results and social apps may read different fields and cache them for different lengths of time.

## Check the page's actual HTML

Look for the document title, meta description, canonical URL, and Open Graph tags in the delivered page. A preview that shows an old image may be cached even after the HTML changed. Test the public URL, not a local development address.

## Keep claims consistent

Use a title and description that match the visible page. Make sure the preview image URL is reachable and points to the intended image. Generators help write tags; they do not guarantee that a platform will choose or refresh them.

## Related tools

- [Meta Tag Generator](/tools/meta-tag-generator/) — Generate HTML meta tags for a page.
- [Open Graph Debugger](/tools/open-graph-debugger/) — Extract Open Graph and Twitter Card tags from pasted HTML and preview the shared card.
- [UTM Builder](/tools/utm-builder/) — Build and parse UTM campaign URLs with source, medium, campaign, term, content and id.
