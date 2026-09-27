---
title: Case Converter Guide
description: Switch text between camelCase, snake_case, kebab-case and more.
date: '2026-09-27'
tags:
- text
tool_guide_slug: case-converter
broader_guide:
  title: Text Formatting and Cleanup
  url: /guides/text-formatting-and-cleanup/
---

Switch text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case and sentence case, with word boundaries inferred from the separators and capitalisation already present.

## Open the tool

[Use Case Converter](/tools/case-converter/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### How does it split words that are already joined together?

It splits on separators and on the case boundaries it can see, so getHTTPResponse becomes get, HTTP, Response. Where the input is ambiguous it can only ever be a guess.

## Related guide

For more background, read [Text Formatting and Cleanup](/guides/text-formatting-and-cleanup/).
