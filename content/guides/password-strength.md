---
title: Password Strength Guide
description: Estimate how long a password would take to crack.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: password-strength
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Estimate how much work a password represents by measuring its entropy, assuming a specific number of guesses per second, and reporting how long a cracking rig would need. It is an estimate with stated assumptions rather than a verdict, which is the honest way to present this.

## Open the tool

[Use Password Strength](/tools/password-strength/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why does my password score badly?

Usually because it is short, or built from a predictable pattern. Length adds entropy far faster than swapping letters for symbols, so a long passphrase nearly always beats a short complicated string.

### Is my password sent anywhere?

No. The estimate is computed in the page and nothing is transmitted.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
