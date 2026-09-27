---
title: Token Generator Guide
description: Generate random tokens and passwords of a chosen length and charset.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: token-generator
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Generate random tokens and passwords of a chosen length from a chosen character set, drawn from the browser's cryptographic random source. Useful for API keys, session secrets and share links.

## Open the tool

[Use Token Generator](/tools/token-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How long should a token be?

For a machine-generated secret, 32 characters from a mixed alphabet is about 190 bits of entropy, which is far past brute force. Length buys you more than character variety does.

### Is Math.random good enough for this?

No. Math.random is a fast seeded generator whose output can be predicted from previous values. This tool uses crypto.getRandomValues instead.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
