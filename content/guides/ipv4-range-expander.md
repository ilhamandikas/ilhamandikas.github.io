---
title: IPv4 Range Expander Guide
description: Expand an IP range into the CIDR blocks that cover it.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ipv4-range-expander
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
about: Given a start and end address, list the CIDR blocks that cover the range exactly, so
  you can turn an arbitrary range into something a firewall or a route table will accept.
faq:
- q: Why does it return several blocks instead of one?
  a: CIDR blocks are always powers of two, so an arbitrary range almost never lands on one.
    The tool finds the smallest set of blocks that covers it without going over.
---

A firewall rule may ask for a **CIDR block** instead of a start and end address. CIDR describes a group of addresses with a suffix such as `/30`. [IPv4 Range Expander](/tools/ipv4-range-expander/) finds blocks that cover the exact range you type.

## Cover four addresses

In **IP range (start-end)**, type `192.168.1.0-192.168.1.3`. **Covering CIDR blocks** should show `192.168.1.0/30`. That one block contains `.0`, `.1`, `.2`, and `.3`. The `/30` describes this group's size; it is not a port number.

Now change the start to `.1`: `192.168.1.1-192.168.1.3`. You should see `192.168.1.1/32` and `192.168.1.2/31`. One `/30` would also include `.0`, which you did not ask for, so the tool uses two smaller blocks.

## Before using the result in a firewall

Check that the start and end are in the right order and that you intend to allow **every** address in the range. A CIDR list is just text until you put it in a firewall or route table. The tool does not change network access for you. If you see an error, check that both sides are complete IPv4 addresses with four numbers from `0` to `255`.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
