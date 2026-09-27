---
title: IPv4 Subnet Calculator Guide
description: Work out the network, broadcast, mask and host range for a CIDR block.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ipv4-subnet-calculator
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Given an address and a prefix length, work out the network address, broadcast address, netmask, wildcard mask and usable host range, along with the total and usable host counts.

## Open the tool

[Use IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the usable host count two less than the total?

The first address in a subnet is the network address and the last is the broadcast address, and neither can be assigned to a host. The exceptions are /31 and /32, which the tool handles separately.

### Can it plan a VLSM layout?

Not directly. Use it to check one block at a time, or the range expander to see which CIDR blocks cover an arbitrary range exactly.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
