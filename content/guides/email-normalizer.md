---
title: Email Normalizer Guide
description: Normalize email addresses to a canonical form.
date: '2026-09-27'
tags:
- data
tool_guide_slug: email-normalizer
broader_guide:
  title: Email Debugging
  url: /guides/email-debugging/
about: 'Normalise an email address to a canonical form: lowercase the domain, strip a +tag
  from the local part, and remove dots for providers where they are ignored. Useful for deduplicating
  a mailing list.'
faq:
- q: Is removing dots always safe?
  a: No. This implementation removes dots only for `gmail.com` and `googlemail.com`, but removes
    a `+` suffix for *all* domains. That second rule may also merge different addresses at
    some providers. Keep the original address; do not use normalized text as proof two people
    are the same.
---

[Email Normalizer](/tools/email-normalizer/) applies a few text rules to one address **per line**. This is a *convenience transform*, **not** a universal canonical form. Different mail providers can treat the same spelling differently; never automatically merge user accounts based only on this output.

## See what the tool changes

Paste `John.Doe+news@Gmail.com` into **Email address(es)**. **Normalised** should show `johndoe@gmail.com`. The tool lowercases the address, removes the Gmail dots and `+news`, and changes `googlemail.com` to `gmail.com` too. Add `First.Last+demo@example.com` on another line: the output keeps the dot but removes `+demo` and lowercases the letters.

This tool removes everything after a `+` **at every domain**, even where the provider does not promise that this is an alias. It also lowercases the local part, which not every receiving system treats as interchangeable. For sensitive mail or account records, keep the original address and verify provider-specific rules separately. Do not paste real customer lists into screenshots or shared documents.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Email Debugging](/guides/email-debugging/).
