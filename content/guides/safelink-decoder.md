---
title: SafeLink Decoder Guide
description: Extract the real destination behind an Outlook SafeLink.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: safelink-decoder
broader_guide:
  title: Working With URLs
  url: /guides/working-with-urls/
---

Extract the real destination from an Outlook SafeLink, which wraps the original URL in a redirect through Microsoft's safelinks service. It decodes the url parameter and shows where the link genuinely goes.

## Open the tool

[Use SafeLink Decoder](/tools/safelink-decoder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why do SafeLinks exist?

Microsoft rewrites links in email so it can scan the destination at click time and block it later if it turns malicious. That is why the address you see is not the real one.

## Related guide

For more background, read [Working With URLs](/guides/working-with-urls/).
