---
title: YAML to TOML Guide
description: Convert YAML documents to TOML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: yaml-to-toml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Convert YAML to TOML, preserving nesting, arrays and types. TOML has no null, so a
  null value is reported rather than quietly dropped or turned into an empty string.
faq:
- q: What happens to a null value?
  a: TOML has no null type. This conversion cannot faithfully carry a YAML null across. In
    the current tool, a null field may be omitted **without an error**. Check the output,
    then decide whether the receiving program expects an absent field or a different explicit
    value.
- q: Does key order survive?
  a: Do not rely on key order alone to decide whether a conversion is correct. Check the resulting
    tables and values against the source and against what the receiving program expects.
---

YAML groups settings with indentation. TOML groups them with headings such as `[server]`. [YAML to TOML](/tools/yaml-to-toml/) reads the YAML values and writes TOML for programs that expect it.

## Move one group of settings

Paste this into **YAML**:

```yaml
title: Demo
server:
  port: 8080
```

In **TOML**, look for `title = "Demo"`, then `[server]` with `port = 8080` under it. The TOML heading takes the place of YAML's indentation under `server`. Use **Copy** if you need to paste the output into a configuration file.

## If the conversion fails

TOML requires a mapping (named values) at the top of the document. A YAML list by itself cannot become a complete TOML document in this tool. TOML also has **no null value**. **This tool can silently leave out a YAML field set to `null`**, so compare the output with the source. An omitted field and an empty string are not necessarily the same setting. Comments are not carried across by this data conversion.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
