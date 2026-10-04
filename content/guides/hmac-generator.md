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
about: Compute an HMAC over a message using SHA-256, SHA-384 or SHA-512 and a shared secret,
  then copy the result as hex or base64. Paste an expected HMAC to check it against the message
  and key, which is how a webhook signature is normally verified. The computation uses WebCrypto.
faq:
- q: What is the difference between an HMAC and a plain hash?
  a: A plain hash proves nothing about who produced it. An HMAC mixes in a secret, so only
    someone holding that secret can produce the same value — which is what lets you verify
    that a webhook came from the service you expect.
- q: Should I use hex or base64?
  a: 'Either works; they are the same bytes in different clothes. Providers differ: GitHub
    sends hex, Shopify sends base64, and many APIs use base64 because it is shorter. The verify
    box accepts whichever you paste, so you can compare across formats.'
- q: How does the verify box decide if it matches?
  a: It computes the HMAC for the current message and key, then compares it with what you
    pasted. A value that is all hexadecimal is compared as hex, anything else as base64. Whitespace
    is ignored so a value split across lines still matches.
---

An **HMAC** is a short result made from **both a message and a secret key**. If either changes, the result changes. [HMAC Generator](/tools/hmac-generator/) lets you inspect that relationship with test values; it is not a place to publish a real signing key.

## Make and compare a test signature

1. Type `hello` in **Text** and replace the default **Key** with `demo-key`. Leave **Algorithm** on **SHA-256** and **Output** on **Hex**.
2. The **HMAC (hex)** output should start with `716539aa`. **Copy** takes the full result. The output updates after you type.
3. Paste that output into **Verify (paste an expected HMAC)**. You should see **Signature matches.**
4. Change the message to `hello!` but leave the expected HMAC alone. You should now see **Signature does not match.**

**Base64** writes the same signature bytes in another alphabet. Choose the form the system you are working with actually expects. **SHA-1** is offered for compatibility with old integrations; prefer a modern algorithm when you control both sides. If an expected signature does not match, check the exact message bytes, key, algorithm, and output format before blaming the other system.

## Keep real secrets out of examples

The calculation happens in your browser, but the key is visible in the input and a copied value goes to your clipboard. Use disposable values when learning. This page compares signatures for debugging; a production webhook verifier should follow the provider's rules for canonical bytes, request age, and safe comparison rather than copying browser-tool logic.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
