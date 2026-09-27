---
title: JSON Schema Validator Guide
description: Validate a JSON document against a JSON Schema (draft-07 subset) and list every
  problem with its JSON Pointer path.
date: '2026-09-27'
tags:
- data
tool_guide_slug: json-schema-validator
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

Paste a JSON Schema and a JSON document and the document is checked against it in the page. The validator covers the parts of draft-07 that carry most real API contracts: type, enum, const, numeric and string bounds, arrays and objects, required and additional properties, $ref, allOf/anyOf/oneOf/not and if/then/else. Every problem is reported at once, with the JSON Pointer path that leads to it, so a document can be fixed in a single pass.

## Open the tool

[Use JSON Schema Validator](/tools/json-schema-validator/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does my data leave the browser?

No. Both the schema and the document are parsed and checked in the page. Nothing is uploaded, which is the point of a tool like this when the payload is a real API response.

### Which draft of JSON Schema is supported?

A practical subset of draft-07. The common validation keywords are implemented; annotations such as title, description and default are ignored because they do not change whether a value is valid. Remote $ref targets are not fetched — only local references into the same schema.

### Why do I see several errors for one mistake?

Each keyword is checked independently, so a wrong type can also trip a pattern or an enum further down. Fixing the first error usually clears the ones that follow, which is why they are listed together instead of one at a time.

### What is the path next to each message?

A JSON Pointer into the document, starting at # for the root, with each property and array index appended. It points straight at the value that failed, so you can copy it into code that walks the same path.

### Is a valid result a guarantee?

It means the document satisfies the keywords this page implements. It is not a full conformance suite: unknown keywords are treated as annotations, and formats are checked with pragmatic rules rather than the strictest reading of every specification.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
