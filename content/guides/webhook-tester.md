---
title: Webhook Tester Guide
description: Sign, verify and send a test webhook in the Stripe, GitHub or Shopify format.
date: '2026-09-27'
tags:
- network
tool_guide_slug: webhook-tester
broader_guide:
  title: API Testing
  url: /guides/api-testing/
---

A webhook workbench that runs entirely in the browser. Build a payload, sign it with HMAC-SHA256 in the format a provider expects, paste a signature you received to check it, or send the signed request to a test endpoint. The signing secret stays on your machine and is never uploaded.

## Open the tool

[Use Webhook Tester](/tools/webhook-tester/).

## Where your input goes

Some actions send a request to an endpoint you provide. Check what you are sending before using real data.

## Questions you might have

### Which providers are supported?

Stripe, GitHub, Shopify and a generic HMAC-SHA256 format. Each one signs a different string and wraps the result differently: Stripe signs the timestamp and payload and writes t= and v1=, GitHub writes sha256=, Shopify sends base64, and the generic format is plain hex.

### Why is the timestamp part of the signature?

It lets the receiver reject an old request that someone replays later. Stripe includes the timestamp in the signed string and sends it alongside, so changing the timestamp invalidates the signature. Use the Now button to refresh it before sending.

### Why does sending fail with a network error?

Browsers can only send a request when the target allows your origin through CORS, and a webhook endpoint usually does not. That is a browser rule, not a bug. The signature panel still shows exactly what would be sent, so you can test the signing even when the send is blocked.

### Is the secret safe?

It never leaves the page: the HMAC is computed locally with the Web Crypto API and there is no upload step. Still, treat any secret you paste into a website as one you control, and prefer a test secret over a live one.

## Related guide

For more background, read [API Testing](/guides/api-testing/).
