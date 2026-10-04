---
title: QR Code Editor Guide
description: Restyle a QR code — module shapes, gradient colours, logo, transparent background.
date: '2026-09-27'
tags:
- web
tool_guide_slug: qr-editor
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
about: 'A QR code generator with the full set of style controls: module shape, finder-corner
  shape, a two-colour gradient, a transparent background, and a logo with its own size, padding,
  corner radius and background box. Six presets set the whole look at once if you would rather
  not tune each part. The encoder runs in the page, so the text and any logo you load stay
  on your machine. The hint under the Logo heading tracks the error-correction budget as you
  resize the logo and tells you when the code is likely to stop scanning.'
faq:
- q: How big can the logo be before the code stops scanning?
  a: That depends on the error-correction level, and the answer is smaller than the percentage
    suggests. Error correction works per block, not across the whole symbol, so a centred
    logo wipes out one or two blocks outright while the overall average still looks fine.
    Measured with an independent decoder, the largest logo that still scanned was 12% of the
    code's width at L, 16% at M, 18% at Q and 24% at H — with the default white box behind
    it, which erases modules of its own. The hint turns red past that number for the level
    you picked.
- q: Why is the round finder corner called a dot rather than a circle?
  a: Because the outer ring stays a rounded square. A fully circular outer ring broke detection
    outright in testing — the symbol stopped decoding with either a square or a round centre.
    A rounded square ring decoded with both. The dot style therefore rounds the ring and draws
    the inner 3x3 as a dot, which is the look people are after without the part that does
    not work.
- q: What is the difference between this and the plain QR Code Generator?
  a: They share the same encoder and both export PNG and SVG. This one adds the style controls
    — module and corner shapes, gradients, transparency and the logo panel with a live budget
    warning — and the presets. If you only need a plain black-and-white code, the simpler
    generator gets you there in one step.
- q: Can I use an SVG file as the logo?
  a: No, and the page says so rather than failing quietly. The logo is drawn into a canvas
    for the PNG export, and an SVG image loaded into a canvas taints it, which makes the export
    fail. PNG, JPEG, GIF, WebP and BMP all work.
---

A QR code generator with the full set of style controls: module shape, finder-corner shape, a two-colour gradient, a transparent background, and a logo with its own size, padding, corner radius and background box. Six presets set the whole look at once if you would rather not tune each part. The encoder runs in the page, so the text and any logo you load stay on your machine. The hint under the Logo heading tracks the error-correction budget as you resize the logo and tells you when the code is likely to stop scanning.

## Restyle an existing QR code

Choose a QR image under **QR image**. The tool decodes it locally; when it succeeds, the **Content**, **Style**, **Logo** and **Preview** sections open and the decoded text is filled into **Text or URL**. If it says **No QR code found in that image**, the picture was too small or too blurry to read — try a larger, sharper one. Editing the text redraws the **Preview** live.

Click a preset such as **Dots** or **Ocean** to set several controls at once, or adjust them by hand. **Modules** and **Corners** change the shape of the dots and the corner squares, **Gradient** adds a second colour and an angle, and **Transparent background** drops the quiet-zone colour. Under **Logo**, add a PNG and watch the hint line beneath it: it turns red when the logo is likely too big for the chosen **Error correction** level. **Download PNG** gives a raster image; **Download SVG** gives vector output that stays sharp at any size.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
