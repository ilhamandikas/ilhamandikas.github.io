---
title: WebSocket Tester Guide
description: Open a WebSocket from the page, send frames and watch what the server sends back.
date: '2026-09-27'
tags:
- network
tool_guide_slug: websocket-tester
broader_guide:
  title: Testing and Debugging WebSockets
  url: /guides/websocket-debugging/
about: Open a WebSocket from your browser, send text or binary frames, and watch everything
  that arrives in a timestamped log. The connection is made by the page itself, so it goes
  from your machine to the server you name and through nothing else. Binary frames can be
  typed as hex and are converted for you, and JSON that comes back is indented so it is readable.
  Close codes are explained rather than just printed.
faq:
- q: Why can I not connect to a ws:// address from this page?
  a: Because the page is served over https, and a browser refuses to open an insecure WebSocket
    from a secure page — it would be a hole in the padlock. This is a mixed-content rule enforced
    by the browser, not a setting here. Use wss://, or run the test from a page served over
    plain http, or use a command-line client such as websocat for a local ws:// endpoint.
    The page allows ws:// to localhost, which browsers treat as trustworthy.
- q: What does close code 1006 mean?
  a: That the connection closed without a close frame — no proper handshake, no reason string.
    It is what you see when the server process died, a proxy dropped the connection, or the
    network went away, and it is deliberately not a code a server can send you. The log spells
    this out because 1006 on its own looks like a mystery number.
- q: Can I send binary data?
  a: Yes. Tick "Send as binary" and type the bytes as hex, and the page converts them to an
    ArrayBuffer before sending. Anything that is not valid hex is refused with a message rather
    than being sent as something else. Replies are labelled as text or binary in the log,
    and binary replies are shown as hex.
- q: How do I connect with a subprotocol?
  a: Type them in the subprotocol field, comma separated — for example chat, superchat. The
    server picks one and the log records which one it chose, which is the part people actually
    need to see when a handshake succeeds but the application protocol is wrong.
---

Open a WebSocket from your browser, send text or binary frames, and watch everything that arrives in a timestamped log. The connection is made by the page itself, so it goes from your machine to the server you name and through nothing else. Binary frames can be typed as hex and are converted for you, and JSON that comes back is indented so it is readable. Close codes are explained rather than just printed.

## Talk to an echo server

Type `wss://echo.websocket.org` into **Address** and click **Connect**. If that public server is up, the status says **Connected** and the log records `open` with the chosen subprotocol. Type `hello` into **Frame** and press **Enter**; the log shows the frame going out and the echo coming back, each with a timestamp. Tick **Send as binary (hex)**, type `48 69` and press **Enter** to send the two bytes `Hi`. **Disconnect** closes the socket with code 1000, and **Clear log** empties the transcript.

A bare host such as `example.com/socket` is turned into a `wss://` address, because a page served over https cannot open a plain `ws://` socket except to localhost; the tool says so rather than failing silently. If you see `close — code 1006`, no close frame arrived — the server dropped it, nothing was listening, or a proxy refused it. The socket is your browser's own, so the server sees your real address and this site's `Origin` header; do not point it at a private service you do not own. Public echo servers come and go, so if one is down, use an address you control.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Testing and Debugging WebSockets](/guides/websocket-debugging/).
