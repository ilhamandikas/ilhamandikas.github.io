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
about: Load a JWT, edit its iat, nbf and exp claims with date pickers, and re-encode the token.
  Use the quick +15m / +1h / +1d buttons to extend an expiry, then re-sign with HS256, HS384
  or HS512, or strip the signature entirely for local testing. Everything runs in the browser.
faq:
- q: The signature no longer verifies after editing — is that a bug?
  a: No. Changing any claim changes the signed data. Re-sign with the same secret and algorithm
    the issuer used, or the token will be rejected.
- q: Can it sign with RS256 or ES256?
  a: Not yet. This tool focuses on HMAC secrets for quick testing; use the JWT Encode tool
    for PEM-based algorithms.
---

JWTs can contain three time claims measured in **seconds since 1970 UTC**: `iat` (issued), `nbf` (not before), and `exp` (expires). [JWT Expiry Editor](/tools/jwt-expiry-editor/) decodes a token and lets you change these times; it can re-sign using an HMAC test secret or produce an unsigned token. **Editing a claim invalidates the original signature.**

## Change a disposable token

First make a test HS256 token with `{"sub":"demo"}` and `demo-only-key` at [JWT Encode](/tools/jwt-editor/). Paste it into **Token** here. After a brief pause, the **Claims** editor appears; set **Secret** to the same `demo-only-key` and choose **+1h**. **Expires at (exp)** should fill with a date/time about one hour from now, **Updated token** should have three dot-separated sections, and the status should say **Signed with HS256**. **Copy token** copies that *new* token. The date inputs are in your browser's local timezone, while the JWT stores UTC epoch seconds.

The quick buttons add time to the *current expiry*, or from now if there is none; they do not set a fixed duration from original issuance. When a secret is missing in HMAC mode, the output has an empty signature and is **not** a valid HMAC token. **none** also removes the signature and should be refused by real verifiers. Only use invented claims and disposable secrets here. This tool does not prove that your server will accept the new token.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Understanding and Debugging JWTs](/guides/jwt-debugging/).
