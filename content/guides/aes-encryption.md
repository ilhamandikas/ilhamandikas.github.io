---
title: AES Encryption Guide
description: Encrypt and decrypt text with AES.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: aes-encryption
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Encrypt and decrypt text with AES-GCM using a passphrase, with the key derived by PBKDF2. The output is a self-contained Base64 blob carrying the salt and the initialisation vector, so it can be decrypted later with the passphrase alone.

## Open the tool

[Use AES Encryption](/tools/aes-encryption/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is this strong enough for real data?

AES-GCM and PBKDF2 are sound primitives and the construction is standard. What it cannot protect you from is a weak passphrase, or forgetting it — there is no recovery path.

### Why does the ciphertext change every time?

Because a fresh random salt and IV are generated for each encryption. The same plaintext and passphrase therefore produce a different blob, which is the intended behaviour.

### Is the passphrase sent anywhere?

No. Deriving the key and encrypting both happen in the browser.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
