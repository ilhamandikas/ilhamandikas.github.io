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

A photo can carry information **besides the picture**. That extra information is called *metadata*. It might include a camera model, a date, or even a location. [Image Metadata Viewer](/tools/image-metadata/) reads what is present in a file you choose; it does not add or remove anything.

## Inspect an image you can share safely

Start with a test image or a screenshot that contains no personal information. Choose it in **Image**, or drop it onto the file area. The tool accepts JPEG, PNG, GIF, and WebP files. After it reads the file:

1. Check **What is in the file** for the preview, file name, size, and any metadata blocks the tool found.
2. Check **Everything that was found** under **Raw JSON** if you want a text version of the report. **Copy as JSON** and **Download JSON** export the report, not a cleaned image.
3. If the status says there is no EXIF, that is normal for many screenshots and exported images. **EXIF** is one kind of photo metadata; “no EXIF” does not mean the file has no information at all.

If a photo contains GPS data, the tool shows coordinates and a Google Maps link. **Opening that link** sends the coordinates to Google. You do not need to click it to inspect the rest of the report.

## Before sharing a photo

This viewer reads files locally in your browser; it does not upload your selected image. But it also **does not remove metadata**. If the report shows a location or other detail you do not want to share, make a separate cleaned copy with a tool that removes metadata, then check **that new file** here. Do not assume an image is clean just because the preview looks ordinary.

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
