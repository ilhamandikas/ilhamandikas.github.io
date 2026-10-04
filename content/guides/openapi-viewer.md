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
about: Paste an OpenAPI or Swagger document and read it as a list of operations rather than
  as a wall of YAML. Each endpoint shows its method, its parameters, its request body and
  the responses it can return, with references resolved so a schema appears where it is used.
faq:
- q: Does it fetch my specification from a URL?
  a: No. The document is read as text in the page, and a reference to another file is shown
    as a reference rather than followed. That keeps the page working offline and keeps a private
    spec private.
- q: Which versions are supported?
  a: OpenAPI 3.0 and 3.1 as well as Swagger 2.0. The overview writes down which one it found,
    and a Swagger 2 document's host, basePath and schemes are shown as the server.
- q: How deep does a schema go?
  a: Nested objects are expanded a couple of levels and then summarised as object, so one
    schema cannot flood the page. The shape is still clear, and the full definition is in
    the document you pasted.
---

Paste an OpenAPI or Swagger document and read it as a list of operations rather than as a wall of YAML. Each endpoint shows its method, its parameters, its request body and the responses it can return, with references resolved so a schema appears where it is used.

## Read the sample specification

The **Specification** box opens with a small Orders API in YAML. Click **Read specification**; **Overview** should show the title `Orders API`, a version, the server URL `https://api.example.com/v1` and `3` operations. The **Operations** list shows `GET /orders`, `POST /orders` and `GET /orders/{id}`, each with its **Parameters**, **Request body** and **Responses** tables. Type `orders/` into the **Filter** box and the list narrows to the paths that match.

A `$ref` inside the document is resolved so the referenced schema appears where it is used; a reference to another file is shown as a reference, because the tool never fetches anything. Paste a document with no `paths` key and it says so rather than showing an empty list. The format is detected from the text; set **Format** if the guess is wrong, or pick a `.json` or `.yaml` file with **File**.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [API Testing](/guides/api-testing/).
