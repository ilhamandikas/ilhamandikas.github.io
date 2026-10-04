---
title: UTM Builder Guide
description: Build and parse UTM campaign URLs with source, medium, campaign, term, content
  and id.
date: '2026-09-27'
tags:
- web
tool_guide_slug: utm-builder
broader_guide:
  title: Web Metadata
  url: /guides/web-metadata/
about: Build a campaign URL with the standard utm_source, utm_medium, utm_campaign, utm_term,
  utm_content and utm_id parameters, or paste an existing URL to see which UTM values it carries.
  Existing query parameters are preserved.
faq:
- q: Does it shorten the URL?
  a: No. It only adds and reads parameters. Use your analytics platform's shortener if you
    need a short link.
---

**UTM parameters** are labels in a URL that an analytics setup may use to identify where a visit came from. [UTM Builder](/tools/utm-builder/) adds or reads these labels as text; it does not send the link to an analytics service.

## Build and inspect a harmless link

Set **Base URL** to `https://example.com/docs` and **Source (utm_source)** to `newsletter`. Leave the other UTM fields blank. **Result** should show `https://example.com/docs?utm_source=newsletter`. Press **Copy URL** for that result. Paste it into **URL to inspect** under **Parse a URL**; after a brief pause, you should see a `utm_source` row with value `newsletter`.

Existing non-UTM query parameters are kept, but **blank UTM fields remove matching UTM parameters** already present in the base URL. A missing scheme is treated as HTTPS. Review the result before sharing: URLs can appear in browser history, server logs, and referrer data. Never put personal data or secrets into UTM values.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Web Metadata](/guides/web-metadata/).
