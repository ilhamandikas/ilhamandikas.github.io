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

Email delivery has several steps: your application creates a message, a server accepts it, other servers relay it, and the recipient's mailbox decides what to do with it. “Sent” at the first step does not mean “arrived in the inbox.”

## Locate the last known step

Check the application's delivery logs and the receiving server's response if you have it. A rejection is different from an accepted message that landed in spam. Read the full error before editing DNS records or retrying indefinitely.

## Inspect headers carefully

Message headers show routing and authentication results, including SPF, DKIM, and DMARC. They are evidence, not a magic score. Work from the oldest relevant `Received` line toward the newest, and remember that headers can expose addresses and internal hostnames. Redact them before sharing.

## Related tools

- [Email Header Analyzer](/tools/email-header-analyzer/) — Parse raw email headers, list the delivery hops and show where the time went.
- [Email Normalizer](/tools/email-normalizer/) — Normalize email addresses to a canonical form.
