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

A **wrapped link** puts one web address inside another, often as a `url=` query parameter. [SafeLink Decoder](/tools/safelink-decoder/) extracts a likely destination from Microsoft SafeLinks and other redirect links. It does **not** visit the destination or check whether it is safe.

## Unwrap a harmless sample

Paste `https://example.com/redirect?url=https%3A%2F%2Fexample.org%2Fdocs` into **Wrapped link**. The **Decoded destination** should become `https://example.org/docs`. `%3A` and `%2F` are encoded characters for `:` and `/`. There is no submit button: the result changes as you edit the input. You can **Copy** or **Download** the resulting text.

If you paste an ordinary URL with no recognized destination parameter, this tool returns the original URL. It can follow up to five nested wrappers, but does not confirm that an outer service would actually send a browser to the displayed address. Inspect the domain carefully, especially for lookalike names, and avoid clicking a suspicious result. Never treat extraction as a malware or phishing scan.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Why do SafeLinks exist?

Microsoft rewrites links in email so it can scan the destination at click time and block it later if it turns malicious. That is why the address you see is not the real one.

## Related guide

For more background, read [Working With URLs](/guides/working-with-urls/).
