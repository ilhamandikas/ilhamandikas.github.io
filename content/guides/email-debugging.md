---
title: Email Debugging
description: Email headers, normalized addresses, suspicious messages, and the limits
  of what email metadata can prove.
date: '2026-09-27'
tags:
- security
aliases:
- /posts/how-to-normalize-email-addresses-without-breaking-login/
- /posts/how-to-read-email-headers/
---

Email headers, normalized addresses, suspicious messages, and the limits of what email metadata can prove.

This guide is the canonical guide page for related tools on ilham.dev. It should grow into practical explanations, caveats, examples, and references instead of creating one thin article per utility.

## Related tools

- [Email Header Analyzer](/tools/email-header-analyzer/) — Parse raw email headers, list the delivery hops and show where the time went.
- [Email Normalizer](/tools/email-normalizer/) — Normalize email addresses to a canonical form.

## Notes for future edits

- Keep the guide reusable and factual.
- Link to personal posts only when there is a real incident, measurement, migration, or lesson.
- For sensitive inputs, mention whether the related tool runs locally in the browser and warn against pasting production secrets without understanding the trust boundary.
