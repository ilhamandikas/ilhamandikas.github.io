# Site Knowledge

This document explains what **ilham.dev** is, what it is trying to become, and how contributors or AI agents should reason about changes.

It is the high-level context for the entire repository.

Read this before making significant changes to content, structure, tools, navigation, metadata, or design.

---

# What ilham.dev Is

**ilham.dev** is a personal engineering website by Ilham Andika.

The site combines:

```text
personal engineering writing
technical guides
interactive tools
```

The website should not feel like:

```text
a generic portfolio
a SaaS landing page
a content farm
an SEO site
a random utility directory
an AI-generated knowledge base
```

It should feel like:

> A personal engineering site built by someone who actually runs systems, debugs infrastructure, and builds useful tools for problems they encounter.

---

# Core Identity

The strongest topics around ilham.dev are:

```text
Linux
servers
containers
networking
deployments
infrastructure
backend systems
databases
automation
self-hosting
debugging
developer tools
```

Other useful topics may exist, but the engineering identity should remain obvious.

The site may contain general-purpose tools.

Those tools should complement the site's identity rather than completely replace it.

---

# Primary Principle

The core philosophy is:

> Build things that are understandable, useful, and easy to troubleshoot.

Prefer simple systems over unnecessary complexity.

Prefer explicit behavior over magic.

Prefer maintainability over cleverness.

Prefer a small dependable solution over an impressive but fragile one.

---

# Site Structure

The primary sections are:

```text
/
/about/
/posts/
/guides/
/tools/
```

Other technical paths may exist, but these are the important conceptual sections.

---

# Homepage

The homepage introduces:

```text
Ilham
what he works on
what the site contains
```

The homepage should not become a giant tool directory.

Tools may be featured, but visitors should still understand that the site belongs to a real person and reflects real engineering work.

A visitor should quickly understand:

```text
Who is Ilham?

What does he work with?

What can I find here?
```

---

# About

`/about/` explains who Ilham is and what he works on.

Keep it:

- short
- natural
- personal
- concrete
- understandable

Avoid generic CV language.

Do not write:

```text
highly motivated engineer
passionate technology enthusiast
results-driven professional
innovative problem solver
```

unless there is a specific reason.

The page should sound like a person, not a recruiter template.

---

# Posts

`/posts/` contains personal engineering writing.

Posts are for:

```text
real incidents
debugging stories
experiments
technical decisions
migrations
failures
trade-offs
measurements
lessons learned
```

Posts should contain something that happened, changed, broke, surprised, or taught something.

Examples of the intended style:

```text
Why the comments live on GitHub

Running real services on a small VPS

Why this site is a static site

The nginx setting that broke my WebSocket

Why MySQL was using 50 GB of RAM

What 280,000 small files taught me about object storage
```

Do not create posts simply because a new tool exists.

---

# Guides

`/guides/` contains reusable technical knowledge.

Examples:

```text
debugging CORS
understanding JWT
nginx reverse proxy configuration
Docker logs
Linux disk usage
HTTP headers
database troubleshooting
```

Guides may be technical and practical without containing personal stories.

A guide should help someone solve or understand a repeatable problem.

---

# Tools

`/tools/` contains interactive utilities.

Examples:

```text
JWT Decoder
JSON Formatter
CIDR Calculator
Timestamp Converter
Image Metadata Viewer
```

Tools should be:

```text
fast
focused
predictable
privacy-conscious
easy to understand
```

A simple utility should remain simple.

Do not turn every tool into a mini product.

---

# Relationship Between Content Types

The intended relationship is:

```text
Tool
  ↕
Guide
  ↕
Post
```

Example:

```text
/tools/cidr-calculator/
        ↓
/guides/understanding-cidr/
        ↓
/posts/debugging-a-real-networking-problem/
```

Each layer serves a different purpose.

---

# Tool

Answers:

> Can you help me do this?

---

# Guide

Answers:

> How does this work, and how should I reason about it?

---

# Post

Answers:

> What happened when I dealt with this in the real world?

---

# Content Should Not Be Duplicated

Do not copy the same explanation across:

```text
tool
guide
post
```

Instead:

- tool provides the utility
- guide explains the concept
- post provides real-world context

