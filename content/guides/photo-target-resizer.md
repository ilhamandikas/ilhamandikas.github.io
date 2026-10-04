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
about: Some forms and services cap an upload at five hundred kilobytes or a megabyte. Give
  this tool the limit and the picture is scaled to fit, then re-encoded at the highest quality
  that stays under it, with the result shown before you download.
faq:
- q: How is the right quality found?
  a: The encoder is tried at a series of qualities from high to low and stops at the first
    result that fits. That gives the best-looking file the limit allows rather than a guess.
- q: What if the limit is too small?
  a: The smallest the encoder can produce is reported, along with the quality it used. Lower
    the longest edge, which removes pixels rather than quality, and try again.
- q: Which format comes out?
  a: JPEG by default, because it is the most widely accepted. With the WebP box ticked the
    same picture is also encoded as WebP, and whichever of the two is smaller is the one you
    get.
---

[Photo Resizer by Target Size](/tools/photo-target-resizer/) keeps re-encoding a picture at lower JPEG qualities until it fits a size you name, then shows the result before you download it. That is useful for upload forms that cap a photo at, say, 500 KB.

## Fit a throwaway image under a limit

Choose a disposable photo under **Image** with **Target size (KB)** at `500`. The result line should read something like `JPEG · …×… · … KB · quality 92%`, and the status should say it is **Ready**. Set **Target size (KB)** lower and watch the quality percentage fall. Enter a number in **Longest edge (px)** to remove pixels as well; that is the lever for reaching very small limits. Choose **Download** to save a file whose name ends in its size in kilobytes.

If the smallest file the encoder reaches is still over the limit, the status says so and names the size and quality it managed; lower **Longest edge** and try again. With **Try WebP as well** ticked, the same quality is also encoded as WebP and the smaller of the two is kept, so the extension can be `.webp` instead of `.jpg`.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
