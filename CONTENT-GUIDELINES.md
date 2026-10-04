# Content Guidelines

## Purpose

This document defines how content on **ilham.dev** should be written, structured, reviewed, and connected.

The goal is to keep the site useful, personal, technically accurate, and clearly authored by a real engineer.

Do not optimize for content volume.

---

## Content Types

ilham.dev uses three main content types:

```text
/posts/
/guides/
/tools/
```

### Posts

Posts are personal engineering writing.

A post should contain at least one of:

- a real problem
- debugging experience
- production issue
- experiment
- technical decision
- migration
- failure
- unexpected behavior
- benchmark
- measurement
- lesson learned
- architecture trade-off

Posts should answer:

> What happened, what did I investigate, what did I change, and what did I learn?

Do not fabricate personal experiences.

---

### Guides

Guides explain reusable knowledge.

See `GUIDE-GUIDELINES.md` for the two guide types: a short **tool guide**
attached to each tool, and a standalone **topic guide**.

Examples:

- Nginx configuration
- CORS debugging
- JWT debugging
- Linux commands
- Docker troubleshooting
- HTTP concepts
- database operations

A guide may be practical without containing a personal story.

---

### Tools

Tools are interactive utilities.

If a topic can be fully explained as:

```text
Enter input
Click button
Copy result
```

do not create a separate topic guide or blog post for it.

Every tool should still have a short tool guide walkthrough. See
`GUIDE-GUIDELINES.md`.

Tool pages should contain enough documentation to explain their purpose.

---

## Writing Style

Preferred tone:

- concise
- practical
- natural
- technical
- slightly casual
- first-person when appropriate
- easy to scan
- based on experience where relevant

Avoid corporate language such as:

```text
highly motivated
cutting-edge
seamless experience
powerful solution
revolutionary
robust ecosystem
```

Avoid repetitive AI-style phrases such as:

```text
handles the repetitive part
helps with the mechanical part
safe place to test the idea
then I review the output before relying on it
```

Do not give every article the same introduction structure.

---

## Titles

Avoid excessive use of:

```text
How I...
How I...
How I...
```

Use `How I` only when the article genuinely documents Ilham's workflow.

For guides, prefer:

```text
Understanding and Debugging JWTs
Debugging CORS Without Guessing
Nginx Reverse Proxy Configuration
Filtering Docker Logs
```

For posts, prefer titles connected to an actual story:

```text
The nginx setting that broke my WebSocket

Why MySQL was using 50 GB of RAM

A service was running but nothing could reach it
```

---

## Article Structure

Do not force every article into the same structure.

For personal posts, a useful pattern is:

```text
Problem
What I noticed
What I checked
What I initially suspected
What was actually happening
The fix
What changed
What I learned
```

Use only the sections that improve the article.

---

## Technical Accuracy

Technical claims must be checked.

When writing about:

- HTTP
- browsers
- security
- networking
- databases
- Linux
- cloud services
- specifications

prefer official documentation as a reference.

Examples:

```text
MDN
RFCs
nginx docs
Docker docs
Cloudflare docs
PostgreSQL docs
MySQL docs
Linux man pages
```

Do not invent commands, measurements, benchmark results, incidents, or statistics.

---

## References

Add a `References` section when it improves the article.

Keep it short.

Prefer primary sources.

Do not fill articles with references only for SEO.

---

## Internal Linking

Content should form this relationship:

```text
Tool ↔ Guide ↔ Post
```

Example:

```text
/tools/jwt-decoder/
        ↓
/guides/debugging-jwt/
        ↓
/posts/a-real-authentication-debugging-story/
```

When editing an article, check for useful links to:

- related tools
- related guides
- related posts

Do not add unrelated links just to increase internal-link count.

---

## Content Duplication

Before creating new content, search existing content.

Do not create several pages that explain nearly the same concept unless they serve clearly different purposes.

Prefer consolidation.

Example:

```text
JSON formatter
JSON prettifier
JSON minifier
JSON validator
```

may be better explained by one broader guide:

```text
/guides/working-with-json/
```

while individual utilities remain under `/tools/`.

---

## Dates

Preserve original publication dates.

When significantly updating content, use a modification date.

Do not make old articles appear newly published simply because they were moved or lightly edited.

---

## Tags

Prefer broad, meaningful tags:

```text
devops
linux
networking
security
web
database
storage
privacy
automation
```

Avoid creating large numbers of one-page tag archives.

---

## Rule for New Content

Before creating a new page:

```text
Is it interactive?
→ Tool

Is it reusable technical knowledge?
→ Guide

Is it based on a real experience, decision, failure, or experiment?
→ Post
```

One page may link to another, but do not duplicate the same content across all three.

---

# How These Documents Work Together

The repository keeps each concern in a separate document so there is one
canonical source for every rule. This file is the canonical source for
**content** (posts and guides).

```text
AGENTS.md
    ↓
Entry point: how agents and contributors should work here.

SITE-KNOWLEDGE.md
    ↓
High-level context: what ilham.dev is and what it should become.

CONTENT-GUIDELINES.md   (this file)
    ↓
What to write and how: posts, guides, titles, tone, accuracy, duplication.

GUIDE-GUIDELINES.md
    ↓
How to write guides, including the tool guide attached to each tool.

TOOLS-GUIDELINES.md
    ↓
How interactive utilities behave and are built.

TOOL-CATALOG.md
    ↓
Canonical metadata for every tool.

DESIGN-SYSTEM.md
    ↓
Visual and interaction consistency.

AI-COMPATIBILITY.md
    ↓
How the site stays understandable to agents and crawlers.

SEO-CHECKLIST.md
    ↓
Publishing, indexing and migration checks.

AI-COMPATIBILITY-CONTEXT.md
    ↓
Local implementation notes and status. Not a repository constraint.
```

All agents modifying ilham.dev should treat these documents as
repository-level constraints.

When instructions conflict, use the priority order defined in
`AGENTS.md` ("Decision Priority"). Do not maintain a second copy of that
priority list here.

Never sacrifice correctness or usability merely to improve SEO, AI
discoverability, or visual consistency.
