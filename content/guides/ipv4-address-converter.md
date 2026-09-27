---
title: IPv4 Address Converter Guide
description: Convert between dotted, decimal, hex and binary IPv4 forms.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ipv4-address-converter
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Convert an IPv4 address between dotted-decimal, a single 32-bit integer, hexadecimal, octal and binary, and show the four octets broken out.

## Open the tool

[Use IPv4 Address Converter](/tools/ipv4-address-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does 127.0.0.1 become 2130706433?

The four octets are the bytes of one 32-bit number: 127×256³ + 0×256² + 0×256 + 1. That is why some sites accept the decimal form as the same address.

### Why would I need the integer form?

Firewalls, access rules and some APIs store addresses as integers because they are cheaper to compare and range-check than strings.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
