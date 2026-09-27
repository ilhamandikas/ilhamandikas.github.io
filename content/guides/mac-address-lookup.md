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
---

Look up the vendor registered to a MAC address's OUI — its first three octets — against the bundled IEEE registry.

## Open the tool

[Use MAC Address Lookup](/tools/mac-address-lookup/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does a lookup return nothing?

Virtual machines and randomised addresses do not come from a registered OUI. Most phones now randomise their MAC per network, so a vendor lookup is often meaningless on modern hardware.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
