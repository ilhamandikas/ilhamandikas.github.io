---
title: QR Code Generator Guide
description: Generate a QR code from text or a URL.
date: '2026-09-27'
tags:
- web
tool_guide_slug: qr-code-generator
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

This builds a QR code in your browser from any text or URL, with a choice of error-correction level and an adjustable margin. The code is produced locally by a bundled encoder, so the text you type is never sent anywhere. You can take the result as a PNG for a chat message or as an SVG, which is drawn as vector paths and therefore stays sharp at any print size.

## Open the tool

[Use QR Code Generator](/tools/qr-code-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Do I need an account, or is there a limit?

No account, no API key and no quota. The generator runs entirely in the page.

### Which error-correction level should I choose?

H is the most robust and survives roughly 30% of the pattern being damaged, at the cost of a denser code. Use L for short URLs on a screen, and H for anything printed on a sticker, a label or packaging that might get scuffed.

### Why did the PNG download fail?

Drawing to a canvas can be blocked in some environments. The SVG download is pure vector, works everywhere and scales better for print anyway.

### How large can a logo be before the code stops scanning?

Smaller than the error-correction percentage suggests, because correction works per block rather than across the whole symbol — a centred logo destroys one or two blocks outright while the overall average still looks healthy. Measured with an independent decoder over three payload lengths, the largest logo that still scanned was 12% of the code's width at L, 16% at M, 18% at Q and 24% at H, with the default white box behind it taken into account. Those numbers come from testing, not from arithmetic, and the page's hint turns red once you pass the limit for the level you chose.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
