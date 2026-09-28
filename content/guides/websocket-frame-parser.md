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

A WebSocket **frame** carries a piece of a message, with a header that says what kind of data follows. [WebSocket Frame Parser](/tools/websocket-frame-parser/) reads the hex bytes of **one** frame; it does not connect to a server or reassemble a conversation.

## Decode a tiny text frame

Paste `81 02 48 69` into **Frame bytes (hex)**. In **Frame**, you should see **FIN** yes, **Opcode** `0x1 · Text`, **Masked** no, and **Payload length** `2 bytes`. In **Payload**, the text should read `Hi`: `48 69` are its UTF-8 bytes. Remove the final `69` and you should see an error explaining that two payload bytes were declared but only one is present.

This parser accepts pairs of hex digits with spaces between them, not a `0x` prefix on every byte. For a **masked** client frame, it uses the four-byte mask key to show the unmasked payload. A decoded payload can contain credentials or private messages: use invented bytes for examples and do not paste production frame captures into public tickets.

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

No connection is made by this parser, and bytes are decoded in the browser. That does not make production tokens safe to share: the decoded text appears on your screen, and pasted captures may remain in your clipboard or screenshots.

## Related guide

For more background, read [Testing and Debugging WebSockets](/guides/websocket-debugging/).
