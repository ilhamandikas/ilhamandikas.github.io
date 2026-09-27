---
title: WebSocket Frame Parser Guide
description: Decode a raw WebSocket frame from hex and explain its opcode, length and payload.
date: '2026-09-27'
tags:
- network
tool_guide_slug: websocket-frame-parser
broader_guide:
  title: Testing and Debugging WebSockets
  url: /guides/websocket-debugging/
---

Paste the hex bytes of a single WebSocket frame and the page decodes the bits the RFC defines: FIN, the reserved bits, the opcode, whether the frame is masked, the payload length, the masking key and the payload itself. Text frames are unmasked and shown as readable text.

## Open the tool

[Use WebSocket Frame Parser](/tools/websocket-frame-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Where do I get the raw frame bytes?

From a packet capture or a proxy that logs frames, such as Wireshark with a WebSocket filter, or from a test that dumps the bytes your client sent. Copy the frame payload bytes, not the TCP or TLS wrapper, and paste them as hex.

### Why is the payload scrambled?

Client-to-server frames are masked, so the bytes on the wire are XORed with a four-byte key. The parser applies that key to recover the payload. A server-to-client frame is not masked and is shown as it arrived.

### What does the opcode mean?

0x1 is text, 0x2 is binary, 0x0 continues a fragmented message, 0x8 closes the connection, 0x9 is a ping and 0xa is a pong. Anything else is reserved and is labelled as such rather than guessed at.

### Does this connect to a server?

No. It reads bytes you paste and nothing else. There is no socket and no request, so it is safe for frames that contain tokens or message payloads from production.

## Related guide

For more background, read [Testing and Debugging WebSockets](/guides/websocket-debugging/).
