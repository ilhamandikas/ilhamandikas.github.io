---
title: JWT Expiry Editor Guide
description: Edit iat, nbf and exp claims on a JWT and re-sign it without touching JSON by
  hand.
date: '2026-09-27'
tags:
- web
tool_guide_slug: jwt-expiry-editor
broader_guide:
  title: Understanding and Debugging JWTs
  url: /guides/jwt-debugging/
---

Load a JWT, edit its iat, nbf and exp claims with date pickers, and re-encode the token. Use the quick +15m / +1h / +1d buttons to extend an expiry, then re-sign with HS256, HS384 or HS512, or strip the signature entirely for local testing. Everything runs in the browser.

## Open the tool

[Use JWT Expiry Editor](/tools/jwt-expiry-editor/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### The signature no longer verifies after editing — is that a bug?

No. Changing any claim changes the signed data. Re-sign with the same secret and algorithm the issuer used, or the token will be rejected.

### Can it sign with RS256 or ES256?

Not yet. This tool focuses on HMAC secrets for quick testing; use the JWT Encode tool for PEM-based algorithms.

## Related guide

For more background, read [Understanding and Debugging JWTs](/guides/jwt-debugging/).
