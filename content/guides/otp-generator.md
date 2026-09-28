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

A **TOTP** (time-based one-time password) is a short code derived from a shared secret and the current time. [OTP Generator](/tools/otp-generator/) shows the **current** code from a Base32 secret using your browser's clock. It does **not** verify a code someone sent you or display the next code.

## Read the built-in demo

The page opens with a demonstration **Secret (Base32)**. Leave **Digits** at `6`, **Period** at `30`, and **Algorithm** at **SHA-1**. **Current code** should show six digits (formatted with a space after the first three), and the status shows how many seconds remain in this time window. The digits change about every 30 seconds; there is no fixed code you should expect. Try **Digits** `8` and count eight digits instead. An invalid Base32 character produces a clear error instead of a code.

This public demo secret is not for protecting an account. For a real account, both parties must agree on secret, period, digit count, algorithm, and reasonably synchronized clocks. The secret and code are visible on this page. Do not paste your real authenticator's shared secret here or share it in a screenshot; anyone with that secret could generate your codes.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is my secret sent anywhere?

No. The HMAC is computed locally with WebCrypto. That said, do not paste a production secret into any page you do not control — including this one.

### Why does the code not match my authenticator app?

First check the secret, digit count, period, and hash algorithm expected by the service. Then check both clocks: a time-based code changes when its configured period ends. The page shows the time remaining on **your browser's** clock, not the remote server's time.

## Related guide

For more background, read [Security and Cryptography Basics for Developers](/guides/security-cryptography-basics/).
