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
---

Paste a page's HTML and the page pulls out its Open Graph and Twitter Card tags, the title and the canonical link, then draws a preview of the card a link would produce. It is the quick way to see why a shared link shows the wrong title or no image.

## Open the tool

[Use Open Graph Debugger](/tools/open-graph-debugger/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does the preview look different from the real one?

Every platform renders the card its own way and may crop the image or ignore a tag. This preview shows the values that were found and the order of priority, which is what you need to debug, not a pixel-perfect copy of any one site.

### Which title wins if several are present?

Open Graph is preferred over Twitter Card, and both are preferred over the plain title element. That matches how most crawlers resolve it, and the tag table still lists every value so you can see what else is there.

### The image is missing from the preview. Why?

The parser only reads the tag; it does not fetch the image. If og:image is absent or empty, the card shows no image. Use an absolute URL, since relative image paths are unreliable for crawlers.

### Is the page fetched for me?

No. You paste the HTML and it is parsed in the browser with a local DOM parser. Nothing is requested, so you can inspect a staging page behind a login or a page that is not public yet.

## Related guide

For more background, read [Web Metadata](/guides/web-metadata/).
