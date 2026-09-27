---
title: SSH Key Generator Guide
description: Generate an Ed25519, ECDSA or RSA key pair, with the OpenSSH public key and fingerprints.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: ssh-key-generator
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Generate an SSH key pair in the browser — Ed25519, ECDSA on P-256, P-384 or P-521, or RSA at 2048, 3072 or 4096 bits — and download the private key in the format your own ssh reads. The private key is OpenSSH's native openssh-key-v1 container, which is what ssh-keygen writes and what ssh accepts, with a PKCS#8 PEM copy offered beside it for tools that want one. Keys are generated locally with WebCrypto and are never sent anywhere.

## Open the tool

[Use SSH Key Generator](/tools/ssh-key-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why is the private key in OpenSSH format instead of PKCS#8?

Because PKCS#8 Ed25519 is not readable by OpenSSH. Measured on OpenSSH 9.6, ssh-keygen -y on a PKCS#8 Ed25519 key fails with "invalid format", while the same key in the openssh-key-v1 container works. PKCS#8 is convenient and widely supported by other tools, so it is offered as a second, clearly labelled panel — but the file you download for ssh is the one ssh can actually open. Claiming the wrong one is portable would be worse than the extra panel.

### How do I use the key once I have downloaded it?

Save the private key, then chmod 600 it — ssh refuses to read a private key that anyone else can open, and that refusal is a feature. Copy the public key into ~/.ssh/authorized_keys on the server, or hand it to whatever service you are setting up. The public key is the one-line ssh-ed25519 or ssh-rsa form that starts with the key type.

### Which key type should I pick?

Ed25519 unless you have a reason not to: it is small, fast, and has no parameter choices to get wrong. Use RSA if you have to talk to something old — 3072 bits or more, since 2048 is the floor rather than a recommendation. ECDSA is there for compatibility with systems that expect it; it is fine, but there is no advantage over Ed25519 on a modern system.

### Are the fingerprints real, or does the page just make them up?

They are computed from the same wire format ssh uses, and they were checked against ssh-keygen as an independent oracle — both the SHA-256 and the MD5 form, for every key type the page offers. The private key was checked further: a real ssh-keygen -Y sign and -Y verify round trip, plus openssl pkey -check on the PKCS#8 copy. That is stronger evidence than the page agreeing with itself, but it was measured on Linux OpenSSH 9.6 — older OpenSSH and Windows tools such as puttygen are untested here.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
