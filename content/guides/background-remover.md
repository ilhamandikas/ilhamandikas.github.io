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

[Background Remover](/tools/background-remover/) makes the background of a picture transparent by flooding inward from pixels along the edge and clearing anything close enough in colour. It suits a product shot on a plain surface or a screenshot on a flat colour, not a busy scene.

## Cut out a flat-background test image

Choose a disposable image under **Image**. Leave **Colour match** at `24%`, **Start from** on **Every edge pixel**, **Edge softness** at `1` and **Output format** on **PNG**. The status should report the percentage of pixels removed, and **Removed** in the **Result** panel shows the same figure. Raise **Colour match** and more of the background goes; if part of the subject disappears too, lower it again. Try **The four corners** when only the corners are a reliable sample. Choose **Download** for a transparent PNG or WebP.

If **Nothing matched the background** appears, the edges are not one flat colour, so raise the colour match or change the seed pixels. The match is colour-based, not object recognition, so a street, a room or a crowd comes out ragged. Images larger than four megapixels are scaled down to work faster, and **Working size** says when that happened. JPEG cannot store transparency, which is why the output is PNG or WebP only.

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
