---
title: bcrypt Guide
description: Hash a password with bcrypt, or verify one against a hash.
date: '2026-09-27'
tags:
- crypto
tool_guide_slug: bcrypt
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Hash a password with bcrypt, or verify a password against an existing bcrypt hash. The cost factor controls how much work each hash takes, and that expense is the whole point.

## Open the tool

[Use bcrypt](/tools/bcrypt/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Which cost factor should I use?

The highest one your server can afford at login time. The tool reports how long each hash took, which is the number that matters — a login should not take much more than about 250 ms.

### Why does the same password give a different hash every time?

Because bcrypt generates a random salt per hash and stores it inside the result. That is what stops two users who chose the same password from having the same hash.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
