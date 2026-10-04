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
about: Build a wa.me link that opens a chat with a number and a message already filled in.
  Enter the country code and the phone number, type the message, and the page writes the click-to-chat
  link, ready to paste into a page, an email or a QR code.
faq:
- q: Why is the leading zero removed?
  a: wa.me needs the number in international form, which has no national trunk prefix. A local
    number written 0812 becomes 62812 once the country code is added, so the leading zero
    is dropped before the two are joined.
- q: Does the message have to be encoded?
  a: Spaces and punctuation cannot sit raw in a URL, so the message is percent-encoded. That
    is why a space turns into %20 in the link; WhatsApp decodes it back to a normal space
    when the chat opens.
- q: Can I shorten the link?
  a: Not here, because shortening needs a request to a third-party service and this page never
    sends your text anywhere. Use your own shortener afterwards if you need one.
---

A `wa.me` **click-to-chat link** asks WhatsApp to open a conversation with a number, optionally prefilling a message. [WhatsApp Link Generator](/tools/whatsapp-link-generator/) builds that URL locally; it does not check whether the number has WhatsApp or send the message.

## Make a disposable example

Set **Country code** to `62`, **Phone number** to `081234567890`, and **Message** to `Hello`. **Click-to-chat link** should show `https://wa.me/6281234567890?text=Hello`. The tool removes a leading zero before adding the country code. Add a space to the message and you should see `%20` for that space in the URL. **Copy link** copies the result; **Open** leaves this site and opens the `wa.me` URL in a new tab.

**Do not put private messages, credentials, or someone else's number in a link you publish.** URLs are visible in history, logs, previews, and screenshots. Check both number and text before using **Open**, and remember that opening a chat does not mean a message was sent.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
