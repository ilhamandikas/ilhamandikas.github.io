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

Generate a random IPv6 unique local address prefix in fd00::/8, following RFC 4193, for a network that should never be routed on the public internet.

## Open the tool

[Use IPv6 ULA Generator](/tools/ipv6-ula-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between fc00::/7 and fd00::/8?

The whole range is fc00::/7. The fd00::/8 half is where the 40-bit global ID is generated locally rather than assigned by a registry, which is the practical choice.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
