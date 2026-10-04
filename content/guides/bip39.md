---
title: BIP39 Mnemonic Guide
description: Generate a BIP39 mnemonic phrase and derive its seed.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: bip39
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
about: Generate a BIP-39 mnemonic phrase from a chosen word count and derive the seed from
  it, which is how a cryptocurrency wallet backs up a key as words. It also checks a phrase
  you were given for a valid checksum.
faq:
- q: Is it safe to generate a wallet seed in a browser?
  a: The entropy comes from crypto.getRandomValues, so the randomness is real. The risk is
    the page and the machine, not the maths. For anything holding real value, generate offline
    on a machine you control.
- q: Why does it reject my phrase?
  a: The last word carries a checksum. If one word was mistyped the checksum fails and the
    phrase is rejected, which is the feature working as intended.
---

A **BIP-39 mnemonic** is a list of words used as input to a wallet's key-derivation process. [BIP39 Mnemonic](/tools/bip39/) generates an English phrase and shows its entropy and derived seed *using an empty optional passphrase*. It can check the word list and checksum of a phrase, but cannot verify ownership of any wallet.

## Try with a disposable phrase only

Leave **Entropy** on **128 bits · 12 words** and click **Generate**. **Mnemonic** should contain 12 space-separated English words; **Entropy (hex)** and **Seed (hex, empty passphrase)** fill in. The words will differ every time. For this throwaway phrase only, paste the words into **Validate a mnemonic**. The status should read **Valid mnemonic**. Replacing a word may produce **Not a valid mnemonic**, but a valid checksum alone does not prove that a particular wallet or balance exists.

**Never use a tutorial phrase to hold funds.** Anyone who sees the mnemonic or derived seed can potentially access the associated wallet. Copying puts it on your clipboard, and this page offers no offline-wallet setup, secure backup, or way to enter a BIP-39 passphrase for seed derivation. Do not paste an existing wallet's recovery phrase into this page.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
