---
title: TLS Certificate Decoder Guide
description: Inspect the domains, dates, issuer, and fingerprint in a PEM certificate without mistaking decoding for trust verification.
date: 2026-10-14
tags:
- security
- networking
tool_guide_slug: tls-certificate-decoder
about: Decode the fields inside an X.509 PEM certificate, including its subject, issuer, subject alternative names, validity dates, public key algorithm, serial number, and SHA-256 fingerprint. Bundles are decoded in input order, not validated as a chain.
faq:
- q: Does this verify that my certificate is trusted?
  a: No. Decoding reads fields, and the date status uses your device clock. The tool does not verify signatures, hostname matches, trust chains, or revocation.
- q: Does my certificate leave the browser?
  a: The decoder processes input locally, does not upload or save it, and does not connect to the certificate's domains. Private keys and CSRs are not accepted.
- q: Can I paste a full certificate chain?
  a: You can paste up to 20 complete CERTIFICATE PEM blocks within the 1,000,000-character input limit. Each is decoded separately in input order. Chain relationships and trust are not checked.
- q: Which extensions does it decode?
  a: It decodes DNS, IP, email, and URI entries in Subject Alternative Name. Other SAN types are marked as not decoded; other extensions are listed by OID and critical flag only. RSA-PSS parameters are not decoded, and unknown algorithms retain their OID.
---

A certificate contains names, dates, an issuer, and a public key. The [TLS Certificate Decoder](/tools/tls-certificate-decoder/) reads those fields from PEM text; it does not establish whether a browser would accept the certificate.

## Start with the built-in example

Choose **Load example** to inspect a self-signed demonstration certificate for `example.com`. Its private key is not included.

The report includes these SAN entries:

```text
DNS: example.com
DNS: *.example.com
IP: 192.0.2.10
IP: 2001:db8:0:0:0:0:0:1
```

The IPv6 address is displayed without zero compression. These are names and addresses declared inside the certificate, not discovered from a server. A wildcard name is not a guarantee that every nested subdomain matches; this tool performs no hostname matching.

**Subject** identifies the certificate's subject. **Issuer** records the name of the entity that issued it. The two names in this example are identical, but identical names alone do not prove a self-signature is correct or that the certificate is trusted.

**Not before** and **Not after** are UTC timestamps. A date status of **Within validity dates** only means your device clock falls inside that interval. An incorrect clock changes that result. The remaining-days figure counts full 24-hour periods, not calendar dates.

## Compare the fingerprint

The SHA-256 fingerprint hashes the complete certificate's DER bytes, not the PEM text or only its public key. Rewrapping PEM lines does not change it. A renewed certificate can have the same domains and public key but a different fingerprint.

For an independent check with OpenSSL:

```sh
openssl x509 -in certificate.pem -noout -subject -issuer -dates
openssl x509 -in certificate.pem -noout -ext subjectAltName
openssl x509 -in certificate.pem -noout -sha256 -fingerprint
```

These commands inspect the first certificate in a PEM bundle; they are not a trust verification either.

## When decoding fails

Paste complete `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` blocks with their Base64 contents. Do not include a private key, a CSR, or command output around them. Binary DER files must first be converted to PEM. Malformed or unsupported fields produce an error without clearing your input or showing a partial report.

The decoder handles the certificate's core fields and SANs, not every X.509 extension. It lists remaining extensions by OID and whether they are critical. RSA-PSS parameters and uncommon name-string encodings are not fully decoded.

Input stays in the page, without tool storage or upload. **Copy report** includes the decoded names and addresses, which can reveal internal infrastructure. Review it before sharing; **Clear** removes the input and report from the page.

If this certificate is part of an nginx deployment, the [nginx Reverse Proxy Wizard](/tools/nginx-reverse-proxy-wizard/) can help build the server configuration. Decoding a PEM does not check which certificate that server is actually serving.

## References

- [RFC 5280: certificate fields, dates, and extensions](https://www.rfc-editor.org/rfc/rfc5280.html#section-4.1)
- [OpenSSL x509 command](https://docs.openssl.org/3.0/man1/openssl-x509/)
