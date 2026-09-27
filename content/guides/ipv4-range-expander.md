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
---

Given a start and end address, list the CIDR blocks that cover the range exactly, so you can turn an arbitrary range into something a firewall or a route table will accept.

## Open the tool

[Use IPv4 Range Expander](/tools/ipv4-range-expander/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does it return several blocks instead of one?

CIDR blocks are always powers of two, so an arbitrary range almost never lands on one. The tool finds the smallest set of blocks that covers it without going over.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
