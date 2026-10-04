# Guide Guidelines

This document defines how guides on **ilham.dev** are written, structured,
and connected.

The goal is simple:

> A guide should teach the reusable knowledge behind a tool or topic, so a
> reader can understand the result instead of only copying it.

Guides are not a second copy of a tool page, and they are not blog posts.
For tone, title rules, technical accuracy, references, and duplication, see
`CONTENT-GUIDELINES.md`; this file covers what is specific to guides.

---

## Guide Types

There are two kinds of guides.

### Tool guide

A short walkthrough attached to exactly one tool.

- One per tool.
- Explains how to read the tool's result on a small, real example.
- Links back to the tool at the start.
- Optional `broader_guide` link for more background.

Example:

```text
/tools/ipv4-subnet-calculator/
        ↓
/guides/ipv4-subnet-calculator/
        ↓
/guides/network-debugging/   (broader guide)
```

### Topic guide

A standalone explanation of reusable technical knowledge, not tied to a
single tool.

Examples:

```text
/guides/debugging-cors/
/guides/network-debugging/
/guides/docker-basics/
```

A topic guide may link to several related tools.

---

## Every Tool Gets a Tool Guide

Every tool on ilham.dev should have a tool guide.

This is different from a topic guide or a post. Do not create a new topic
guide or blog post for every tool. Do create the walkthrough guide.

The tool page must still be usable on its own. The guide adds explanation,
not a required step.

---

## Front Matter

### Tool guide

```yaml
---
title: IPv4 Subnet Calculator Guide
description: Work out the network, broadcast, mask and host range for a CIDR block.
date: '2026-09-27'
tags:
- network
tool_guide_slug: ipv4-subnet-calculator
broader_guide:
  title: Network Debugging Notes
  url: /guides/network-debugging/
about: >-
  Given an address and a prefix length, work out the network address,
  broadcast address, netmask and usable host range.
faq:
- q: Why is the usable host count two less than the total?
  a: The first address is the network address and the last is broadcast, so the
    tool subtracts two. `/31` and `/32` are special cases.
---
```

- `tool_guide_slug` must match the tool's slug under `/tools/`.
- `broader_guide` is optional; use it only when a real topic guide exists.
- `title` is the tool name plus `Guide`.
- `about` is the short "About this tool" paragraph.
- `faq` is the "Questions" list. It is the single source rendered on the tool
  page, the guide page, the machine-readable registry (`tools.json`), and the
  `FAQPage` structured data. Do not repeat it in the guide body.

### Topic guide

```yaml
---
title: Debugging CORS Without Guessing
description: A practical way to reason about CORS errors, preflight requests,
  credentials, and browser behavior.
date: '2026-09-27'
tags:
- web
---
```

- Use an explanatory title, not "How I...".
- Add `aliases` only when merging or moving older content.

Keep `date` as the original publication date. Do not republish old content
by changing the date.

---

## Structure of a Tool Guide

A useful tool guide follows roughly this shape. Use only the parts that help.

```text
What the concept is, in one or two sentences
Link to the tool
A small worked example with real values
What each result field means
What to do when input is invalid
Where the input is processed (privacy)
Related broader guide, if any
```

The `about` and `faq` fields render the About and Questions blocks, so the
guide body itself should not repeat them.

Good practices:

- Use one small example a reader can retype.
- Explain why a result can differ from the input (for example, a subnet
  network address).
- State limitations plainly. Do not imply a tool makes deployment decisions.
- Keep privacy language factual. Refer to the tool's processing model rather
  than inventing a guarantee.

---

## Structure of a Topic Guide

Topic guides are free-form. Prefer sections that answer a real workflow:

```text
What the problem or concept is
What to check first
How to reason about it
Common mistakes
Related tools
References (when useful)
```

Do not force every guide into the same template.

---

## Relationships

Keep the relationship useful:

```text
Tool ↔ Guide ↔ Post
```

- A tool guide links to its tool and, when present, its broader guide.
- A topic guide links to the tools it explains.
- Link a post only when it genuinely adds experience the guide does not.
- Do not list tools merely because they share a category.
- No related link is better than an irrelevant one.

---

## Avoid Duplication

A tool guide must not repeat the tool page's labels and buttons verbatim.
It should add understanding: what the output means, when to be careful, and
how it connects to a larger task.

Before writing, search existing guides, posts, and tools. If a concept is
already explained well, link it instead of restating it.

---

## Technical Accuracy

Follow `CONTENT-GUIDELINES.md`:

- Check claims against primary sources (MDN, RFCs, official docs, man pages).
- Use safe examples such as `192.168.1.10`, `example.com`, `user@example.com`.
- Never invent commands, measurements, benchmarks, incidents, or statistics.

---

## Definition of Done

- [ ] Front matter is valid and matches the guide type.
- [ ] A tool guide's `tool_guide_slug` matches an existing tool.
- [ ] The tool is linked near the top.
- [ ] The guide works on a 320px-wide screen.
- [ ] Code and values do not overflow horizontally.
- [ ] Privacy/processing language matches the tool's actual model.
- [ ] Related tools and broader guides are genuinely relevant.
- [ ] No duplicated explanation from another page.
- [ ] References are primary and short, when included.
- [ ] The guide is understandable without reading the tool page first.
