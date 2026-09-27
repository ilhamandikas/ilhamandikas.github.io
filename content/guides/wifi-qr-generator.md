---
title: Wi-Fi QR Code Guide
description: Build a QR code that joins a Wi-Fi network.
date: '2026-09-27'
tags:
- web
tool_guide_slug: wifi-qr-generator
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Enter a network name, password and security type and this builds the standard WIFI: payload that Android and iOS understand, then renders it as a QR code. Scanning it joins the network without anyone typing a password, which is what makes it useful for guests, an office wall or a rental. The credentials stay in the page and are never put in the URL.

## Open the tool

[Use Wi-Fi QR Code](/tools/wifi-qr-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it work on an iPhone?

Yes. The Camera app on iOS 11 and later reads Wi-Fi QR codes directly, with no extra app installed.

### Is it safe to print the password in a QR code?

Treat a printed code exactly like the password itself — anyone who can photograph it can join the network. If you hand one out and later change your mind, change the password.

### Which security type should I pick?

WPA/WPA2 for essentially every modern network, including WPA3 routers that still accept WPA2 clients. Use WEP only for genuinely old hardware, and 'no password' only for an open network.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
