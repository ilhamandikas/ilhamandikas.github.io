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
about: Convert an IPv4 address between dotted-decimal, a single 32-bit integer, hexadecimal,
  octal and binary, and show the four octets broken out.
faq:
- q: Why does 127.0.0.1 become 2130706433?
  a: 'The four octets are the bytes of one 32-bit number: 127×256³ + 0×256² + 0×256 + 1. That
    is why some sites accept the decimal form as the same address.'
- q: Why would I need the integer form?
  a: Firewalls, access rules and some APIs store addresses as integers because they are cheaper
    to compare and range-check than strings.
---

An IPv4 address usually appears as four numbers with dots, such as `192.168.1.1`. Computers can write the **same address** as one number or as bits. [IPv4 Address Converter](/tools/ipv4-address-converter/) lets you compare those forms.

## Check a small address

Type `0.0.0.1` in **IPv4 address**. In **Representations**, look for `Dotted: 0.0.0.1`, `Decimal: 1`, and `Hex: 0x00000001`. The **Binary** row should end in `1` after a line of zeroes. Nothing moved to a new network: these are just different ways to write one address.

Now replace the input with `1`. The **Dotted** result should still be `0.0.0.1`. To try a familiar private-network example, type `192.168.1.1` and compare its dotted, decimal, hex, and binary forms. Use **Copy** if you need the whole result.

## If the input is rejected

A dotted IPv4 address needs exactly four parts; each part must be between `0` and `255`. `192.168.1.999` cannot be an IPv4 address. This tool changes the **representation**, not the subnet or routing rules. If you need a network and host range, use the related [IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
