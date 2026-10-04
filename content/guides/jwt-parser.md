---
title: JWT Parser Guide
description: Decode, live-edit and verify JSON Web Tokens.
date: '2026-09-27'
tags:
- web
tool_guide_slug: jwt-parser
broader_guide:
  title: Understanding and Debugging JWTs
  url: /guides/jwt-debugging/
about: Decode, live-edit and verify JSON Web Tokens. Paste an existing token to inspect it,
  click the header or payload to edit the JSON and rebuild the token live, then check whether
  the signature still matches. Signature checking covers HMAC (HS256/384/512), RSASSA-PKCS1_v1_5
  (RS256/384/512), RSA-PSS (PS256/384/512) and ECDSA (ES256/384/512).
faq:
- q: Does this verify the signature?
  a: Yes, in the Check the signature panel, for HS, RS, PS and ES algorithms. Paste the shared
    secret for HMAC tokens or the PEM public key for the rest, and it recomputes the signature
    over the header and payload exactly as they arrived. That is why editing the payload by
    even one character flips the answer to a mismatch.
- q: Does a valid signature mean the token is trustworthy?
  a: No. It only means the token was signed by whoever holds the key you pasted. It says nothing
    about whether that issuer is one you trust, and it does not enforce exp, nbf, aud or iss
    — those are separate checks your application still has to make.
- q: 'Why is alg: none refused?'
  a: '`alg: none` means there is no signature. Anyone could change the claims, so the tool
    will not call it verified. For real authentication, an application must allow only the
    algorithms it expects; it must not trust the algorithm just because it appears in the
    token.'
- q: Is it safe to paste a token here?
  a: The decoding and the signature check both happen in your browser and nothing is uploaded.
    Even so, a token is a live credential — use a throwaway one when you are testing, and
    never paste a production secret.
---

A JWT is text with pieces separated by dots. One piece describes how it was made; another contains information called *claims*. [JWT Parser](/tools/jwt-parser/) lets you **read** those pieces. Reading a token is not the same as proving it is safe to trust.

## Read a harmless example

Open the tool and paste this made-up, **unsigned** example into **JWT**:

```text
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vLXVzZXIifQ
```

Under **Header**, you should see `"alg": "none"`. Under **Payload**, you should see `"sub": "demo-user"`. The `sub` claim identifies who the token is about; here it is just a test name. **Signature** should say `(none)`. Choose **Verify signature**: the tool refuses `alg: none` because there is no signature to check. Never use this example as an access token.

## What verification actually means

For a *signed* token, you need the correct secret or public key to check the signature. A matching signature says the holder of that key signed these bytes. It does **not** prove the issuer is trusted, the token is meant for your app, or the token has not expired. Your application must check those things separately. Editing a header or payload changes the token text, so an old signature will no longer match.

Do not paste a live token or a production signing secret into a debugging example. Even though this page processes them in the browser, tokens can be credentials. Use throwaway test values you are allowed to inspect.

## If the parts do not appear

A token needs readable dot-separated parts. Check that you copied the whole string without extra characters. A malformed token may show a decoding error; it is not something the tool can repair or validate as an access grant.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Understanding and Debugging JWTs](/guides/jwt-debugging/).
