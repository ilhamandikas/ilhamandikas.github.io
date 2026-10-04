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
about: Compute MD5, SHA-1, SHA-256 and SHA-512 digests of any text. SHA-256 and SHA-512 use
  the browser's WebCrypto implementation; MD5 and SHA-1 are here because they still turn up
  in checksums and older protocols, not because they are safe for anything that matters.
faq:
- q: Can I use MD5 for passwords?
  a: No. MD5 and SHA-1 are broken for anything security-related — both have practical collision
    attacks, and neither is designed to be slow. Use bcrypt or Argon2 for passwords.
- q: Why is there no SHA-3?
  a: WebCrypto does not expose it. Adding it would mean shipping a JavaScript implementation,
    which would be slower than native code and easy to get subtly wrong.
---

A hash turns text into a fixed-length string called a *digest*. You cannot use the digest as a simple way to read the original text back. [Hash Text](/tools/hash-text/) shows several digest algorithms side by side; they make different-looking results from the same input.

## Hash a tiny example

Type `abc` in **Text**. Look at **SHA-256**: the digest starts with `ba7816bf`. Change the input to `abcd`, and that digest changes. Change it back to `abc`, and it returns to the earlier value. The tool hashes the exact text you entered as UTF-8; a space after `abc` is a different input.

Tick or untick **MD5**, **SHA-1**, **SHA-256**, and **SHA-512** to show only the algorithms you need. **Uppercase** changes how the digest is written, not what was hashed. Use the **Copy** button beside the digest you want.

## Do not use this to store passwords

Fast hashes such as SHA-256 are useful for checksums but not a password-storage recipe. Passwords need a dedicated, slow password-hashing method such as bcrypt or Argon2, plus a unique salt. MD5 and SHA-1 remain here for old checksums; do not choose them for new security-sensitive work. Do not paste a production secret into a public example, even if processing happens locally in this browser.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
