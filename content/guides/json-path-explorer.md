---
title: JSON Path Explorer Guide
description: Evaluate JSONPath expressions against JSON, list every match with its path, and
  build expressions by clicking a tree.
date: '2026-09-27'
tags:
- data
tool_guide_slug: json-path-explorer
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

**JSONPath** is a way to select values from JSON using a path starting with `$`, the document's root. [JSON Path Explorer](/tools/json-path-explorer/) displays matches and a clickable tree; it does not query an API or change the JSON.

## Select two names

Replace **JSON** with `{"items":[{"name":"A"},{"name":"B"}]}` and set **JSONPath** to `$.items[*].name`. Click **Evaluate**. The summary should say **2 matches**, and the results should display `A` and `B` with their individual paths. `[*]` means “each item in this array.” **Copy result** copies a JSON array of values, `[
  "A",
  "B"
]`, rather than the on-screen path labels.

Under **Tree**, expand `items`, then click a **name** key to load its exact path into the input and see one value. If the result says **No matches**, check the JSON property names and array indices; a malformed document shows a **JSON error** instead. Everything is parsed locally, but avoid sharing JSON containing passwords or customer records just to demonstrate an expression.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### What does a JSONPath expression look like?

It starts at the root with $, then walks the document. A dot reads a key ($.store), a bracket reads an index or a quoted key ($.store.book[0], $['a key']), [*] is every item, .. searches at any depth, and [?(@.price < 10)] filters. You can mix them, for example $..book[?(@.price < 10)].title.

### Why does clicking a key change my expression?

That is the explorer part: each key in the tree carries the path that reaches it, and clicking it loads that path so you can see it work, then extend it by hand. It is a way to build a long path without counting brackets.

### Are filters and recursive search supported?

Yes. The vendored engine supports recursive descent (..), wildcards ([*]), array and object unions, slices ([1:3]), and filter expressions with comparisons such as ==, !=, <, <=, > and >=. If an expression is not valid, the status line says so rather than showing a wrong result.

### What does the path in the results mean?

It is the canonical JSONPath that reaches that match, always written with brackets. It is useful when you want to copy one exact location out of a large document, or reuse it in another tool that takes a JSONPath.

### Is my JSON uploaded?

No. Parsing, matching and the tree all run in your browser, and nothing is sent to a server.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
