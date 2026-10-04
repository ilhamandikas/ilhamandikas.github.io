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
about: This builds a QR code in your browser from any text or URL, with a choice of error-correction
  level and an adjustable margin. The code is produced locally by a bundled encoder, so the
  text you type is never sent anywhere. You can take the result as a PNG for a chat message
  or as an SVG, which is drawn as vector paths and therefore stays sharp at any print size.
faq:
- q: Do I need an account, or is there a limit?
  a: No account, no API key and no quota. The generator runs entirely in the page.
- q: Which error-correction level should I choose?
  a: Start with M. If the code may be scratched or partly covered, try H. H adds more recovery
    information but makes the pattern busier. Download and scan the final image; the setting
    alone cannot guarantee that a phone will read it.
- q: Why did the PNG download fail?
  a: PNG download needs the browser to draw the image first. If that step fails, try **Download
    SVG** instead. SVG stays sharp when you make it bigger for print. Open and scan the downloaded
    file before sharing it.
- q: How large can a logo be before the code stops scanning?
  a: A logo hides squares that a phone needs to read. Make the logo small. The tool shows
    a warning when its size is beyond what scanned in testing, but that limit is not a guarantee
    for your image. Scan the downloaded file on a few phones, especially before printing many
    copies.
---

A QR code is a picture that can hold a short piece of text, such as a web address. Someone points a phone camera at the picture to read that text. [QR Code Generator](/tools/qr-code-generator/) makes the picture in your browser.

## Make one you can test

1. Open the tool. In **Text or URL**, replace the example with `https://example.com`.
2. Look at **Preview**. The square code should change as you type. There is no Generate button.
3. Point a phone camera at the preview. Check that it offers `https://example.com` before you share the code. Scanning reads the address; opening it is a separate choice.
4. Choose **Download PNG** for an image file, or **Download SVG** for a file that can be scaled for print. Open the downloaded file and scan that too: it is the file people will actually use.

## Change one setting at a time

**Size** changes the image size; it does not change the text inside. **Margin** adds empty space around the code. Keep some space so a camera can see where the code starts and ends. **Error correction** adds extra information that can help a damaged code still scan, but a higher level can make the pattern denser. Leave it at **M** for your first test.

You can add a logo in the middle, but it covers part of the pattern. Start without one. If you add one later, scan the downloaded result on more than one phone. The tool's size hint is based on tests; it is not a promise that every camera and print surface will work.

## If no code appears

Check that **Text or URL** is not empty. If the tool says it could not build the code, try shorter text. If a code appears but will not scan, try more margin, stronger contrast between **Foreground** and **Background**, or a smaller logo.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Practical Image Tools](/guides/practical-image-tools/).
