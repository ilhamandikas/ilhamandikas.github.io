---
title: Photo Resizer by Target Size Guide
description: Shrink a photo until it fits a size in kilobytes, keeping the highest quality
  that still fits.
date: '2026-09-27'
tags:
- web
tool_guide_slug: photo-target-resizer
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

Some forms and services cap an upload at five hundred kilobytes or a megabyte. Give this tool the limit and the picture is scaled to fit, then re-encoded at the highest quality that stays under it, with the result shown before you download.

## Open the tool

[Use Photo Resizer by Target Size](/tools/photo-target-resizer/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How is the right quality found?

The encoder is tried at a series of qualities from high to low and stops at the first result that fits. That gives the best-looking file the limit allows rather than a guess.

### What if the limit is too small?

The smallest the encoder can produce is reported, along with the quality it used. Lower the longest edge, which removes pixels rather than quality, and try again.

### Which format comes out?

JPEG by default, because it is the most widely accepted. With the WebP box ticked the same picture is also encoded as WebP, and whichever of the two is smaller is the one you get.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
