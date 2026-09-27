---
title: Hash Text Guide
description: Compute MD5, SHA-1, SHA-256 and SHA-512 digests of text.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: hash-text
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Compute MD5, SHA-1, SHA-256 and SHA-512 digests of any text. SHA-256 and SHA-512 use the browser's WebCrypto implementation; MD5 and SHA-1 are here because they still turn up in checksums and older protocols, not because they are safe for anything that matters.

## Open the tool

[Use Hash Text](/tools/hash-text/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Can I use MD5 for passwords?

No. MD5 and SHA-1 are broken for anything security-related — both have practical collision attacks, and neither is designed to be slow. Use bcrypt or Argon2 for passwords.

### Why is there no SHA-3?

WebCrypto does not expose it. Adding it would mean shipping a JavaScript implementation, which would be slower than native code and easy to get subtly wrong.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
