---
title: HMAC Generator Guide
description: Compute keyed HMAC signatures with a choice of digest.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: hmac-generator
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Compute an HMAC over a message using SHA-256, SHA-384 or SHA-512 and a shared secret, then copy the result as hex or base64. Paste an expected HMAC to check it against the message and key, which is how a webhook signature is normally verified. The computation uses WebCrypto.

## Open the tool

[Use HMAC Generator](/tools/hmac-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What is the difference between an HMAC and a plain hash?

A plain hash proves nothing about who produced it. An HMAC mixes in a secret, so only someone holding that secret can produce the same value — which is what lets you verify that a webhook came from the service you expect.

### Should I use hex or base64?

Either works; they are the same bytes in different clothes. Providers differ: GitHub sends hex, Shopify sends base64, and many APIs use base64 because it is shorter. The verify box accepts whichever you paste, so you can compare across formats.

### How does the verify box decide if it matches?

It computes the HMAC for the current message and key, then compares it with what you pasted. A value that is all hexadecimal is compared as hex, anything else as base64. Whitespace is ignored so a value split across lines still matches.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
