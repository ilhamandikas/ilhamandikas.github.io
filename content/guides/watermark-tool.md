---
title: Watermark Tool Guide
description: Draw a text watermark onto a picture, choosing the corner, size, colour and opacity.
date: '2026-09-27'
tags:
- web
tool_guide_slug: watermark-tool
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
about: Put a name, a site or a date onto a picture so it travels with the image. You choose
  a corner, a size as a share of the shorter side, a colour and an opacity, and the text is
  drawn into the pixels when you download.
faq:
- q: How large should the watermark be?
  a: Four per cent of the shorter side is small enough to stay out of the way but large enough
    to read on a phone. Raise it toward ten per cent when the picture will be shown at a large
    size.
- q: Why is there a dark outline?
  a: White text disappears on a bright sky and black text disappears in shadow. A thin dark
    stroke around the letters keeps them readable on either, and it can be turned off when
    the background is known.
- q: Can someone remove the watermark?
  a: The text is part of the pixels rather than a separate layer, so removing it means editing
    the image. A determined person still can, which is why a watermark deters rather than
    prevents.
---

[Watermark Tool](/tools/watermark-tool/) draws a line of text into the pixels of a picture in your browser, so the mark travels with the image instead of sitting in a layer that can be switched off. The size is a percentage of the shorter side, which keeps it in proportion on tall or wide pictures.

## Watermark a throwaway image

Choose a disposable image under **Image**. Leave **Text** as `© ilham.dev`, **Position** on **Bottom right**, **Size** at `4%` and **Opacity** at `80%`, with **Dark outline for contrast** ticked. The **Preview** should show the text in the bottom-right corner. Tick **Add today's date** and the caption gains a `· YYYY-MM-DD` suffix. Clear **Dark outline for contrast** and the text gets harder to read over a busy area. Choose **Download** to save `<name>-watermarked.png`.

The output is always a PNG with a `-watermarked` suffix, so the original file is untouched. The mark is baked into the pixels, which means it survives sharing and screenshots, but someone determined can crop or edit it out; treat a watermark as a deterrent, not a lock.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
