---
title: YAML to JSON Guide
description: Convert YAML documents to JSON.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: yaml-to-json
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Convert YAML to JSON, preserving nesting, arrays and types. Anchors and aliases are
  resolved, so the output is the effective document rather than the shorthand used to write
  it.
faq:
- q: What happens to a non-string key?
  a: JSON requires string keys, so numeric and boolean keys are converted to their string
    form. That is a real difference between the two formats, not a bug.
- q: Are duplicate keys allowed?
  a: No. YAML permits them but almost every parser takes the last one silently, which hides
    mistakes. This tool reports them instead.
---

YAML and JSON are two ways to write structured data. Both can hold names, values, and lists. YAML uses indentation to show what belongs together; JSON uses braces and square brackets. [YAML to JSON](/tools/yaml-to-json/) translates between those forms.

## Convert a short list

Open the tool and paste this into **YAML**:

```yaml
name: Ana
tags:
  - editor
  - reader
```

The **JSON** box should show:

```json
{
  "name": "Ana",
  "tags": [
    "editor",
    "reader"
  ]
}
```

The two spaces before each `-` in YAML put `editor` and `reader` under `tags`. In JSON, square brackets `[ ]` show they form a list. The data is still there even though the punctuation looks different. Use **Copy** if you need to paste the JSON into another program.

## If the result is missing or wrong

Check the indentation: a line at the wrong level can change which item it belongs to. If parsing fails, read the error near the input before changing several lines at once. A successful conversion only means the file could be read; it does not prove the receiving application accepts those field names or values.

YAML has features JSON cannot keep exactly, such as comments and aliases. Keep the original YAML if you need those later. Review the converted result before replacing a configuration file.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
