---
title: OpenAPI Viewer Guide
description: Read an OpenAPI or Swagger document and list its operations, parameters and responses.
date: '2026-09-27'
tags:
- web
tool_guide_slug: openapi-viewer
broader_guide:
  title: API Testing
  url: /guides/api-testing/
---

Paste an OpenAPI or Swagger document and read it as a list of operations rather than as a wall of YAML. Each endpoint shows its method, its parameters, its request body and the responses it can return, with references resolved so a schema appears where it is used.

## Open the tool

[Use OpenAPI Viewer](/tools/openapi-viewer/).

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it fetch my specification from a URL?

No. The document is read as text in the page, and a reference to another file is shown as a reference rather than followed. That keeps the page working offline and keeps a private spec private.

### Which versions are supported?

OpenAPI 3.0 and 3.1 as well as Swagger 2.0. The overview writes down which one it found, and a Swagger 2 document's host, basePath and schemes are shown as the server.

### How deep does a schema go?

Nested objects are expanded a couple of levels and then summarised as object, so one schema cannot flood the page. The shape is still clear, and the full definition is in the document you pasted.

## Related guide

For more background, read [API Testing](/guides/api-testing/).
