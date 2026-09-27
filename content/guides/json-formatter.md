---
title: JSON Formatter Guide
description: Validate, pretty-print and minify JSON, with optional key sorting.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: json-formatter
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
---

JSON is text that stores information as names and values. In `"name":"Ana"`, `name` is the name of a piece of information, and `Ana` is its value. Long JSON is hard to read when everything sits on one line. [JSON Formatter](/tools/json-formatter/) adds spacing so you can see what belongs where.

## Try one small example

1. Open the tool and paste this into **Input JSON**:

   ```json
   {"user":{"name":"Ana","active":true},"roles":["editor","reader"]}
   ```

2. Leave **Indent** at `2` and choose **Format**. Look in **Output**. You should see:

   ```json
   {
     "user": {
       "name": "Ana",
       "active": true
     },
     "roles": [
       "editor",
       "reader"
     ]
   }
   ```

The braces `{ }` group names and values together. The square brackets `[ ]` hold a list: here, two roles. The spaces and new lines help you read the data; the values have not changed.

## Try the other controls

Choose **Minify** to put the same data back on one line. This removes extra spacing, not the names or values. Turn on key sorting to arrange names inside an object; the order of the two roles in the list should stay the same. Use **Copy** to take the result elsewhere.

## If it says the JSON is invalid

Try pasting `{name:"Ana"}`. This will fail because JSON needs quotes around a name such as `"name"`. Fix it to `{"name":"Ana"}` and format it again. Keep the input visible while fixing an error; you do not need to start from scratch.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## What to watch for

- Sorting only changes object keys
- Array order is preserved

## Questions you might have

### Does sorting also reorder arrays?

No, and that is deliberate. Only object keys are reordered. Array order is data, so changing it would change the meaning of the document.

### What is the difference between this and the JSON Viewer?

This one gives you text you can copy and paste. The viewer renders a collapsible tree, which is better for finding your way around a document whose shape you do not know yet.

### Is my data uploaded anywhere?

No. Parsing happens locally with JSON.parse and nothing leaves the browser.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
