---
title: YAML Viewer Guide
description: Validate and explore a YAML document.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: yaml-viewer
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: A collapsible tree view of a YAML document, showing the structure and the value counts
  on each branch. Anchors and aliases are resolved, so you see the effective document rather
  than the shorthand.
faq:
- q: Are YAML anchors expanded?
  a: Yes, which means the tree shows what the document means rather than how it was written.
    That is usually what you want, but it does hide where the reuse came from.
---

YAML is text that uses **indentation** to show what belongs inside what. [YAML Viewer](/tools/yaml-viewer/) turns it into a tree you can open one part at a time. It is for reading, not changing the file.

## See what belongs under a name

Paste this into **YAML**:

```yaml
service:
  name: api
  enabled: true
ports:
  - 80
  - 443
```

You should see `service` and `ports` in **Tree**. Open `service` to find `name: api` and `enabled: true`. Open `ports` to see its two list items, `80` and `443`. The two-space indentation under `service` is why `name` and `enabled` appear inside it.

Change the indentation or remove a colon to see how structure or parsing can change. If the status shows an error, check the line it mentions before editing the rest. **Parsed** means the tool could read the YAML; it does not check whether `service` or `ports` are valid settings for your application.

This page processes the text in your browser. Configuration files can still contain secrets, so check a file before pasting its contents into a screenshot or sharing it elsewhere.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