Use links between them.

---

# Audience

The site is useful for:

```text
developers
DevOps engineers
sysadmins
backend engineers
technical users
people debugging infrastructure
people looking for small practical utilities
```

Some tools may also serve non-technical users.

Do not make the entire site less technical merely to broaden its audience.

Clarity is more important than simplification.

---

# Tone

Preferred tone:

```text
casual
concise
technical
practical
calm
direct
human
```

Avoid sounding overly formal.

Avoid excessive enthusiasm.

Avoid marketing copy.

Avoid sounding like a textbook unless the subject requires it.

---

# Writing Voice

Where personal experience is involved, first person is encouraged.

Example:

```text
I initially thought the problem was nginx.

It turned out the service was only listening on IPv6 loopback.
```

This is better than:

```text
One may encounter an issue where a service is inaccessible due to an incorrect bind address.
```

Personal posts should sound personal.

Guides can be more neutral.

---

# Things the Site Values

## Understandability

A visitor should be able to understand what a page does without guessing.

## Transparency

Explain important behavior.

Especially:

```text
network requests
local processing
data storage
external APIs
limitations
```

## Practicality

Prefer examples people can actually use.

## Technical accuracy

Do not simplify technical information until it becomes incorrect.

## Speed

Keep the static-site advantage.

Avoid unnecessary client-side complexity.

## Privacy

Prefer browser-side processing where practical.

## Independence

Avoid unnecessary dependencies on third-party services.

---

# Things the Site Avoids

Avoid:

```text
forced account creation
unnecessary backend processing
bloated JavaScript
tracking user input
SEO keyword stuffing
fake engagement features
fake statistics
fake personal stories
content generated only to increase page count
```

---

# Static Site Philosophy

The static architecture is intentional.

Do not introduce server-side infrastructure without a strong reason.

Before adding a backend, ask:

```text
Can this be done in the browser?

Can this be generated at build time?

Can a static data file solve it?

Is a backend genuinely required?
```

The answer may sometimes be yes.

But backend infrastructure should not be the default.

---

# Dependency Philosophy

Avoid dependencies that provide little value.

Before adding a library:

```text
Can native browser APIs do this?

Is the package maintained?

How large is it?

Does it create network dependencies?

Does it introduce security risk?

Does it complicate future maintenance?
```

Reuse existing project dependencies when appropriate.

---

# Privacy Philosophy

Privacy claims must be specific and technically true.

Prefer:

```text
Processed locally in your browser.
```

over:

```text
100% private.
```

Prefer:

```text
This tool does not upload the selected file.
```

over:

```text
Your files are completely safe.
```

Do not promise more than the implementation guarantees.

---

# Search and AI Compatibility

ilham.dev should be easy for:

```text
humans
search engines
AI assistants
retrieval systems
agents
```

to understand.

Achieve this through:

```text
clean HTML
clear content structure
stable URLs
useful titles
semantic headings
metadata
internal linking
machine-readable catalogs
sitemaps
```

Do not create content specifically to manipulate AI crawlers.

---

# llms.txt

`llms.txt` may exist as an additional discovery mechanism.

It is not the foundation of AI compatibility.

The actual content structure remains more important.

---

# URL Philosophy

URLs should be:

```text
short
stable
descriptive
predictable
```

Good:

```text
/tools/cidr-calculator/
/guides/debugging-cors/
/posts/why-comments-live-on-github/
```

Avoid changing URLs simply because a title was improved.

When URLs must change, use redirects.

---

# Content Migration

When moving content between sections:

Example:

```text
/posts/debugging-jwt/
        ↓
/guides/debugging-jwt/
```

ensure:

```text
redirect
canonical
sitemap
internal links
related content
```

are updated.

Do not silently break old URLs.

---

# Dates

Publication date represents when the content was originally published.

Modification date represents meaningful later changes.

Do not reset publish dates to make old content appear new.

---

# Tags and Categories

Keep taxonomy simple.

Broad categories are better than hundreds of tiny tags.

Good examples:

```text
linux
networking
devops
database
security
storage
privacy
automation
```

Avoid category fragmentation.

---

# Navigation Philosophy

