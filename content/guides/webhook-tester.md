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

## Sign a Stripe-style event

Paste a small payload such as `{"event":"payment.succeeded","id":"evt_123"}` into **Payload**, leave **Provider format** on **Stripe (t=, v1=)** and **Signing secret** on `whsec_test`, and keep the **Timestamp** at the current second. The **Signature** panel fills in: the header name reads `Stripe-Signature`, **Header value** becomes `t=<timestamp>,v1=<hex>`, and the digest on its own is shown in the **Raw signature** field. The HMAC is computed in the page with the Web Crypto API, so the secret you type stays on your machine.

Copy that header value into **Paste the received signature header** and the verdict reads **Signature is valid.** Edit one character of the hex and it flips to **Signature does not match.** For Stripe the signed string is `<timestamp>.<payload>`, so changing the timestamp alone invalidates the signature — that is what lets a receiver reject an old, replayed delivery. Press **Now** to refresh the timestamp before a real send.

Each provider signs a different string and wraps it differently: **GitHub** emits `sha256=<hex>` over the payload, **Shopify** sends base64, and **Generic HMAC-SHA256** is plain hex over the payload. Switch providers and the header name and format change with it. To actually deliver the request, open the collapsed **Send a test request** section, give it a **Target URL** and press **Send POST**; the browser can only finish that when the target allows your origin through CORS. If it fails, the signature panel still shows exactly what would have been sent.

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
