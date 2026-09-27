---
title: IPv6 Expander Guide
description: Expand, compress and classify an IPv6 address, with prefix and embedded IPv4
  support.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ipv6-expander
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Paste an IPv6 address in any spelling and the page shows the full eight-group form, the canonical compressed form and what kind of address it is. Prefixes, zone indexes and embedded IPv4 addresses are understood, and everything is computed in the browser.

## Open the tool

[Use IPv6 Expander](/tools/ipv6-expander/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does the compressed form sometimes keep a zero group?

The canonical rules compress only the longest run of two or more zero groups. A single zero group is written as a plain 0, and on a tie the leftmost run is the one compressed, so the same address always has one canonical spelling.

### What is the difference between link-local, unique local and global?

Link-local (fe80::/10) is for one link and is never routed. Unique local (fc00::/7) is the IPv6 equivalent of private space, routable inside an organisation but not on the public internet. Global unicast (2000::/3) is the public, routable range.

### What is an IPv4-mapped address?

An address of the form ::ffff:a.b.c.d that carries an IPv4 address inside an IPv6 one. It appears on dual-stack sockets and in logs, and the expander recognises it so you are not left guessing why a dotted quad shows up in an IPv6 field.

### Does the zone index change the address?

No. The part after % names a local interface, such as %eth0, and is not part of the 128 bits. It matters only to the host you are on, which is why it is shown separately and not included in the expanded or compressed forms.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
