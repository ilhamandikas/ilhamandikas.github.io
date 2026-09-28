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

An IPv6 address has eight groups of hexadecimal digits (numbers and letters `a` through `f`). Long runs of zeroes can be shortened with `::`. [IPv6 Expander](/tools/ipv6-expander/) shows the long and short forms of the **same address**.

## Open up a short address

The **IPv6 address** box starts at `2001:db8::1`. Look at **Expanded**. It should say `2001:0db8:0000:0000:0000:0000:0000:0001`. The `::` stood for the missing groups of zeroes. **Compressed** shows the short form again. **Type** should say **Documentation**: `2001:db8::/32` is reserved for examples, so this is safe to put in a tutorial.

Now try `::1`. The expanded value should be seven `0000` groups followed by `0001`; its **Type** is **Loopback**. This is a local address on a machine, not a way to contact another computer across a network.

## If the address is rejected

A group may contain at most four hexadecimal digits. `::` can stand for missing groups only once in an address. You can include a `/64` suffix if you want the **Prefix** row to show it, but the tool does not calculate which network owns the address. Expansion is about **writing** an address, not testing whether a host is reachable.

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
