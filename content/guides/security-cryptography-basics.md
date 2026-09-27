---
title: Security and Cryptography Basics for Developers
description: Hashing, encoding, signatures, keys, passwords, tokens, and crypto terms
  developers often meet while debugging systems.
date: '2026-09-27'
tags:
- security
aliases:
- /posts/how-to-check-a-file-hash-before-trusting-a-download/
- /posts/how-to-check-password-strength-without-fooling-yourself/
- /posts/how-to-check-whether-rsa-keys-match/
- /posts/how-to-create-and-check-hmac-signatures/
- /posts/how-to-generate-random-tokens-with-enough-entropy/
- /posts/how-to-generate-ssh-keys-safely/
- /posts/how-to-hash-passwords-with-bcrypt/
- /posts/how-to-turn-a-small-file-into-base64/
- /posts/how-to-understand-bip39-seed-phrases/
- /posts/how-to-understand-snap-bi-asymmetric-signature/
- /posts/how-to-use-aes-encryption-for-text/
- /posts/how-to-use-base64-without-calling-it-encryption/
- /posts/how-to-use-otp-codes-without-mystery/
---

Encoding, hashing, and encryption solve different problems. Base64 changes how bytes are written and is easy to reverse. A hash produces a fixed-size digest. Encryption protects content only when the key and the way you use it are appropriate.

## Ask what you are protecting against

For checking whether a downloaded file matches a published checksum, compare hashes from a trusted source. For password storage, use a password hashing algorithm designed to be slow, not a plain fast hash. For confidentiality, choose authenticated encryption and protect the key; hiding the ciphertext is not the same as protecting the secret.

## Treat generated secrets as secrets

A key or token is useful only if it is generated securely and kept out of logs, URLs, screenshots, and shared documents. A tool may process data locally and still leave it in clipboard history or a downloaded file. Check what your workflow exposes.

## Related tools

- [AES Encryption](/tools/aes-encryption/) — Encrypt and decrypt text with AES.
- [Base64 Text](/tools/base64-string-converter/) — Encode and decode UTF-8 text to and from Base64, URL-safe optional.
- [bcrypt](/tools/bcrypt/) — Hash a password with bcrypt, or verify one against a hash.
- [BIP39 Mnemonic](/tools/bip39/) — Generate a BIP39 mnemonic phrase and derive its seed.
- [File Hash Checker](/tools/file-hash-checker/) — Hash a file with MD5, SHA-1, SHA-256 and SHA-512, and check it against a published digest.
- [Hash Text](/tools/hash-text/) — Compute MD5, SHA-1, SHA-256 and SHA-512 digests of text.
- [HMAC Generator](/tools/hmac-generator/) — Compute keyed HMAC signatures with a choice of digest.
- [OTP Generator](/tools/otp-generator/) — Generate and verify time-based one-time passwords.
- [Password Strength](/tools/password-strength/) — Estimate how long a password would take to crack.
- [Random Generator](/tools/random-generator/) — Pick from a list with a spin wheel, slot machine, random card, dice or ticker animation.
- [RSA Key Pair](/tools/rsa-key-pair/) — Generate an RSA public and private key pair, and check whether two keys match.
- [SNAP BI Asymmetric Signature](/tools/snap-signature/) — Build, sign and verify the SHA256withRSA signature used by Bank Indonesia's SNAP BI standard.
- [SSH Key Generator](/tools/ssh-key-generator/) — Generate an Ed25519, ECDSA or RSA key pair, with the OpenSSH public key and fingerprints.
- [Token Generator](/tools/token-generator/) — Generate random tokens and passwords of a chosen length and charset.
