---
title: gRPC Tester Guide
description: Build grpcurl commands and test gRPC-Web endpoints from the browser.
date: '2026-09-27'
tags:
- network
tool_guide_slug: grpc-tester
broader_guide:
  title: API Testing
  url: /guides/api-testing/
about: Build grpcurl commands for native gRPC and test gRPC-Web endpoints from the browser.
  Native gRPC uses HTTP/2 features that browsers do not expose directly, so browser requests
  here are explicitly gRPC-Web requests.
faq:
- q: Can a browser call native gRPC?
  a: Not directly. Browsers can use gRPC-Web through a compatible server or proxy. For native
    gRPC, use the generated grpcurl command from a terminal.
---

**gRPC** calls a named service method, often with Protocol Buffers data. A browser cannot make a raw native gRPC call in the same way as `grpcurl`. [gRPC Tester](/tools/grpc-tester/) has two distinct paths: build a **grpcurl command** as text, or send an experimental **gRPC-Web** HTTP request to a compatible endpoint.

## Build a command without sending data

Leave **Mode** at **Generate grpcurl**. Set **Endpoint** to `https://example.com:443`, **Service / method** to `example.Greeter/SayHello`, and **Payload JSON or base64/protobuf bytes** to `{"name":"Ada"}`. Choose **Run / build**. **Output** should begin with `grpcurl` and include the endpoint, method, and `-d` for the JSON text. Nothing is sent in this mode. You would need a real service, appropriate schema/reflection support, and correct permissions to run that command yourself.

Changing **Mode** to either gRPC-Web option and clicking **Run / build** **does send** a POST to the endpoint from your browser, including the headers and payload you entered. The response is shown mainly as HTTP details plus Base64 bytes, not automatically decoded protobuf. Browser CORS and server support can prevent a response. Do not put credentials into a copied command, shell history, or a request to a host you do not control.

## Where your input goes

Some actions send a request to an endpoint you provide. Check what you are sending before using real data.

## Related guide

For more background, read [API Testing](/guides/api-testing/).
