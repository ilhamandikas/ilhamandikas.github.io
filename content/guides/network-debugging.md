---
title: Network Debugging Notes
description: DNS, WHOIS, IP addresses, ports, subnets, MAC addresses, Wi-Fi QR codes,
  and SSH tunnels.
date: '2026-09-27'
tags:
- networking
aliases:
- /posts/how-to-build-dns-and-network-notes-from-small-tools/
- /posts/how-to-check-an-ip-address-without-overtrusting-geolocation/
- /posts/how-to-check-common-port-numbers/
- /posts/how-to-check-domain-whois-without-overreading-it/
- /posts/how-to-expand-and-read-ipv6-addresses/
- /posts/how-to-generate-an-ipv6-ula-prefix/
- /posts/how-to-generate-test-mac-addresses-safely/
- /posts/how-to-look-up-a-mac-address-vendor/
- /posts/how-to-pick-random-port-numbers-for-local-development/
- /posts/how-to-plan-a-small-ipv4-subnet/
- /posts/how-to-turn-an-ip-range-into-cidr-blocks/
- /posts/how-to-use-dns-lookup-when-a-domain-does-not-work/
- /posts/how-to-use-ssh-tunnel-builder/
---

“The service is down” can mean several things: DNS points to the wrong address, the port cannot be reached, the connection works but TLS fails, or the application replies with an error. Find the first step that breaks.

## Follow the path

Resolve the hostname, check the address you received, then test whether the expected port accepts a connection. If it does, inspect the protocol response. A reachable TCP port does not prove the HTTP application is healthy; a working local request does not prove the public path through a firewall or proxy works.

## Compare vantage points

Test from the machine running the service and from the client that cannot reach it. Check what address the process listens on: `127.0.0.1` only accepts local IPv4 connections, while `0.0.0.0` listens on available IPv4 interfaces. Be careful with public lookups; DNS and IP tools may send your query to an external service.

## Related tools

- [DNS Lookup](/tools/dns-lookup/) — Resolve A, AAAA, MX, TXT, NS, SOA, CAA and SRV records over DNS-over-HTTPS.
- [IP & Geolocation Lookup](/tools/ip-lookup/) — Show your public IP (or any address) with its country, city, coordinates and ISP.
- [IPv4 Address Converter](/tools/ipv4-address-converter/) — Convert between dotted, decimal, hex and binary IPv4 forms.
- [IPv4 Range Expander](/tools/ipv4-range-expander/) — Expand an IP range into the CIDR blocks that cover it.
- [IPv4 Subnet Calculator](/tools/ipv4-subnet-calculator/) — Work out the network, broadcast, mask and host range for a CIDR block.
- [IPv6 Expander](/tools/ipv6-expander/) — Expand, compress and classify an IPv6 address, with prefix and embedded IPv4 support.
- [IPv6 ULA Generator](/tools/ipv6-ula-generator/) — Generate a random IPv6 unique local address prefix.
- [MAC Address Generator](/tools/mac-address-generator/) — Generate random MAC addresses, with optional prefix.
- [MAC Address Lookup](/tools/mac-address-lookup/) — Look up the vendor behind a MAC address OUI.
- [Network Info](/tools/network-info/) — Show what this browser exposes about its connection, device, screen and locale.
- [Port Reference](/tools/port-reference/) — Search the common TCP and UDP ports with their service names and a short description.
- [Random Port Generator](/tools/random-port-generator/) — Pick one or more unused-looking port numbers.
- [SSH Tunnel Builder](/tools/ssh-tunnel-builder/) — Assemble an ssh -L, -R or -D tunnel with the right ports, identity file and keepalive options, then copy the command.
- [WHOIS Lookup](/tools/whois-lookup/) — Show registrar, registration and expiry dates, status and nameservers for a domain.
- [Wi-Fi QR Code](/tools/wifi-qr-generator/) — Build a QR code that joins a Wi-Fi network.
