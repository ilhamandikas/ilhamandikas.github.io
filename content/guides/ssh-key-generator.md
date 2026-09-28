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

An SSH **key pair** has two parts. The **public key** can be placed on a server to grant access; the **private key** stays with you and must not be shared. [SSH Key Generator](/tools/ssh-key-generator/) creates both in your browser. It cannot recover a private key you lose.

## Make a test pair

1. Leave **Type** on **Ed25519**, add a harmless **Comment** such as `test-laptop`, then choose **Generate key pair**. Some browsers do not support every key type; read the status if generation fails.
2. Under **Public key**, find an **authorized_keys line** beginning with `ssh-ed25519`. **Download .pub** saves that public line. The comment at its end is a label, not part of the cryptographic check.
3. Under **Private key**, you should see an **OpenSSH private key**. **Download** saves that sensitive half. Do not paste it into a ticket or chat. The **PKCS#8 PEM** panel is another format of the same private key for software that expects it—not a second public key.

The **Fingerprint** shown here describes **your generated public key**. It is **not** the host-key fingerprint your SSH client shows when connecting to a server for the first time. Do not use it as a substitute for checking the server's identity.

## Before using a real key

The downloaded OpenSSH private key has **no passphrase** at first. Save it somewhere you control, restrict access (for example, `chmod 600` on an appropriate Unix private-key file), and add a passphrase with `ssh-keygen -p` if you need one. Put **only the public key** in the server's `authorized_keys`. Generating a pair does not install it or grant access by itself.

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
