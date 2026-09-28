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

[Screenshot Privacy Cleaner](/tools/screenshot-privacy-cleaner/) lets you draw boxes over parts of a screenshot and burn them out before sharing. It does not hunt for sensitive text for you; you mark each area by hand with the mouse or a touch.

## Blur out a line of a test screenshot

Choose a disposable screenshot under **Image**. Leave **Redaction** on **Pixelate** and **Pixel block** at `24 px`, then drag a box across a line you want to hide. The status should report `1 redaction applied`. Switch **Redaction** to **Black box** and drag over another line: that area becomes solid black. **Undo last** removes the most recent box and **Reset** clears them all, because the untouched pixels are kept aside while you work. Choose **Download** to save `<name>-redacted.png`.

Review the preview before you download; nothing is saved until then. Pixelation keeps an average of the pixels underneath and a coarse block makes them unreadable, but for anything truly secret the **Black box** mode is safer. Only the areas you mark are hidden — everything else in the screenshot stays visible, so check the whole picture, not just the boxes.

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
