---
title: Email Header Analyzer Guide
description: Parse raw email headers, list the delivery hops and show where the time went.
date: '2026-09-27'
tags:
- network
tool_guide_slug: email-header-analyzer
broader_guide:
  title: Email Debugging
  url: /guides/email-debugging/
---

Mail servers add **headers** recording how a message traveled. [Email Header Analyzer](/tools/email-header-analyzer/) reads raw headers pasted into the browser, lists `Received` hops from oldest to newest, and extracts any SPF, DKIM, and DMARC **reported verdicts**. It does not verify those authentication methods independently.

## Inspect a harmless sample

Paste these two lines into **Raw email headers**:

```text
Received: from mail.example.com ([203.0.113.10]) by mx.example.net; Tue, 1 Oct 2024 10:00:03 -0700
Authentication-Results: mx.example.net; spf=pass; dkim=pass; dmarc=pass
```

Under **Summary**, SPF, DKIM, and DMARC should each say `pass`. Under **Delivery path**, you should see **1 delivery hop**, from `mail.example.com` to `mx.example.net`. With one hop, **Delay** is a dash; the tool needs two parseable hop timestamps to calculate a difference. Those verdicts are *text copied from the header*, not a live check of the sending domain.

If you see **No headers found**, paste the header block rather than only the message body. Header chains and displayed sender names can be forged; check trusted receiving-server records for an incident. Real mail headers include personal addresses and internal IPs, so redact them before sharing a screenshot.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why do the hops appear in a different order from the paste?

Mail servers prepend a Received header, so the first one in the file is the most recent hop. The analyzer reverses them so hop 1 is where the message started and the last hop is where it arrived, which is the order the journey happened in.

### How is the delay between hops worked out?

Each Received header ends with a timestamp after the semicolon. The page parses those timestamps and subtracts consecutive ones, so a large gap points at a server that queued the message. Clock skew between servers can make a delay look negative.

### What do the SPF, DKIM and DMARC values mean?

They are the receiving server's verdicts. pass means the check succeeded, fail means it did not, and softfail, neutral, none or temperror are the softer outcomes. They come from Authentication-Results and are reported exactly as written.

### Can I use this to trace spam?

It helps. The earliest hop and the sending IP are the most useful, and the authentication verdicts show whether the sender was allowed to use the domain. Treat the headers as evidence to check, not proof, since earlier hops can be forged.

## Related guide

For more background, read [Email Debugging](/guides/email-debugging/).
