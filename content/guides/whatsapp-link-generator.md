---
title: WhatsApp Link Generator Guide
description: Turn a phone number and a message into a wa.me click-to-chat link.
date: '2026-09-27'
tags:
- web
tool_guide_slug: whatsapp-link-generator
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Build a wa.me link that opens a chat with a number and a message already filled in. Enter the country code and the phone number, type the message, and the page writes the click-to-chat link, ready to paste into a page, an email or a QR code.

## Open the tool

[Use WhatsApp Link Generator](/tools/whatsapp-link-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the leading zero removed?

wa.me needs the number in international form, which has no national trunk prefix. A local number written 0812 becomes 62812 once the country code is added, so the leading zero is dropped before the two are joined.

### Does the message have to be encoded?

Spaces and punctuation cannot sit raw in a URL, so the message is percent-encoded. That is why a space turns into %20 in the link; WhatsApp decodes it back to a normal space when the chat opens.

### Can I shorten the link?

Not here, because shortening needs a request to a third-party service and this page never sends your text anywhere. Use your own shortener afterwards if you need one.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
