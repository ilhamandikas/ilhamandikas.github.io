---
title: RSA Key Pair Guide
description: Generate an RSA public and private key pair, and check whether two keys match.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: rsa-key-pair
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Generate an RSA key pair in the browser with WebCrypto, in PEM form, ready to paste into an SSH or TLS configuration — and check whether a public key and a private key you already have are actually a pair. The private key never leaves the page unless you copy it out.

## Open the tool

[Use RSA Key Pair](/tools/rsa-key-pair/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How many bits should the key be?

2048 is the accepted minimum today. 4096 is slower to generate and to use for a modest margin, and 1024 should be treated as broken.

### How do you tell whether two keys match?

WebCrypto cannot derive one key from the other, so the check signs a fixed throwaway message with the private key and asks the public key to verify it. If the signature verifies, the two halves share a modulus and are a genuine pair. The probe message is a constant, so the same two keys always give the same answer.

### Which key formats are accepted for the check?

PKCS#8 and PKCS#1 for private keys, SPKI and PKCS#1 for public keys — that is BEGIN PRIVATE KEY, BEGIN RSA PRIVATE KEY, BEGIN PUBLIC KEY and BEGIN RSA PUBLIC KEY. The PKCS#1 forms are what openssl genrsa and openssl rsa -RSAPublicKey_out print, so they are wrapped into PKCS#8 or SPKI before WebCrypto sees them rather than rejected.

### Is a key generated in a browser trustworthy?

The cryptography is the same WebCrypto implementation your browser uses for TLS, so the maths is sound. What you have to trust is the page itself, which is why generating keys offline is the safer habit for anything that matters.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
