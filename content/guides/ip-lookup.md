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
about: 'Show the public IP address you are connecting from, or look up any address, along
  with its country, region, city, coordinates, timezone and ISP. This is one of the few tools
  on this site that talks to the internet: it uses free, key-less services and falls back
  to a second one if the first is unavailable.'
faq:
- q: Why does it show a different city than where I am?
  a: Geolocation is based on the address your ISP has registered, not on your physical position,
    so it usually lands on the nearest city where the provider has infrastructure.
- q: Which services does it use?
  a: ipwho.is first, then freeipapi.com. Both are free and need no API key, and the tool tells
    you which one answered.
- q: Does this site store my address?
  a: No. The request goes from your browser straight to the provider and the result is rendered
    here. Nothing is logged by this site.
---

Show the public IP address you are connecting from, or look up any address, along with its country, region, city, coordinates, timezone and ISP. This is one of the few tools on this site that talks to the internet: it uses free, key-less services and falls back to a second one if the first is unavailable.

## Look up an address

Leave **IP address** empty and click **Look up** to geolocate the connection you are using. The result shows the address, its **Location**, **Coordinates**, **Timezone** and **ISP**, and the **Source** line names which provider answered. You can also type an address such as `8.8.8.8` and click **Look up**; that one should resolve to a Google DNS range in the United States. **Copy as JSON** copies the raw fields for pasting into a ticket.

This is one of the few tools here that leaves your browser: the address goes to ipwho.is first, with freeipapi.com as a fallback. A private address such as `192.168.1.10` or `10.0.0.5` belongs to your own network and has no public geolocation, so the services will not place it. Results come from the address your ISP registered, so they can land on a nearby city rather than your exact position.

## Where your input goes

Some actions send a request to ipwho.is or freeipapi.com. Check what you are sending before using real data.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
