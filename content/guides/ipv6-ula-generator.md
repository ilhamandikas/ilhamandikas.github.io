---
title: IPv6 ULA Generator Guide
description: Generate a random IPv6 unique local address prefix.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ipv6-ula-generator
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

An IPv6 **unique local address (ULA)** prefix is for addressing within a site or interconnected private sites, not for normal routing on the public Internet. [IPv6 ULA Generator](/tools/ipv6-ula-generator/) creates random `/48` prefixes starting with `fd` in your browser.

## Get two example prefixes

Set **How many** to `2` and click **Generate**. Under **ULA prefixes (/48)**, you should see two lines shaped like `fdxx:xxxx:xxxx::/48`, where each `x` is a hexadecimal digit. The exact values change each run. **Copy** takes both lines; **Download** saves `ipv6-ula.txt`.

The 40 random bits make a collision less likely, but this tool does not consult other networks or reserve a prefix. Record which prefix you actually deploy, especially if two networks may later connect. A ULA is **not** an access-control rule: configure routing and firewall policy separately, and do not assume the prefix alone keeps traffic private.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between fc00::/7 and fd00::/8?

The whole range is fc00::/7. The fd00::/8 half is where the 40-bit global ID is generated locally rather than assigned by a registry, which is the practical choice.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