Main navigation should stay simple.

Conceptually:

```text
About
Posts
Guides
Tools
```

Do not add every category to the primary navigation.

Complexity belongs inside sections, not in the main header.

---

# Design Philosophy

The interface should feel:

```text
minimal
technical
calm
fast
consistent
```

Avoid:

```text
large marketing heroes
excessive gradients
decorative dashboards
unnecessary animation
floating widgets everywhere
```

The site is not trying to imitate a startup homepage.

---

# Tool Interface Philosophy

A user should reach the useful part of a tool quickly.

Do not place several paragraphs above a simple input form.

Tool pages should emphasize:

```text
input
action
result
```

and then supporting explanations.

---

# Search

Tool search is an important navigation mechanism.

Tool metadata should support:

```text
names
aliases
technical terminology
common synonyms
categories
```

Search should help users who know what problem they have but not necessarily the exact tool name.

## Search Companion

The floating paperclip on every page is a presentation layer for search, not a chatbot.

It must stay:

```text
decorative
quiet
fast
optional
```

Rules:

```text
no sound
no self-initiated messages after being hidden
no search terms or page text stored or sent
only presentation preferences in localStorage (ilham-search-companion-v1)
only public quotes, fetched from a fixed endpoint, in mascot-quotes.js
respect prefers-reduced-motion
schedule animation frames only while moving or settling
```

Behavior lives in `assets/js/search-mascot.js`; an idle page must schedule no animation frames.

Idle expression stays subtle and optional: after a while the eyelids droop
(`drowsy`), and after longer stillness it dozes. A small hop may play now and then
after the page has been still, and scrolling pulls the gaze down or up before it
eases back to the pointer. These are decorative expressions and reactions, not
conversation. Hops and gaze animation are disabled under `prefers-reduced-motion`;
static sleepy expressions remain available.

Do not turn it into an assistant that reads content, remembers searches, or starts conversations.

On tool pages that have a guide, the companion names the current tool in a short
invitation and offers a `Show me the steps` link *inside its bubble*, pointing at
`/guides/<slug>/`. The tool name comes from the public page title, not user input;
it is not stored or sent anywhere. Five invitation variants are chosen on page
load, excluding the previous variant within the same tab. Only the variant index
is kept in sessionStorage (`ilham-companion-invitation-v1`), never the tool title
or user input. Wording stays stable while the page is open. It reads as a natural invitation
rather than a separate chip, appears as part of the idle rotation, and stays put
while hovered or focused so the anchor is never pulled out from under the pointer.
It is a real anchor (keyboard reachable) and is hidden whenever the companion is
tucked or dragging. It only appears when Hugo found a matching entry in
`data/tool-guide-links.yaml`; the page should still render its own `Learn` section,
so the bubble is a second signpost, not a replacement.

Reading a post aloud is a separate, opt-in control owned by the post layout
(`assets/js/read-aloud.js`), built on the browser's speech synthesis. It is not part
of the companion and must not become a companion behavior.

---

# Real Experience Is Valuable

One of the site's strongest differentiators is real engineering experience.

Generic technical knowledge is widely available.

What is harder to reproduce is:

```text
what actually broke
what was investigated
what assumptions were wrong
what fixed it
what changed afterward
```

When real experience exists, preserve those details.

Do not rewrite personal field notes into generic tutorials.

---

# Examples of Valuable Real-World Topics

Real experiences may include subjects such as:

```text
a server reaching 100% disk usage
nginx breaking WebSockets
IPv4 / IPv6 bind problems
MySQL memory pressure
replication failures
object storage migrations
hundreds of thousands of small files
backup performance
reverse proxy issues
container deployment
database recovery
```

Only create a personal post when the details are based on actual information.

Never fabricate incidents.

---

# Avoid AI-Looking Content

Warning signs:

```text
many articles with identical structure
many titles beginning with the same phrase
generic introductions
repeated conclusion templates
excessive bullet lists
articles created only because a keyword exists
```

Content should vary naturally according to the subject.

---

# Existing Content Is Context

Before creating something new, search the existing repository.

Check:

```text
Does this tool already exist?

Is there already a guide?

Is there an article covering the same subject?

Is this functionality already part of another tool?

Can existing content be improved instead?
```

