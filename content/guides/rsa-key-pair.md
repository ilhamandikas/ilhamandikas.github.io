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

An RSA **key pair** has a public half and a private half. [RSA Key Pair](/tools/rsa-key-pair/) generates PEM text in the browser and can test whether an RSA public/private pair matches. These are generic **SPKI public** and **PKCS#8 private** PEM formats—not an `authorized_keys` line or a ready-made TLS certificate.

## Generate and check a throwaway pair

Leave **Modulus** at `2048-bit` and choose **Generate key pair**. The public box should begin `-----BEGIN PUBLIC KEY-----`; the private box should begin `-----BEGIN PRIVATE KEY-----`. Their contents are random, so there is no fixed expected key. Under **Do these two keys match?**, choose **Use the generated pair**, then **Check the pair**. The status should say **Match** and report `2048-bit`. **Copy public** and **Copy private** copy each half separately.

Only the public half is meant to be shared. The private PEM is unencrypted text on the page and clipboard; do not use a demonstration key for production. Reloading loses the generated pair. Checking two pasted keys performs a local sign-and-verify test; it does not certify where the key came from or install it for SSH/TLS. Use the [SSH Key Generator](/tools/ssh-key-generator/) if you specifically need OpenSSH key files.

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

WebCrypto generates the key material in your browser, but the private key is displayed as unencrypted text. The safety of a real key also depends on the browser, device, page integrity, storage, and how you later use it. Follow your organization's key-generation and handling policy.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
