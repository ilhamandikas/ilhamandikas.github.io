---
title: Image Format Converter Guide
description: Convert a picture between JPEG, PNG, WebP and AVIF, with a quality slider and
  a before-and-after size.
date: '2026-09-27'
tags:
- web
tool_guide_slug: image-format-converter
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

Save a picture in another format so it fits where it is going. JPEG keeps photographs small, PNG keeps sharp edges and transparency, WebP often beats both, and AVIF is offered when the browser can actually write it.

## Open the tool

[Use Image Format Converter](/tools/image-format-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is AVIF marked as not supported?

Encoding AVIF is left to the browser, and some browsers can decode it without being able to write it. The page encodes one pixel and checks what format comes back before offering the choice.

### What happens to transparency in a JPEG?

JPEG has no alpha channel, so a transparent area has to become something. A white layer is laid down first, which is the usual choice for a photo going to a place that expects a solid background.

### Which format should I pick?

Photographs are usually smallest as WebP or JPEG. Screenshots, diagrams and anything with text or a transparent background hold up better as PNG, and the size shown for each choice makes the trade visible.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
