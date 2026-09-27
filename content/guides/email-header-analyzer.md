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

Paste the raw headers of a message and the page lays out the delivery path: each Received hop in order, the hosts and IP addresses involved, the time between hops, and the SPF, DKIM and DMARC verdicts from the Authentication-Results header. Nothing leaves the browser.

## Open the tool

[Use Email Header Analyzer](/tools/email-header-analyzer/).

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
