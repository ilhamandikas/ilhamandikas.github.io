---
title: .env Key Sorter Guide
description: Sort the keys in a .env file alphabetically, keeping each comment with its key
  and optionally dropping duplicates or aligning values.
date: '2026-09-27'
tags:
- text
tool_guide_slug: env-key-sorter
broader_guide:
  title: Working With Configuration Files
  url: /guides/configuration-files/
---

A **`.env` file** is a list of settings written as `KEY=value`. [`.env Key Sorter`](/tools/env-key-sorter/) sorts the recognizable keys in your browser without loading the configuration into an application.

## Sort three harmless settings

Replace **.env contents** with:

```text
PORT=3000
# Display theme
THEME=dark
APP_NAME=demo
```

With **Order** at **A → Z**, **Sorted** should put `APP_NAME` first, then `PORT`, then `# Display theme` above `THEME=dark`. That comment stays attached to the key following it. Switch **Order** to **Z → A** to reverse the key order. **Drop duplicate keys** keeps only the last occurrence of each key; review duplicates before relying on that rule. **Align values** inserts padding *before* the equals signs.

This tool does not parse the application's `.env` dialect or check whether the values work. Compare the output with the original before replacing a config file. Real `.env` files often contain passwords or API keys: use dummy values for a tutorial, avoid screenshots, and protect the downloaded or copied output.

## Where your input goes

Processing runs in your browser. The tool does not upload your input to ilham.dev.

## Questions you might have

### Does it change the values?

Without **Align values** and **Drop duplicate keys**, recognized key lines are moved as text. The tool removes blank lines. **Align values** adds spaces before `=`, and **Drop duplicate keys** removes earlier entries—either change may matter to a particular config loader.

### Which duplicate value wins?

When **Drop duplicate keys** is checked, this tool keeps the last matching entry (respecting **Ignore case**). Do not assume your application's loader handles duplicates in the same way.

### Is my file uploaded?

No. The file is read, sorted and written in the browser; nothing leaves the page.

### Does it understand export?

Yes. A line like export PORT=3000 is still recognised as the PORT key and keeps its export prefix.

## Related guide

For more background, read [Working With Configuration Files](/guides/configuration-files/).
