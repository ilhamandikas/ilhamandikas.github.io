---
title: MAC Address Generator Guide
description: Generate random MAC addresses, with optional prefix.
date: '2026-09-27'
tags:
- network
tool_guide_slug: mac-address-generator
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
about: Generate random MAC addresses, optionally holding a prefix so the result stays inside
  a vendor range you specify.
faq:
- q: Can I use a generated MAC on a real network?
  a: Only after checking your network's rules and that the result does not clash with another
    device. The tool does not check the network or set the locally administered bit for you.
    Choosing an appropriate first byte helps avoid impersonating a vendor, but it is **not**
    a collision guarantee.
---

A **MAC address** is a six-byte label used by network interfaces on a local link. It is often written as six pairs of hexadecimal digits, like `02:00:00:aa:bb:cc`. [MAC Address Generator](/tools/mac-address-generator/) makes example labels; it cannot reserve one on a real network.

## Make a local example

Set **How many** to `2` and type `02:00:00` in **Prefix**. Choose **Generate**. You should see two addresses with six pairs each. The first three pairs stay `02:00:00`; the remaining pairs are random, so there is no fixed expected address. Change **Separator** from `:` to `-` to change only the writing style. **Uppercase** changes only the hex letters.

## Before using one on a device

A random result is not proof of uniqueness. Two devices on the same network can still clash. This tool **does not automatically set the locally administered bit** when **Prefix** is empty or contains another value. If your use case requires a locally administered address, choose and verify the first byte deliberately—for example, `02` in this demonstration. Do not assume a user-supplied vendor prefix gives you permission to impersonate that vendor.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
