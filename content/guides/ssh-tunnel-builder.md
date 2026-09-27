---
title: SSH Tunnel Builder Guide
description: Assemble an ssh -L, -R or -D tunnel with the right ports, identity file and keepalive
  options, then copy the command.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ssh-tunnel-builder
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
---

Write an ssh tunnel without memorising the -L, -R and -D shapes. Pick the direction, fill in the ports, and the page assembles the command with the keepalive and failure options most people forget. The bind address is optional, and -D hides the destination fields because a SOCKS proxy has none.

## Open the tool

[Use SSH Tunnel Builder](/tools/ssh-tunnel-builder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between -L, -R and -D?

A local forward (-L) makes a service on the far side reachable from a port on this machine. A remote forward (-R) does the opposite: it publishes a service on this machine to the far side. A dynamic forward (-D) opens a SOCKS proxy you can point a browser at.

### Why are -f and -N on by default?

Together they put the tunnel in the background and run no remote command, which is what you usually want for a tunnel that only forwards ports. Turn them off if you also want a shell on the host.

### Does this connect for me?

No. It only writes the command; you copy it and run it in your own terminal, so no key or password ever touches the page.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
