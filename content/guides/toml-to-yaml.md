---
title: TOML to YAML Guide
description: Convert TOML documents to YAML.
date: '2026-09-27'
tags:
- formats
tool_guide_slug: toml-to-yaml
broader_guide:
  title: Working With Structured Data
  url: /guides/working-with-structured-data/
about: Convert TOML to YAML, turning tables into nested mappings and arrays of tables into
  sequences. Handy when a tool wants YAML but the config is written in TOML.
faq:
- q: How are TOML dates represented?
  a: Date and time values need extra care because parsers may infer types differently. Check
    the actual YAML output and how the program that will read it treats that value; do not
    assume a date round-trips unchanged.
---

A TOML `[server]` heading groups the settings below it. YAML shows that grouping by indenting lines. [TOML to YAML](/tools/toml-to-yaml/) changes the format without deciding whether those settings are right for your application.

## See a table become indentation

Paste this into **TOML**:

```toml
title = "Demo"
[server]
port = 8080
```

In **YAML**, look for `title: Demo`, then `server:` with an indented `port: 8080` underneath. The number is still a number. If you change `[server]` to `[database]`, the group name in the YAML should change too. Use **Download** if you want a YAML file to inspect before using it elsewhere.

## What does not come along

Comments explaining why a TOML setting exists do not automatically survive conversion. Keep the original file until you have reviewed the new one. A date or time can also be written differently by the YAML writer; check how the receiving application reads it instead of assuming it keeps TOML's type rules.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Related guide

For more background, read [Working With Structured Data](/guides/working-with-structured-data/).
