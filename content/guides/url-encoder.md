---
title: URL Encoder Guide
description: Percent-encode and decode URL components.
date: '2026-09-27'
tags:
- encoding
tool_guide_slug: url-encoder
broader_guide:
  title: Writing and Publishing Text for the Web
  url: /guides/writing-for-the-web/
---

Percent-encode and decode URL components, either the whole string or one component at a time. The distinction matters more than it looks: encoding a full URL turns its own ? and & into data, which is usually not what you want.

## Open the tool

[Use URL Encoder](/tools/url-encoder/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Should I encode the whole URL or just a parameter?

Almost always just the parameter. Use component mode when the value goes inside a query string, and whole-URL mode only when the URL itself is the data being passed along.

## Related guide

For more background, read [Writing and Publishing Text for the Web](/guides/writing-for-the-web/).
