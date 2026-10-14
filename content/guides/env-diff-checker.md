---
title: .env Diff Checker Guide
description: Read configuration differences between staging and production without copying secret values into a report.
date: 2026-10-14
tags:
- devops
- privacy
tool_guide_slug: env-diff-checker
about: Compare two sets of single-line environment assignments by key and literal value. Results distinguish missing keys from empty values, and values are hidden until explicitly revealed.
faq:
- q: Does this tool save or upload my .env files?
  a: Inputs are processed in the browser and are not uploaded or saved by the tool. Pasted input text remains visible; result values are hidden by default.
- q: Does it expand variables or understand every dotenv format?
  a: No. It supports single-line KEY=value assignments, optional export prefixes, comments, and outer single or double quotes. Variable references and escapes remain literal. Multiline values, duplicate keys, and unsupported syntax produce an error rather than a guessed result.
- q: Does the copied report contain secrets?
  a: The report contains only key names and comparison statuses, never values, even when result values are revealed. Key names may still disclose configuration details, so review the report before sharing.
---

A deployment can have the right variable names but the wrong values—or a missing variable that looks like an intentionally empty one. Use the [.env Diff Checker](/tools/env-diff-checker/) to tell those cases apart.

## Compare a baseline with a target

Put staging on the left:

```dotenv
APP_ENV=staging
PORT=3000
DEBUG=true
API_TOKEN=
```

Put production on the right:

```dotenv
APP_ENV=production
PORT=3000
CACHE_ENABLED=true
API_TOKEN="example-only"
```

The result means:

- **Changed:** `APP_ENV` and `API_TOKEN` exist on both sides but have different literal values. `API_TOKEN` is empty on the left, not missing.
- **Only left:** `DEBUG` is absent from production. That might be intentional; the tool cannot decide.
- **Only right:** `CACHE_ENABLED` exists only in production.
- **Same:** `PORT` has the same value. Enable **Include unchanged keys** to see it.

Hidden values still participate in the comparison. **Reveal result values** displays them on screen, so avoid using it during screen sharing. Quoted values are displayed as JSON strings so spaces are visible. Copying the key-only report never includes values.

## Literal comparison, not a deployment check

`PORT=3000` and `PORT="3000"` compare equal because the outer quotes are removed. Keys are case-sensitive. Comments outside quoted values begin at `#`; quote values that need a literal hash character.

The tool does not expand `${HOST}`, execute commands, decode escape sequences, or inspect the environment actually loaded by an application. For example, `A='${HOST}'` and `A="${HOST}"` compare equal here even though a particular runtime might interpret them differently. Different dotenv loaders have different rules; this comparison is not proof that two deployments behave identically.

An error identifies the side and line number without echoing its contents. Resolve duplicate keys, move multiline values out of the comparison, and use plain single-line assignments. Input remains in place after an error.

Inputs are not stored by the tool. Use **Clear** to remove the pasted text and results from the page. For ordering a file rather than comparing two configurations, use the [.env Key Sorter](/tools/env-key-sorter/).
