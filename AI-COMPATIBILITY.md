# AI Compatibility

This document defines how **ilham.dev** stays understandable to AI agents,
crawlers, and retrieval systems.

It is a repository constraint, not a status report. For the current
implementation notes and validation results, see `AI-COMPATIBILITY-CONTEXT.md`.

## Purpose

ilham.dev should be understandable not only to human visitors but also to:

- search engines
- AI assistants
- autonomous agents
- documentation crawlers
- retrieval systems

Human readability remains the priority.

Do not damage normal UX solely for AI compatibility.

---

## Principle

AI compatibility should come from clean site architecture and semantic content.

Do not depend on a single special file.

The most important signals are:

```text
stable URLs
semantic HTML
clear headings
descriptive titles
plain-text explanations
internal links
structured metadata
sitemaps
consistent content types
```

---

## Content Architecture

Agents should be able to distinguish:

```text
/tools/
```

Interactive actions.

```text
/guides/
```

Reusable technical knowledge.

```text
/posts/
```

Personal engineering experience.

Do not mix these concepts unnecessarily.

---

## `llms.txt`

The site may expose:

```text
/llms.txt
```

Use it as an additional discovery mechanism.

Do not assume every AI crawler supports it.

`llms.txt` should provide concise links to important areas such as:

```text
About
Tools
Guides
Posts
Tool index
Guide index
```

Keep it machine-readable and easy to maintain.

---

## Semantic HTML

Use real semantic elements when appropriate:

```html
<header>
<nav>
<main>
<article>
<section>
<footer>
```

Use proper heading hierarchy:

```text
H1
  H2
    H3
```

Avoid using visual styling alone to represent document structure.

---

## Descriptions

Every page should make its purpose obvious from plain text.

Bad:

```text
JWT Decoder
```

Better:

```text
Decode the header and payload of a JSON Web Token directly in your browser.
```

Agents should not have to infer functionality solely from JavaScript.

---

## Tool Metadata

Where practical, expose structured metadata for tools.

Useful fields include:

```text
name
description
category
keywords
input type
output type
processing model
requires network
related guide
```

See `TOOL-CATALOG.md` for the canonical field definitions.

Do not expose private implementation details unnecessarily.

---

## Structured Data

Use structured data where appropriate.

Examples:

```text
Article
BlogPosting
BreadcrumbList
Person
WebSite
```

Only declare schema that accurately describes the page.

Do not add misleading structured data to chase rich results.

---

## Stable Content

Important information should exist in rendered or server/static HTML when possible.

Do not make essential explanations available only after JavaScript interaction.

---

## URLs

Use stable, descriptive URLs.

Good:

```text
/guides/debugging-cors/
/tools/cidr-calculator/
```

Avoid arbitrary identifiers when readable slugs are possible.

---

## Agent-Friendly Content

When explaining a technical concept:

- define important terms
- provide examples
- state assumptions
- clearly distinguish input and output
- explain limitations
- mention important edge cases

This improves both human understanding and retrieval quality.

---

## No Artificial AI Content

Do not create pages solely to attract AI crawlers.

Do not generate:

- keyword lists disguised as articles
- duplicated explanations
- hundreds of near-identical pages
- fake FAQ sections
- fake statistics

The site's authority should come from useful content.
