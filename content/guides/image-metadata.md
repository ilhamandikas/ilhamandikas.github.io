---
title: Image Metadata Viewer Guide
description: Read the EXIF, GPS, comments and colour data hidden inside a photo, without uploading
  it.
date: '2026-09-27'
tags:
- web
tool_guide_slug: image-metadata
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

Drop in a JPEG, PNG, GIF or WebP and read the metadata the file actually carries: camera make and model, exposure settings, orientation, dimensions, colour profile, PNG text chunks and, where present, GPS coordinates with a link that opens the location in Google Maps. The parsing happens in the page, so the picture is never uploaded. A raw JSON panel shows every tag that was read, which is what you want when a field looks wrong.

## Open the tool

[Use Image Metadata Viewer](/tools/image-metadata/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does my image show no EXIF at all?

Because most images no longer have any. Messaging apps, social networks and screenshot tools strip metadata on purpose, and any image that has been through an editor and re-exported usually loses it too. "Read, but there is no EXIF in this file" is a normal result, not an error — it does not mean the file carries nothing.

### Is the GPS location exact?

It is exactly what the file says, to as many decimal places as the file stores. Many cameras write a rounded position, and some write a position that was never fixed at all, so a coordinate in a file is a claim by the camera rather than a measurement you can rely on. The page shows the degrees, minutes and seconds it read alongside the decimal pair so you can check the conversion yourself.

### Can it remove metadata?

No. It only reads. Stripping metadata means re-encoding the image, which is a lossy step (the Image Compressor does exactly this) — and it is worth knowing that the reliable way to remove EXIF is to re-export the picture from an editor, or to use a dedicated metadata stripper, rather than to trust a viewer.

### Which formats are supported, and why those four?

JPEG, PNG, GIF and WebP — the four whose metadata can be read from the file structure alone without a decoder. TIFF shares EXIF's structure with JPEG and is read where it appears inside one of these, but a standalone .tif is not accepted, because supporting it properly means supporting every TIFF variant including the ones that are not images at all.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
