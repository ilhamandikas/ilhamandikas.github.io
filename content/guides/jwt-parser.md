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
---

Decode, live-edit and verify JSON Web Tokens. Paste an existing token to inspect it, click the header or payload to edit the JSON and rebuild the token live, then check whether the signature still matches. Signature checking covers HMAC (HS256/384/512), RSASSA-PKCS1_v1_5 (RS256/384/512), RSA-PSS (PS256/384/512) and ECDSA (ES256/384/512).

## Open the tool

[Use JWT Parser](/tools/jwt-parser/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does this verify the signature?

Yes, in the Check the signature panel, for HS, RS, PS and ES algorithms. Paste the shared secret for HMAC tokens or the PEM public key for the rest, and it recomputes the signature over the header and payload exactly as they arrived. That is why editing the payload by even one character flips the answer to a mismatch.

### Does a valid signature mean the token is trustworthy?

No. It only means the token was signed by whoever holds the key you pasted. It says nothing about whether that issuer is one you trust, and it does not enforce exp, nbf, aud or iss — those are separate checks your application still has to make.

### Why is alg: none refused?

Because alg: none means the token is unsigned, so anyone who can edit it can also rewrite the payload. A verifier that accepts the algorithm named in the token is the classic algorithm-confusion bug; here the algorithm is read from the header so the right primitive is chosen, and none is always reported as a failure.

### Is it safe to paste a token here?

The decoding and the signature check both happen in your browser and nothing is uploaded. Even so, a token is a live credential — use a throwaway one when you are testing, and never paste a production secret.

## Related guide

For more background, read [Understanding and Debugging JWTs](/guides/jwt-debugging/).
