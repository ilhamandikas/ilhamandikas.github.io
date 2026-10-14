---
title: Log Redactor Guide
description: Remove common sensitive patterns from a log, add exact-text replacements, and review what automated detection cannot catch.
date: 2026-10-14
tags:
- privacy
- security
- devops
tool_guide_slug: log-redactor
about: Replace common sensitive patterns with a fixed [REDACTED] marker before sharing log text. Patterns include sensitive-field lines, PEM private keys, URL credentials, JWT-like tokens, common email forms, IPv4, and IPv6. Add case-sensitive exact text for values the automatic patterns miss. Input processing stays in the browser without tool storage or upload.
faq:
- q: Does the tool guarantee that no secrets remain?
  a: No. Detection is best-effort and can miss secrets, encoded values, unusual field names, multiline structures, and personal data. Review the output manually before copying or downloading it.
- q: Why did it remove the rest of a line or the remaining log?
  a: A recognized sensitive assignment hides the rest of its line. If its value is missing, starts with an object or array, or has an unclosed quote, the remaining log is hidden conservatively. An unclosed PEM private-key block also hides the remaining log. This can remove harmless context and break JSON syntax.
- q: Are the original logs stored or uploaded?
  a: The tool does not upload or save log text or exact-text entries. Originals remain visible in the input area until cleared. Only the redacted preview is used by the copy and download actions.
- q: Does exact-text matching support regex or ignore case?
  a: Neither. Each non-empty line is a case-sensitive literal match, with spaces preserved. Entries need at least three characters. There can be at most 100 distinct entries and 10,000 characters in the list.
---

A debugging log can contain the useful error and a credential on the same line. The [Log Redactor](/tools/log-redactor/) produces a separate preview so you can remove common sensitive patterns without editing the original text in place.

## Read a small example

With the default patterns selected, paste:

```text
Authorization: Bearer example-token-do-not-use
DB_PASSWORD=example-password
Contact user@example.com from 192.0.2.10
Host internal.example.com returned status=502
```

Add `internal.example.com` to the exact-text list. The result is:

```text
Authorization: [REDACTED]
DB_PASSWORD=[REDACTED]
Contact [REDACTED] from [REDACTED]
Host [REDACTED] returned status=502
```

The status code remains useful, while the selected identifiers are removed. The marker is fixed: matching values are not hashed, numbered, or partially revealed. You cannot use repeated markers to determine which original values were equal.

## Why sensitive fields remove more context

Sensitive-field detection recognizes names such as `authorization`, `cookie`, `password`, `access_token`, `client_secret`, and `api_key`, along with common prefixed or camelCase variants. It looks for a colon or equals assignment. It is not a complete schema-aware parser.

Once a sensitive assignment is found, the rest of that line is removed. For example:

```text
request password=example-only status=500
```

becomes:

```text
request password=[REDACTED]
```

That deliberately removes `status=500` too. It avoids guessing whether spaces, commas, or quotes belong to a secret. JSON and logfmt output may no longer be parseable; use this for reviewed excerpts, not as a lossless log-processing pipeline.

Missing or unfinished quoted values, object or array values under sensitive names, and unfinished private-key blocks can cause the entire remaining log to be hidden. The result status calls this out. Arbitrary multiline continuations and nested structures are not otherwise guaranteed to be understood.

## Choose patterns for the report

- **URL credentials** masks the user-info portion before `@` in a `scheme://user:password@host` form. It does not interpret every database connection-string format or arbitrary query parameter.
- **JWT-like tokens** detects common compact three-part tokens whose header begins with `eyJ`. It does not verify signatures, and does not cover every JWT, encrypted JWE, or opaque token.
- **Email** targets common ASCII address forms. Quoted local parts and internationalized addresses are not comprehensively handled.
- **IPv4 and IPv6** hide address patterns, including IPv4-mapped IPv6 and scoped IPv6 forms. Version numbers and other address-like text may also be removed. IP options do not find hostnames.
- **Exact text** handles internal hostnames, customer references, opaque secrets, and other known values. Matching is case-sensitive; add each spelling you need removed.

Pattern matches can overlap. For example, URL user-info can also look like an email address. Counts describe detections by category, not unique secrets or a guarantee of coverage. Overlapping spans are replaced by a single marker, sometimes removing more of a URL than the credentials alone.

Changing the input, exact-text list, or selected patterns clears the previous preview and disables copying until you redact again. **Load example** only works when both inputs are empty, so it does not overwrite a pasted log.

## Before sharing

Check the preview for internal hostnames, names, customer IDs, filesystem paths, request bodies, custom headers, encoded payloads, and secrets under unexpected names. A **No selected patterns matched** result means only that the selected detectors found nothing.

Keep only the excerpt needed to explain the problem. If a real credential was already exposed, redacting a later copy does not revoke it or remove copies from other systems; follow the appropriate rotation or revocation procedure.

The original log remains visible in the page. **Copy redacted output** and **Download redacted.log** use only the preview, but you must still review it. **Clear** removes the original, exact-text entries, and output without changing the selected pattern options.

For a larger workflow, [Docker Logs Grep](/tools/docker-logs-grep/) can narrow an excerpt before redaction, and [Log Parser](/tools/log-parser/) can help inspect structured source logs. Redacted output is not guaranteed to retain the structure those tools expect.
