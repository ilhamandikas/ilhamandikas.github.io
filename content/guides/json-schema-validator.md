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
about: 'Paste a JSON Schema and a JSON document and the document is checked against it in
  the page. The validator covers the parts of draft-07 that carry most real API contracts:
  type, enum, const, numeric and string bounds, arrays and objects, required and additional
  properties, $ref, allOf/anyOf/oneOf/not and if/then/else. Every problem is reported at once,
  with the JSON Pointer path that leads to it, so a document can be fixed in a single pass.'
faq:
- q: Does my data leave the browser?
  a: No. Both the schema and the document are parsed and checked in the page. Nothing is uploaded,
    which is the point of a tool like this when the payload is a real API response.
- q: Which draft of JSON Schema is supported?
  a: A practical subset of draft-07. The common validation keywords are implemented; annotations
    such as title, description and default are ignored because they do not change whether
    a value is valid. Remote $ref targets are not fetched — only local references into the
    same schema.
- q: Why do I see several errors for one mistake?
  a: Each keyword is checked independently, so a wrong type can also trip a pattern or an
    enum further down. Fixing the first error usually clears the ones that follow, which is
    why they are listed together instead of one at a time.
- q: What is the path next to each message?
  a: 'A JSON Pointer into the document, starting at # for the root, with each property and
    array index appended. It points straight at the value that failed, so you can copy it
    into code that walks the same path.'
- q: Is a valid result a guarantee?
  a: 'It means the document satisfies the keywords this page implements. It is not a full
    conformance suite: unknown keywords are treated as annotations, and formats are checked
    with pragmatic rules rather than the strictest reading of every specification.'
---

A **JSON Schema** describes rules for JSON data. [JSON Schema Validator](/tools/json-schema-validator/) compares your **Document** to a **Schema** directly in the browser. It implements a useful subset of draft-07, not every keyword in the standard.

## Find a missing field

Choose **Load example**. The status should say **Valid**, and the **Result** summary says the document matches the schema. The example requires `id` and `email`. Delete the `email` property from **JSON value to validate** while keeping the JSON syntax valid. The result should report a **missing required property "email"** at the root path `#`. Put the property back and the error clears. **Clear** empties both editors; it does not fix invalid input for you.

A path such as `#/id` points to the `id` field in the JSON document; `#` means its root. Some problems may produce multiple messages because keywords are checked independently. Local `$ref` references are supported, but remote references are not fetched. Treat **Valid** as “matches the rules this tool implements,” not as proof that the JSON meets every draft-07 rule or that an API will accept it.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
