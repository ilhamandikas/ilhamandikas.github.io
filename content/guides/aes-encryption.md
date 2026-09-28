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

**Encryption** makes readable text unreadable without the password. [AES Encryption](/tools/aes-encryption/) uses AES-GCM, with a key derived from your password using PBKDF2. Its Base64 output includes the random salt and IV needed to decrypt it *with this tool*; Base64 is a transport format, not a second encryption layer.

## Encrypt and decrypt a test phrase

1. Leave **Mode** on **Encrypt**. Enter a disposable **Password** such as `demo-password-only` and type `Hello` into **Input**. Choose **Run**.
2. **Output** should become a long Base64 string; **Copy** takes it. It differs on each run, even with the same text and password, because fresh salt and IV bytes are generated.
3. Change **Mode** to **Decrypt**, paste that entire output into **Input**, leave the password unchanged, and press **Run**. **Output** should now say `Hello`. An incorrect password or a damaged payload gives an error; the original encrypted blob is not automatically recoverable if the password is lost.

Do not put real passwords or plaintext in a shared screenshot or URL. This browser-based tool does not provide key recovery, account management, or a documented cross-application file format; use a vetted encryption workflow appropriate to your actual data.

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
