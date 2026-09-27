---
title: Understanding and Debugging JWTs
description: How to read JWT headers and claims, check expiry, and understand what
  signature verification does and does not prove.
date: '2026-09-27'
tags:
- security
aliases:
- /posts/how-to-read-and-verify-jwt/
---

A JWT is a string with three dot-separated parts: header, payload, and signature. You can read the first two parts without a secret. Reading them does **not** prove the token was issued by someone you trust.

## Start with what the token says

Decode the header and payload, then inspect claims such as `iss` (issuer), `aud` (audience), `exp` (expiry), and `nbf` (not before). These time claims are Unix timestamps in seconds. Compare them with the current time; a clock mismatch can make a token appear early or expired.

## Then verify who signed it

Signature verification needs the expected algorithm and the correct key. Do not choose an algorithm merely because the token header requests it; your application should decide what it accepts. Even a valid signature does not automatically mean the token is appropriate for this endpoint: check issuer, audience, time claims, and application rules too.

A JWT can contain sensitive information even if it is not encrypted. Avoid pasting live tokens into services you have not reviewed.

## Related tools

- [JWT Encode](/tools/jwt-editor/) — Create, edit and sign JSON Web Tokens from header and payload JSON.
- [JWT Expiry Editor](/tools/jwt-expiry-editor/) — Edit iat, nbf and exp claims on a JWT and re-sign it without touching JSON by hand.
- [JWT Parser](/tools/jwt-parser/) — Decode, live-edit and verify JSON Web Tokens.
