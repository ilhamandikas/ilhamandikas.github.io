---
title: DNS Lookup Guide
description: Resolve A, AAAA, MX, TXT, NS, SOA, CAA and SRV records over DNS-over-HTTPS.
date: '2026-09-27'
tags:
- network
tool_guide_slug: dns-lookup
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Resolve A, AAAA, CNAME, MX, TXT, NS, SOA, CAA and SRV records over DNS-over-HTTPS, so the query travels over an encrypted connection instead of plain UDP on port 53. It asks Cloudflare first, falls back to Google, and reports which resolver answered.

## Open the tool

[Use DNS Lookup](/tools/dns-lookup/).

## Where your input goes

Some actions send a request to Cloudflare DNS or Google DNS over HTTPS. Check what you are sending before using real data.

## Questions you might have

### Why is there no ANY query?

Both Cloudflare and Google refuse ANY over DoH and return NOTIMP. Querying each record type individually is what the resolvers actually support.

### Is this the same as dig?

Same records, different transport. dig speaks DNS on port 53; this uses HTTPS, so it works from networks that block port 53 and cannot be tampered with in transit.

### Why do I get a different answer than my own resolver?

You are asking a public resolver with its own cache. A different answer usually means a different cache state, or a CDN handing back the node nearest to the resolver rather than to you.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
