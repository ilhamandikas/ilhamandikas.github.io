---
title: Sticker Maker Guide
description: Create PNG stickers with shapes, text decoration, outlines and simple background
  removal.
date: '2026-09-27'
tags:
- web
tool_guide_slug: sticker-maker
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
about: Make a 1024×1024 PNG sticker from an uploaded image, with circle, square or rounded
  frames, decorative text, a sticker outline and simple local background removal. The image
  is processed in the browser canvas and is not uploaded.
faq:
- q: How good is the background removal?
  a: It is colour-based, using the image corners as the background sample. It works well for
    flat studio-like backgrounds; complex backgrounds still need a dedicated segmentation
    model or manual editing.
---

[Sticker Maker](/tools/sticker-maker/) draws a 1024×1024 PNG from an image plus optional top and bottom text, in your browser. Use it for chat-style stickers and simple badges.

## Make a test sticker

Choose a disposable image under **Image**. Leave **Shape** on **Circle**, type `DEMO` into **Top text**, and leave **Text style** on **Meme bold** with **Sticker outline** ticked. The **Preview** should redraw as a circular badge with the word across the top. Switch **Text style** to **Neon** or **Ribbon** to see the other decorations, drag **Image zoom** and **Image Y** to reposition the picture, and tick **Remove background** to clear a flat backdrop using **Tolerance**. Choose **Download PNG** to save the sticker.

The canvas is always 1024×1024 and the text is uppercased and shrunk to fit. **Remove background** samples the four corners and clears similar pixels across the whole picture, so it works on flat, studio-like backgrounds and struggles with a busy one; raise or lower **Tolerance** until the edge looks right. Ticking **Transparent frame** removes the gradient backdrop instead of filling it.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
