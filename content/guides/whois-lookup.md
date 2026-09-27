---
title: WHOIS Lookup Guide
description: Show registrar, registration and expiry dates, status and nameservers for a domain.
date: '2026-09-27'
tags:
- network
tool_guide_slug: whois-lookup
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Show the registrar, registration and expiry dates, status codes and nameservers for a domain. It reads the registry's own RDAP service, discovered from the IANA bootstrap directory, so there is no third-party proxy in the middle. When a registry publishes no RDAP service at all, the tool says so instead of guessing.

## Open the tool

[Use WHOIS Lookup](/tools/whois-lookup/).

## Where your input goes

Some actions send a request to RDAP providers. Check what you are sending before using real data.

## Questions you might have

### Why do some domains return nothing?

A few registries publish no RDAP endpoint at all — .io, .co, .de and several other ccTLDs among them. Without one there is no machine-readable record to fetch.

### Why is the registrant hidden?

Since GDPR, most registries redact personal details on private registrations. The tool tells you when the response has been redacted rather than showing blanks.

### What is the difference between RDAP and WHOIS?

RDAP is the structured HTTPS replacement for the old port-43 WHOIS protocol. It returns JSON instead of free text, so the fields can be labelled reliably rather than pattern-matched.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
