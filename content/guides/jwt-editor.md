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

A **JWT** is three dot-separated sections: a JSON header, a JSON payload (**claims**), and a signature. [JWT Encode](/tools/jwt-editor/) builds and signs a **test token** when you choose **Encode / sign**; it does **not** verify a token or rebuild automatically as you type.

## Make a throwaway token

Keep **Algorithm** on **HS256**, set **Claims as JSON** to `{"sub":"demo"}`, and type `demo-only-key` into **Shared secret**. Click **Encode / sign**. **Result** should contain three sections separated by two dots, and the status should say **HS256 signature written**. The token text depends on your input; **Copy** and **Download** take the generated token. The editor rewrites the header's `alg` to match the selected algorithm.

If the payload is not a JSON *object*, or the secret is empty for HS256, you get an error rather than a valid signature. **none** creates an unsigned token, not an authentication token. For asymmetric algorithms, this tool expects the appropriate PEM private key. Do not paste a real signing key or production JWT into a screenshot, URL, or shared test; anyone with the secret can forge tokens accepted by the system using it. To check a signature, use [JWT Parser](/tools/jwt-parser/) with the matching test key.

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
