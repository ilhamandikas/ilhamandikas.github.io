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
---

Build grpcurl commands for native gRPC and test gRPC-Web endpoints from the browser. Native gRPC uses HTTP/2 features that browsers do not expose directly, so browser requests here are explicitly gRPC-Web requests.

## Open the tool

[Use gRPC Tester](/tools/grpc-tester/).

## Where your input goes

Some actions send a request to an endpoint you provide. Check what you are sending before using real data.

## Questions you might have

### Can a browser call native gRPC?

Not directly. Browsers can use gRPC-Web through a compatible server or proxy. For native gRPC, use the generated grpcurl command from a terminal.

## Related guide

For more background, read [API Testing](/guides/api-testing/).
