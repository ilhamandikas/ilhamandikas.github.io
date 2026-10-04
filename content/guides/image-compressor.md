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
about: 'Pick a JPEG, PNG, GIF or WebP, cap its width and height, choose the output format
  and quality, then download the result — all in the page, so the file is never uploaded.
  The resize is a plain canvas re-encode: the dimensions are treated as ceilings, so a photo
  is only ever shrunk and a smaller image is left at its own size. Re-encoding also drops
  EXIF, GPS and camera settings, which is a useful side effect when you want to share a picture
  without the location it was taken.'
faq:
- q: Does compressing remove the metadata?
  a: Yes, for the file you download. The pixels are redrawn onto a canvas and written out
    again, and a canvas only carries pixels, so EXIF, GPS and camera settings are not part
    of it. That is convenient when you want to strip a location before sharing, but it also
    means a rotated photo can come out the wrong way round, because the orientation tag that
    told viewers how to display it is gone.
- q: Why did my translucent PNG turn black or white?
  a: Because the format you chose does not keep transparency. JPEG has no alpha channel, so
    transparent pixels are filled with the encoder's default colour, usually black. Keep PNG
    or WebP selected when the image has a transparent background, and switch to JPEG only
    when every pixel is opaque.
- q: The file got bigger instead of smaller — why?
  a: Re-encoding is not automatically a win. Re-encoding a photograph to PNG usually changes
    little, and turning a small, already-optimised JPEG into a PNG can easily double it. The
    quality slider only applies to JPEG and WebP; for those two, lowering it is what actually
    shrinks the file.
- q: Is there a size limit?
  a: Only what the browser and its memory can hold. Everything runs on this device, so a very
    large panorama can be slow or hit the canvas size limit, around 16,000 pixels a side in
    most browsers. If a huge image fails, cap the width or height and try again.
---

[Image Compressor](/tools/image-compressor/) shrinks a picture in your browser by redrawing it on a canvas and re-encoding the pixels. **Max width** and **Max height** act as ceilings: the image scales down to fit inside both, the aspect ratio is kept, and a smaller image is never enlarged.

## Compress a throwaway image

Choose a disposable photo under **Image**. Set **Max width** to `200` and leave **Max height** empty. When **Result** appears, **Compressed** should start with `200×` and **Saving** should show a percentage. Drag **Quality** down to `50`; the preview gets softer and the JPEG or WebP file usually gets smaller. Choose **Download** to save `<name>-compressed.jpg`.

**Keep original** leaves PNG and WebP as they are, but GIF and everything else come out as JPEG. Because JPEG has no transparency, a transparent image switched to JPEG gets a filled background, so keep PNG or WebP selected when that matters. Width and height are ceilings, so setting them larger than the source does nothing.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
