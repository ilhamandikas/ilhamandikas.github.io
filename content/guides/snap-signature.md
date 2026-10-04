---
title: SNAP BI Asymmetric Signature Guide
description: Build, sign and verify the SHA256withRSA signature used by Bank Indonesia's SNAP
  BI standard.
date: '2026-09-27'
tags:
- network
tool_guide_slug: snap-signature
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
about: A workbench for the asymmetric signature in Bank Indonesia's SNAP BI standard, the
  scheme banks and payment providers use for API requests and notifications. It builds the
  string to sign from the HTTP method, endpoint, a SHA-256 hash of the minified body and the
  X-TIMESTAMP, then signs it with an RSA private key or verifies it with the sender's public
  key. Both operations run in the browser with the Web Crypto API.
faq:
- q: What exactly is the string that gets signed?
  a: HTTPMethod + ':' + EndpointUrl + ':' + lowercase(hex(SHA-256(minify(body)))) + ':' +
    X-TIMESTAMP. The method is upper-cased, the body is minified JSON, and its SHA-256 is
    written as lowercase hex. Join the four parts with colons and sign that exact string.
- q: Which key goes where?
  a: Signing uses the private key of the sender. Verification uses the public key of the sender,
    not yours. For a notification you received, the sender is the payment provider, so paste
    the public key they published.
- q: Why is the body minified before hashing?
  a: The signature must not depend on cosmetic whitespace, so both sides agree to strip it
    first. JSON.stringify(JSON.parse(body)) removes the formatting and the receiver hashes
    the same compact form. If the body is not valid JSON it is hashed as typed.
- q: Is this the same as SHA256withRSA in Java or Node?
  a: Yes. Web Crypto's RSASSA-PKCS1-v1_5 with SHA-256 is exactly SHA256withRSA, so a signature
    made here verifies in Java, Node or any SNAP BI library, and the other way round.
- q: Can I use a production private key here?
  a: Technically yes, but do not. This is a public web page, so paste a test key, or press
    Generate key pair to create a throwaway 2048-bit pair and try the flow end to end.
---

A workbench for the asymmetric signature in Bank Indonesia's SNAP BI standard, the scheme banks and payment providers use for API requests and notifications. It builds the string to sign from the HTTP method, endpoint, a SHA-256 hash of the minified body and the X-TIMESTAMP, then signs it with an RSA private key or verifies it with the sender's public key. Both operations run in the browser with the Web Crypto API.

## Check the built-in sample

The page opens in **Verify (public key)** mode with a sample request and a matching signature. Click **Verify** without changing anything; **Signature / verdict** should read `true` and the status should say **Signature is valid.** The **String to sign** panel shows the exact `POST:/v1.0/debit/notify:…:2024-05-02T14:43:08+07:00` line that was hashed and signed, with the minified body and its SHA-256 just above it.

To run your own flow, click **Generate key pair** for a throwaway 2048-bit RSA pair, switch **Action** to **Generate (private key)** and click **Sign**; **Signature / verdict** then holds a base64 signature. Switch back to **Verify (public key)** and click **Verify** to see `true`. **Load sample** restores the original request. **Now** fills **X-TIMESTAMP** with a real value, but it uses a UTC `…Z` timestamp while SNAP BI examples are usually written with a `+07:00` offset, so check which one your counterparty expects.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
