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

An IPv4 address looks like `192.168.1.10`. A *subnet* is a group of addresses, and a suffix such as `/24` tells you how large the group is. [IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator/) shows the group containing the address you enter.

## Read one small example

The tool starts with `192.168.1.0/24` in **CIDR block**. CIDR is the address-plus-suffix notation. Look for these results:

- **Network:** `192.168.1.0` — the start of this block.
- **Broadcast:** `192.168.1.255` — the last address in this block.
- **Netmask:** `255.255.255.0` — another way to write what `/24` means.
- **First host** and **Last host:** `192.168.1.1` and `192.168.1.254`.
- **Total addresses:** `256`; **Usable hosts:** `254` under the ordinary network-and-broadcast rule.

Now type `192.168.1.10/24`. The **Network** should still be `192.168.1.0`: `.10` lives inside the same block. This is why the result can start with a different address from the one you typed. The **CIDR** row shows the block's starting address and prefix.

## If you see an error

An IPv4 address must have four numbers from `0` to `255`, separated by dots. A prefix must be from `/0` to `/32`. Try `192.168.1.10/24` first, then change one part at a time. The calculator does not check whether your router, firewall, or cloud provider will actually let you use the range.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the usable host count two less than the total?

For ordinary IPv4 subnets, the first address is reserved as the network address and the last as broadcast, so the tool subtracts two. **Watch out:** this tool reports `0` usable hosts for `/31` and `/32`. That count is not a full explanation of those special cases: `/31` can be used for a point-to-point link, and `/32` names a single address. Check your network's rules before treating the count as a deployment decision.

### Can it plan a VLSM layout?

Not directly. Use it to check one block at a time, or the range expander to see which CIDR blocks cover an arbitrary range exactly.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
