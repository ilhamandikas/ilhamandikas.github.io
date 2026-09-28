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

A **port** is a number used to direct a network connection to a service on a machine. [Port Reference](/tools/port-reference/) lists common port numbers and the services usually associated with them. It does **not** scan a server to find out what is running.

## Look up a familiar port

Type `22` in **Search**. Look for port **22**, protocol **TCP**, and service **SSH**. SSH is commonly used for remote shell access. Clear the search and type `53`; you should find **DNS** listed for both **TCP and UDP**.

Choose **UDP** under **Protocol** while searching for `53`. The DNS row should still be there. Search for `22` with UDP selected and the SSH row should disappear because the table lists it as TCP.

## Treat names as clues

Any application can be configured to use a different port. Seeing `22` in a log is a reason to check for SSH, **not proof** that the service is SSH. This is a short local reference, not a complete registry or a live network lookup. To identify a running process, check the machine or service configuration you are allowed to inspect.

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