Prefer improvement over duplication.

---

# Agent Behavior

An AI agent working on ilham.dev should first understand the existing project.

Before making substantial changes:

1. Read relevant repository documentation.
2. Inspect existing patterns.
3. Search for similar files.
4. Reuse existing components.
5. Preserve established URLs.
6. Avoid changing unrelated areas.
7. Avoid mass-rewriting content unless requested.
8. Validate claims before introducing them.

---

# Repository Documentation

Important documents may include:

```text
AGENTS.md
SITE-KNOWLEDGE.md
CONTENT-GUIDELINES.md
GUIDE-GUIDELINES.md
TOOLS-GUIDELINES.md
TOOL-CATALOG.md
AI-COMPATIBILITY.md
SEO-CHECKLIST.md
DESIGN-SYSTEM.md
```

Agents should read the relevant documents before implementing changes.

---

# Documentation Priority

If instructions appear to conflict, use the single priority order defined in
`AGENTS.md` (section "Decision Priority"). Do not maintain a second copy
here.

---

# Do Not Invent Context

Agents must not invent:

```text
personal experiences
company information
production incidents
performance numbers
user statistics
benchmarks
technical architecture
privacy guarantees
```

If information is unknown, either:

```text
leave it out
mark it for review
derive it from existing repository evidence
```

Do not guess.

---

# Personal Information

Do not publish sensitive operational information merely because it exists elsewhere in the repository.

Before exposing technical details publicly, consider whether they contain:

```text
credentials
internal IP addresses
private hostnames
tokens
customer data
database details
security-sensitive infrastructure
```

Examples in public content should be sanitized.

---

# Operational Examples

Prefer safe examples such as:

```text
192.168.1.10
10.0.0.5
example.com
user@example.com
```

instead of production values.

---

# Feature Decision Framework

When considering a new feature, ask:

```text
Does this solve a real problem?

Does it fit ilham.dev?

Can it be implemented simply?

Does a similar feature already exist?

Does it require a backend?

Does it introduce privacy concerns?

Will it still be maintainable later?
```

A feature does not need to exist simply because it is possible.

---

# Content Decision Framework

When considering new content:

```text
Is this primarily an interactive action?
→ Tool

Is this reusable technical knowledge?
→ Guide

Is this based on a real experience?
→ Post
```

Do not create all three automatically.

---

# Tool Decision Framework

Before creating a new tool:

```text
Can an existing tool handle it?

Would adding one mode to an existing tool be clearer?

Can it run locally?

Does it require sensitive input?

Is there enough value to justify another entry in the tool directory?
```

---

# Design Decision Framework

Before introducing a new UI pattern:

```text
Does an existing component already solve this?

Does the new pattern improve usability?

Does it work on mobile?

Does it work with keyboard navigation?

Does it remain understandable in light and dark mode?

Does it add useful information or just decoration?
```

---

# Performance Decision Framework

Before adding client-side code:

```text
Does this need JavaScript?

Can it be loaded only on the relevant page?

Is the dependency worth its size?

Will it slow every page for a feature used on one page?
```

Avoid site-wide cost for page-specific functionality.

---

# Definition of a Good Change

A good change usually makes ilham.dev:

```text
clearer
more useful
more accurate
more consistent
easier to maintain
easier to understand
```

without adding unnecessary complexity.

---

# Definition of a Bad Change

Be suspicious of changes that:

```text
add complexity without obvious user value
introduce new dependencies for trivial functionality
rewrite large amounts of working code unnecessarily
make privacy behavior less transparent
create duplicate content
break stable URLs
make the site look more generic
```

---

# Long-Term Direction

ilham.dev should gradually become:

> A practical engineering knowledge base, personal field notebook, and collection of useful tools built around real technical work.

The site should remain recognizably personal.

The goal is not to compete on quantity.

The goal is to be useful enough that someone remembers:

> I found that on Ilham's site before.

---

# Final Principle

When deciding between two approaches, prefer the one that better matches:

```text
simple
useful
transparent
technical
personal
maintainable
```

The site should feel like something built by an engineer for himself first, then made useful enough to share with everyone else.
