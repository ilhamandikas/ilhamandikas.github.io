---
title: EXIF Remover Guide
description: Strip EXIF, GPS and other hidden metadata from a photo by re-encoding it in the
  browser.
date: '2026-09-27'
tags:
- web
tool_guide_slug: exif-remover
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

**EXIF** is image metadata that can include capture time, camera details, or GPS location. [EXIF Remover](/tools/exif-remover/) redraws an image in a browser canvas and exports new pixels. This generally drops embedded EXIF and other original file metadata, but visible details in the picture remain visible.

## Try a harmless photo

Choose a disposable image under **Image**. **Result** should show **Original** and **Clean** dimensions and file sizes after the conversion finishes. Leave **Output format** on **Keep original** for JPEG, PNG, or WebP, or pick a specific format. **Quality** defaults to `90` and affects JPEG/WebP output; PNG ignores this quality value. Choose **Download clean image** to save a new file with `-clean` added to its name. Your original file is not overwritten.

**Keep original** does not preserve GIF as GIF: this implementation converts unsupported originals, including GIF, to JPEG. Animated frames and transparency can be lost or change appearance. Re-encoding may also change file size and visual quality. Check the output with [Image Metadata](/tools/image-metadata/) and inspect the pixels before sharing sensitive images; canvas conversion is not a guarantee that every identifying detail has been removed.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does re-encoding change how the picture looks?

It redraws the same pixels, so it looks the same to the eye. A JPEG is saved again at the chosen quality, which costs a little sharpness; choosing PNG or a high quality keeps that to a minimum.

### Why does the file sometimes get bigger?

The original may have been compressed very hard or stored as a smaller size. Re-encoding at a high quality can produce more bytes than you started with, and the change line shows that rather than hiding it.

### Is the metadata really gone?

Original file metadata is generally not transferred when canvas pixels are encoded into a new file. Verify the downloaded file using a metadata viewer, and remember that text, faces, or locations *visible in the pixels* are not removed.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
