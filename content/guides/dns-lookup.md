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

DNS is the system that helps turn a domain name into information a browser or mail server can use. An **A record** gives an IPv4 address. An **MX record** points to a mail server. [DNS Lookup](/tools/dns-lookup/) asks a public DNS resolver for those records; it does not read your computer's own DNS cache.

## Look up a safe example domain

1. Type `example.com` in **Domain**. This is a reserved example name, not a private hostname.
2. Set **Record** to **A** and choose **Look up**. If the request works, look for a table with **Type**, **Name**, **TTL**, and **Value**. **Value** holds the answer; **TTL** says how long a resolver may cache it, in seconds. The exact address and TTL can change, so do not copy an example result into your configuration.
3. Choose **MX** to ask a different question about the same name. A domain may have no record of the type you asked for; **No MX records** is not the same as a broken website.
4. **Copy as JSON** copies the lookup result if you need to share it. Check it for private names before sharing.

## If your server sees something else

The tool asks **Cloudflare** over HTTPS first; if that request fails, it tries **Google**. The chosen public resolver may have a different cached answer from your own network. Check the resolver named in the result and compare it with the DNS server your application actually uses. An invalid domain gets an error before a lookup; a valid-looking name can still have no records.

The domain you type is sent to the public resolver. Do not use a sensitive internal hostname unless you intend to disclose that name to the resolver.

## Where your input goes

Some actions send a request to Cloudflare DNS or Google DNS over HTTPS. Check what you are sending before using real data.

## Questions you might have

### Why is there no ANY query?

Both Cloudflare and Google refuse ANY over DoH and return NOTIMP. Querying each record type individually is what the resolvers actually support.

### Is this the same as dig?

They can ask for the same records, but this page uses HTTPS to a public resolver, while `dig` normally uses the DNS resolver configured for your device. The route, cache, and answer may differ. HTTPS protects the connection to the selected resolver; it does not prove the DNS record itself is correct.

### Why do I get a different answer than my own resolver?

You are asking a public resolver with its own cache. A different answer usually means a different cache state, or a CDN handing back the node nearest to the resolver rather than to you.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
