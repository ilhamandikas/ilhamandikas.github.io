---
title: IP & Geolocation Lookup Guide
description: Show your public IP (or any address) with its country, city, coordinates and
  ISP.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ip-lookup
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Show the public IP address you are connecting from, or look up any address, along with its country, region, city, coordinates, timezone and ISP. This is one of the few tools on this site that talks to the internet: it uses free, key-less services and falls back to a second one if the first is unavailable.

## Open the tool

[Use IP & Geolocation Lookup](/tools/ip-lookup/).

## Where your input goes

Some actions send a request to ipwho.is or freeipapi.com. Check what you are sending before using real data.

## Questions you might have

### Why does it show a different city than where I am?

Geolocation is based on the address your ISP has registered, not on your physical position, so it usually lands on the nearest city where the provider has infrastructure.

### Which services does it use?

ipwho.is first, then freeipapi.com. Both are free and need no API key, and the tool tells you which one answered.

### Does this site store my address?

No. The request goes from your browser straight to the provider and the result is rendered here. Nothing is logged by this site.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
