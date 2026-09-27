---
title: Screenshot Privacy Cleaner Guide
description: Pixelate or black out parts of a screenshot before sharing it.
date: '2026-09-27'
tags:
- web
tool_guide_slug: screenshot-privacy-cleaner
broader_guide:
  title: Practical Image Tools
  url: /guides/practical-image-tools/
---

Screenshots are easy to share and easy to over-share. Drag a box over an email address, a phone number, an IP address or a line of text, and either pixelate it or cover it with a solid black rectangle, then download the cleaned-up copy.

## Open the tool

[Use Screenshot Privacy Cleaner](/tools/screenshot-privacy-cleaner/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it find the sensitive parts for me?

No. Locating a phone number inside a picture would need optical character recognition, which would mean shipping a large model and reading every pixel of your screenshot. Marking the areas by hand is the honest version.

### Is pixelating as safe as a black box?

A black box destroys the pixels underneath. Pixelation keeps an average of them, and a coarse enough block makes them unreadable, but for anything truly secret the black box is the safer choice.

### Can I take a redaction back?

Undo removes the last box and Reset clears them all, because the untouched pixels are kept aside while you work. Once you download, the redactions are baked into the saved file.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
