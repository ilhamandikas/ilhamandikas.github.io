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

A Wi-Fi QR code stores a network name (**SSID**) and, when applicable, its password as text inside an image. [Wi-Fi QR Code](/tools/wifi-qr-generator/) builds a `WIFI:` payload and shows a scannable **Preview** in your browser. A device's camera may offer to join the network; this page does not join it for you.

## Make a dummy network code

Set **Network name (SSID)** to `DemoNet`, **Password** to `demo-pass`, and **Security** to **WPA / WPA2 / WPA3**. **Payload** should read `WIFI:T:WPA;S:DemoNet;P:demo-pass;;`. The preview displays a QR code for that text. **Download PNG** and **Download SVG** save the code as images. If the name is empty, the preview clears and asks for a network name. **Hidden network** adds an `H:true` field for networks that do not broadcast their name.

**The QR image contains the password.** Anyone with a copy can decode the text even if they cannot currently reach the network. Use an isolated guest network for sharing, keep printed codes in controlled places, and rotate credentials when access should end. The tool cannot test your router's settings or promise every scanner supports the selected security mode.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it work on an iPhone?

Many mobile cameras recognize this Wi-Fi QR format, but support and prompts vary by device and OS version. Test the downloaded code on the devices that guests will use.

### Is it safe to print the password in a QR code?

Treat a printed code exactly like the password itself — anyone who can photograph it can join the network. If you hand one out and later change your mind, change the password.

### Which security type should I pick?

Choose the mode your router actually uses. The tool writes `T:WPA` for the WPA / WPA2 / WPA3 option, `T:WEP` for WEP, and `T:nopass` for an open network; it does not negotiate with your router or check device compatibility.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
