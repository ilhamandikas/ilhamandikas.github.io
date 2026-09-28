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

## Look up a domain

Type a domain such as `example.com` into **Domain** and click **Look up**. The result lists the **Registrar**, the **Registered**, **Last changed** and **Expires** dates, the **Nameservers**, the **Status** codes and whether **DNSSEC** is signed, and the **Source** line names who answered. **Copy as JSON** copies the structured record for a ticket.

The request goes to the registry's RDAP service, discovered through the IANA bootstrap directory, with rdap.org as a fallback; it does not pass through ilham.dev. Many private registrations are redacted under privacy law, and the page notes when that has happened. A typo usually comes back as a "does not look like a domain name" error rather than a result.

## Where your input goes

Some actions send a request to RDAP providers. Check what you are sending before using real data.

## Questions you might have

### Why do some domains return nothing?

A few registries still publish no RDAP endpoint. Without one there is no machine-readable record for the tool to fetch, so it reports that instead of showing an empty panel.

### Why is the registrant hidden?

Since GDPR, most registries redact personal details on private registrations. The tool tells you when the response has been redacted rather than showing blanks.

### What is the difference between RDAP and WHOIS?

RDAP is the structured HTTPS replacement for the old port-43 WHOIS protocol. It returns JSON instead of free text, so the fields can be labelled reliably rather than pattern-matched.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
