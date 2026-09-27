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
---

Normalise an email address to a canonical form: lowercase the domain, strip a +tag from the local part, and remove dots for providers where they are ignored. Useful for deduplicating a mailing list.

## Open the tool

[Use Email Normalizer](/tools/email-normalizer/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Is removing dots always safe?

No. Dots are only ignorable at specific providers — Gmail and a few others. At most providers first.last and firstlast are genuinely different mailboxes, so only apply this when you know the domain.

## Related guide

For more background, read [Email Debugging](/guides/email-debugging/).
