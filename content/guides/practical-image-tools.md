---
title: Practical Image Tools
description: Image compression, format conversion, metadata removal, redaction, QR
  codes, placeholders, stickers, and watermarks.
date: '2026-09-27'
tags:
- privacy
aliases:
- /posts/how-to-add-a-watermark-without-ruining-the-image/
- /posts/how-to-compress-images-without-making-them-look-bad/
- /posts/how-to-convert-image-formats-without-losing-what-matters/
- /posts/how-to-create-svg-placeholder-images/
- /posts/how-to-make-a-qr-code-that-people-can-actually-scan/
- /posts/how-to-make-a-simple-sticker-image/
- /posts/how-to-make-a-wifi-qr-code-for-guests/
- /posts/how-to-remove-a-simple-image-background/
- /posts/how-to-remove-photo-metadata-before-sharing/
- /posts/how-to-resize-a-photo-to-a-target-file-size/
- /posts/how-to-style-a-qr-code-without-breaking-scanning/
---

Images have more to them than the pixels you see: dimensions, format, file size, and sometimes metadata about the device or location. Decide which of those you need to keep before converting or sharing an image.

## Choose the goal first

Resizing changes dimensions; compressing tries to reduce file size; converting changes format. These can affect quality differently. Export a copy and compare it at full size before replacing the original.

## Check what travels with the file

Photos may include EXIF metadata. Removing it can help when sharing, but do not assume every output format or workflow keeps or removes the same fields. Inspect the exported file itself if the metadata matters. A transparent image may also lose transparency when converted to a format that does not support it.

## Related tools

- [Background Remover](/tools/background-remover/) — Clear a plain background from an image by flooding in from the edges.
- [Color Converter](/tools/color-converter/) — Convert colors between HEX, RGB, HSL and more.
- [EXIF Remover](/tools/exif-remover/) — Strip EXIF, GPS and other hidden metadata from a photo by re-encoding it in the browser.
- [Image Compressor](/tools/image-compressor/) — Resize and re-encode an image in the browser — cap its dimensions, pick a format and quality, then download the smaller file.
- [Image Format Converter](/tools/image-format-converter/) — Convert a picture between JPEG, PNG, WebP and AVIF, with a quality slider and a before-and-after size.
- [Image Metadata Viewer](/tools/image-metadata/) — Read the EXIF, GPS, comments and colour data hidden inside a photo, without uploading it.
- [Photo Resizer by Target Size](/tools/photo-target-resizer/) — Shrink a photo until it fits a size in kilobytes, keeping the highest quality that still fits.
- [QR Code Generator](/tools/qr-code-generator/) — Generate a QR code from text or a URL.
- [QR Code Editor](/tools/qr-editor/) — Restyle a QR code — module shapes, gradient colours, logo, transparent background.
- [Screenshot Privacy Cleaner](/tools/screenshot-privacy-cleaner/) — Pixelate or black out parts of a screenshot before sharing it.
- [Sticker Maker](/tools/sticker-maker/) — Create PNG stickers with shapes, text decoration, outlines and simple background removal.
- [SVG Placeholder](/tools/svg-placeholder/) — Create a placeholder image as an SVG.
- [Watermark Tool](/tools/watermark-tool/) — Draw a text watermark onto a picture, choosing the corner, size, colour and opacity.
