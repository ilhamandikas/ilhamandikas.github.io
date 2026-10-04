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
about: Save a picture in another format so it fits where it is going. JPEG keeps photographs
  small, PNG keeps sharp edges and transparency, WebP often beats both, and AVIF is offered
  when the browser can actually write it.
faq:
- q: Why is AVIF marked as not supported?
  a: Encoding AVIF is left to the browser, and some browsers can decode it without being able
    to write it. The page encodes one pixel and checks what format comes back before offering
    the choice.
- q: What happens to transparency in a JPEG?
  a: JPEG has no alpha channel, so a transparent area has to become something. A white layer
    is laid down first, which is the usual choice for a photo going to a place that expects
    a solid background.
- q: Which format should I pick?
  a: Photographs are usually smallest as WebP or JPEG. Screenshots, diagrams and anything
    with text or a transparent background hold up better as PNG, and the size shown for each
    choice makes the trade visible.
---

[Image Format Converter](/tools/image-format-converter/) re-encodes a picture into another format inside your browser. JPEG, PNG and WebP are always offered; AVIF appears only when the browser can actually write it. The **Change** line shows whether the new file is smaller or larger.

## Convert a throwaway image

Choose a disposable image under **Image**, leave **Convert to** on **JPEG**, and read **Input**, **Output** and **Change**. Switch **Convert to** to **PNG**; **Output** should now say `PNG` and **Change** often flips to `% larger`, because PNG is lossless. Move **Quality** down to `40` with JPEG or WebP selected and the output gets smaller. Choose **Download** to save the file with the matching extension.

If the list shows **AVIF (not supported here)**, that browser cannot encode AVIF even if it can display it; pick another format. JPEG cannot store transparency, so this tool paints a white layer under the picture first, which means a transparent PNG converted to JPEG picks up a white background. As with any re-encode, EXIF metadata does not carry over.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
