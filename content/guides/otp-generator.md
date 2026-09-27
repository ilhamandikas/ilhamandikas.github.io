---
title: OTP Generator Guide
description: Generate and verify time-based one-time passwords.
date: '2026-09-27'
tags:
- web
tool_guide_slug: otp-generator
broader_guide:
  title: Security and Cryptography Basics for Developers
  url: /guides/security-cryptography-basics/
---

Generate time-based one-time passwords (TOTP, RFC 6238) from a shared secret, and verify a code you have been given. It shows the current code, the seconds until it rolls over and the next code, so you can compare against a device that may have drifted.

## Open the tool

[Use OTP Generator](/tools/otp-generator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is my secret sent anywhere?

No. The HMAC is computed locally with WebCrypto. That said, do not paste a production secret into any page you do not control — including this one.

### Why does the code not match my authenticator app?

Almost always clock drift. TOTP depends on both sides agreeing which 30-second window it is; the tool shows the remaining seconds so you can see the disagreement.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
