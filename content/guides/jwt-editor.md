---
title: JWT Encode Guide
description: Create, edit and sign JSON Web Tokens from header and payload JSON.
date: '2026-09-27'
tags:
- web
tool_guide_slug: jwt-editor
broader_guide:
  title: Understanding and Debugging JWTs
  url: /guides/jwt-debugging/
---

Build and sign a JSON Web Token in the browser. You edit the header and the payload as JSON, and the token line at the top is rebuilt as you type. Signing happens locally with WebCrypto, using a secret for HS256/384/512 or a PEM private key for RS, PS and ES algorithms — the key never leaves the page. The alg field in the header is rewritten to match the algorithm you choose, so the token cannot claim one algorithm while being signed with another.

## Open the tool

[Use JWT Encode](/tools/jwt-editor/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does this verify a token, or only create one?

Only create. Verification — including the checks that a token claiming alg: none is refused and that an RSA key cannot be used to forge an HMAC — is what the JWT Parser tool does. Splitting them keeps each page honest about what it is doing: this one will happily sign whatever you give it, which is exactly what a forgery would look like, so it must never be mistaken for a check.

### Which key formats can I paste in?

PEM. For RSA, both PKCS#8 (BEGIN PRIVATE KEY) and PKCS#1 (BEGIN RSA PRIVATE KEY) are accepted, because tools still emit both. For EC, PKCS#8 is required — an SEC1 EC PRIVATE KEY block is refused with an explanation rather than being half-parsed, because the curve is not named inside it and guessing it is how you sign with the wrong one.

### Why are the payload dates not shown as readable times?

Because the payload is yours, not a schema. exp and iat are only numbers if you put them there, and an editor that rewrites your payload to show a date is an editor that changes what you are about to sign. The JWT Parser does annotate the registered claims, because reading a token that already exists is a different job.

### Is a token I sign here safe to use?

Only for testing. The token is as good as the key you paste in, and this page has no idea whether that key belongs to your production system. Never paste a real signing key into a page you do not control, and treat any token built here as a throwaway.

## Related guide

For more background, read [Understanding and Debugging JWTs](/guides/jwt-debugging/).
