---
title: Image Compressor Guide
description: Resize and re-encode an image in the browser — cap its dimensions, pick a format
  and quality, then download the smaller file.
date: '2026-09-27'
tags:
- web
tool_guide_slug: image-compressor
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

Pick a JPEG, PNG, GIF or WebP, cap its width and height, choose the output format and quality, then download the result — all in the page, so the file is never uploaded. The resize is a plain canvas re-encode: the dimensions are treated as ceilings, so a photo is only ever shrunk and a smaller image is left at its own size. Re-encoding also drops EXIF, GPS and camera settings, which is a useful side effect when you want to share a picture without the location it was taken.

## Open the tool

[Use Image Compressor](/tools/image-compressor/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does compressing remove the metadata?

Yes, for the file you download. The pixels are redrawn onto a canvas and written out again, and a canvas only carries pixels, so EXIF, GPS and camera settings are not part of it. That is convenient when you want to strip a location before sharing, but it also means a rotated photo can come out the wrong way round, because the orientation tag that told viewers how to display it is gone.

### Why did my translucent PNG turn black or white?

Because the format you chose does not keep transparency. JPEG has no alpha channel, so transparent pixels are filled with the encoder's default colour, usually black. Keep PNG or WebP selected when the image has a transparent background, and switch to JPEG only when every pixel is opaque.

### The file got bigger instead of smaller — why?

Re-encoding is not automatically a win. Re-encoding a photograph to PNG usually changes little, and turning a small, already-optimised JPEG into a PNG can easily double it. The quality slider only applies to JPEG and WebP; for those two, lowering it is what actually shrinks the file.

### Is there a size limit?

Only what the browser and its memory can hold. Everything runs on this device, so a very large panorama can be slow or hit the canvas size limit, around 16,000 pixels a side in most browsers. If a huge image fails, cap the width or height and try again.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
