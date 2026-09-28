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

An **SSH tunnel** forwards a network connection through SSH. [SSH Tunnel Builder](/tools/ssh-tunnel-builder/) writes a command; it does not open a connection, check host identity, or install a key.

## Build a local-forward example

Leave **Forward direction** on **Local forward (-L)**. Fill **Bind address** with `127.0.0.1`, **Local port** with `15432`, **Destination host** with `127.0.0.1`, **Destination port** with `5432`, **SSH user** with `demo`, and **SSH host** with `example.com`. **Command** should contain `-L 127.0.0.1:15432:127.0.0.1:5432 demo@example.com`. This *describes* how a service reachable from the SSH host could be reached through a local port. It does not confirm that the service or host exists. **Copy** takes the command; **Download .sh** saves the text as a script—inspect it before running it.

The defaults include **Background (-f)**, **No remote command (-N)**, a keepalive, and failure-on-forward-error. For debugging, uncheck **Background** and watch terminal errors. **Remote forward (-R)** can expose a service from the other side, depending on SSH server configuration and bind address; confirm who can reach it before running a command. Use only hosts and keys you are authorized to access.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between -L, -R and -D?

A local forward (-L) makes a service on the far side reachable from a port on this machine. A remote forward (-R) does the opposite: it publishes a service on this machine to the far side. A dynamic forward (-D) opens a SOCKS proxy you can point a browser at.

### Why are -f and -N on by default?

Together they put the tunnel in the background and run no remote command, which is what you usually want for a tunnel that only forwards ports. Turn them off if you also want a shell on the host.

### Does this connect for me?

No. The page writes text only. You may enter an identity *file path*, but it does not read the private key or request a password. Running the copied command in your terminal performs the real connection.

## Related guide

For more background, read [Network Debugging Notes](/guides/network-debugging/).
