---
title: MAC Address Lookup Guide
description: Look up the vendor behind a MAC address OUI.
date: '2026-09-27'
tags:
- network
tool_guide_slug: mac-address-lookup
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
about: Look up the vendor registered to a MAC address's OUI — its first three octets — against
  the bundled IEEE registry.
faq:
- q: Why does a lookup return nothing?
  a: The local list has only selected prefixes, so many genuine registered OUIs are absent.
    Virtual machines and randomized addresses can also use locally assigned prefixes. This
    result cannot identify a device or its owner reliably.
---

A **MAC address** is a six-byte identifier used on a local network link. Its first three bytes are often called an **OUI** (organizationally unique identifier) and can hint at an equipment maker. [MAC Address Lookup](/tools/mac-address-lookup/) checks a **small built-in selection** of prefixes; it does *not* query the full IEEE registry.

## Read the included example

The page begins with `00:1B:63:84:45:E6`. Results should include **OUI** `00:1B:63` and **Vendor** `Apple`, as well as normalized, dashed, and Cisco-style writing formats. Replace the input with `02:00:00:00:00:01`: the address still has a valid shape, but the vendor will say **Unknown / not in the local list** and **Scope** will say locally administered.

**Unknown** does not mean a device is fake: the list is intentionally small, and many devices use randomized or locally assigned MAC addresses. **Vendor found** is also not proof of the actual manufacturer of a device; addresses can be changed. Do not publish a real device inventory just to demonstrate a format.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
