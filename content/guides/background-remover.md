---
title: Background Remover Guide
description: Clear a plain background from an image by flooding in from the edges.
date: '2026-09-27'
tags:
- web
tool_guide_slug: background-remover
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

Make the background of a photo transparent. Pixels along the edge are flooded inwards and everything close enough in colour goes, which turns a product shot on a plain surface or a screenshot on a flat colour into a cut-out PNG in one step.

## Open the tool

[Use Background Remover](/tools/background-remover/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Will this work on a photo with a busy background?

No, and no colour match can. A street, a room or a crowd needs a segmentation model that understands what a person or an object is. This page is honest about that limit rather than producing a ragged edge that has to be cleaned up by hand.

### Why is part of the subject disappearing?

The subject shares a colour with the background and the match is too generous. Lower the colour match until it stops, or start from the four corners when only the edges are reliable.

### What happens to the parts that are left?

They keep their colour and position exactly, and the cleared area becomes fully transparent. The download is a PNG or a WebP because JPEG cannot store transparency at all.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
