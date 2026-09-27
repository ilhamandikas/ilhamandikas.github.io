---
title: Port Reference Guide
description: Search the common TCP and UDP ports with their service names and a short description.
date: '2026-09-27'
tags:
- network
tool_guide_slug: port-reference
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

A compact, offline table of the ports that come up most often when you read configs, logs and firewall rules. Each row gives the port number, whether it is TCP, UDP or both, the usual service name and a one-line note on what it carries. Search by number or name.

## Open the tool

[Use Port Reference](/tools/port-reference/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is this a full list of every port?

No, it is a shortlist of the common ones. The IANA registry has thousands of assignments. This table is meant to answer the everyday question of what is probably running on a port, not to be a complete authority.

### Does a port number guarantee the service?

No. A port is just a number; anything can listen on it. The service column shows the conventional assignment, so treat it as a strong hint and confirm with the process or the application config.

### What is the difference between TCP and UDP for the same port?

They are separate namespaces. Port 53 is used by DNS over both, and port 123 is UDP for NTP. When a service uses both, the row lists tcp/udp, and the protocol filter matches either.

### Why are some dev-server ports listed as alternatives?

Ports like 3000, 5000 and 8000 have no official service. They are shown as common development defaults because that is how they actually turn up, and the note makes clear they are conventions rather than assignments.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
