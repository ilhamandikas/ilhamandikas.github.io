# AGENTS.md

This file is the entry point for AI agents and automated contributors working on **ilham.dev**.

Do not make substantial changes before understanding the site context and the relevant repository guidelines.

The goal is not merely to make code work.

Changes should also preserve:

- site identity
- technical correctness
- privacy
- content quality
- stable URLs
- design consistency
- maintainability

---

# Start Here

Before making changes, read:

```text
SITE-KNOWLEDGE.md
```

This explains:

- what ilham.dev is
- what the site is trying to become
- its content architecture
- its engineering philosophy
- its design and privacy principles
- what should not be changed casually

Treat `SITE-KNOWLEDGE.md` as the high-level context for the repository.

---

# Repository Guidelines

Depending on the task, read the relevant document.

## Content Work

Read:

```text
CONTENT-GUIDELINES.md
GUIDE-GUIDELINES.md
```

Use it when:

- writing a post
- editing a guide
- rewriting copy
- moving content
- creating titles
- changing tags
- creating related content
- reviewing technical articles

---

## Tool Work

Read:

```text
TOOLS-GUIDELINES.md
TOOL-CATALOG.md
```

Use them when:

- creating a new tool
- changing tool behavior
- adding input/output fields
- adding privacy labels
- changing storage behavior
- introducing an external API
- adding search metadata
- adding related tools
- changing tool categories

---

## Design or UI Work

Read:

```text
DESIGN-SYSTEM.md
```

Use it when:

- creating components
- changing layouts
- modifying buttons
- adding cards
- changing typography
- adding responsive behavior
- introducing animation
- changing navigation
- creating new visual patterns

Reuse existing patterns before inventing new ones.

---

## SEO or URL Work

Read:

```text
SEO-CHECKLIST.md
```

Use it when:

- moving pages
- changing URLs
- adding redirects
- changing canonical URLs
- updating metadata
- modifying sitemap behavior
- changing structured data
- changing publication dates
- modifying internal links

Never break an existing URL casually.

---

## AI / Machine Readability Work

Read:

```text
AI-COMPATIBILITY.md
```

Use it when:

- editing `llms.txt`
- exposing machine-readable catalogs
- changing structured metadata
- improving semantic HTML
- making tools easier for agents to discover
- creating public indexes or feeds

Human usability remains the priority.

---

# Core Site Architecture

The primary content model is:

```text
/posts/
/guides/
/tools/
```

Their responsibilities are different.

---

## Posts

`/posts/` contains personal engineering experience.

Examples:

- incidents
- debugging stories
- experiments
- migrations
- technical decisions
- failures
- performance observations
- lessons learned

A post should contain something that actually happened.

Never fabricate a personal experience.

---

## Guides

`/guides/` contains reusable technical knowledge.

Examples:

- troubleshooting
- technical explanations
- configuration guides
- reference material
- debugging workflows

A guide does not need to contain a personal story.

---

## Tools

`/tools/` contains interactive utilities.

Tools should remain:

- focused
- fast
- transparent
- privacy-conscious
- easy to understand

Do not automatically create a topic guide or a blog post for every new tool.
Every tool should have a short **tool guide** walkthrough instead. See
`GUIDE-GUIDELINES.md`.

---

# Content Decision Rule

Before creating content, classify it.

```text
Interactive action?
→ Tool

Reusable technical knowledge?
→ Guide

Real experience, incident, decision, or experiment?
→ Post
```

Do not duplicate the same content across all three.

---

# Before Creating Anything

Search the repository first.

Check whether:

- the feature already exists
- a similar tool already exists
- a guide already covers the topic
- a post already covers the experience
- an existing component can be reused
- an existing category fits
- an existing utility can be extended

Prefer improving existing work over creating duplicates.

---

# Preserve Existing Behavior

Do not rewrite unrelated code.

Do not perform large refactors merely because another architecture looks cleaner.

When working on one feature:

- keep the scope focused
- preserve unrelated behavior
- reuse current patterns
- avoid unnecessary dependency changes

A working codebase is context.

---

# URLs Are Stable Interfaces

Treat public URLs as stable interfaces.

Do not rename a slug just because a title changes.

If a URL must move:

```text
old URL
→ permanent redirect
→ new canonical URL
```

Also check:

- sitemap
- internal links
- related content
- structured metadata
- feeds
- search indexes

---

# Privacy Rules

Do not make privacy claims without verifying implementation.

Prefer factual language:

```text
Runs locally in your browser.
```

rather than:

```text
100% private.
```

Do not store sensitive tool inputs unless explicitly required.

Sensitive examples include:

```text
JWT
API keys
credentials
authorization headers
cookies
private keys
database connection strings
personal data
EXIF metadata
logs
```

Do not send raw user input to analytics.

---

# Tool Processing

For every tool, understand whether it is:

```text
local
remote
hybrid
```

Do not introduce an external API when browser-side processing is practical.

Do not claim a remote or hybrid tool is fully local.

---

# External Services

Before adding an external service, consider:

- why it is needed
- what data is sent
- whether a browser API can replace it
- whether credentials are required
- whether rate limits exist
- what happens if the service is unavailable

Never expose private API secrets in frontend code.

---

# Dependencies

Before adding a dependency, ask:

```text
Can existing code do this?

Can a native browser API do this?

Is the package maintained?

Is the size justified?

Does it introduce security or privacy concerns?
```

Do not install a large package for trivial functionality.

---

# Static-First Architecture

ilham.dev intentionally favors static architecture.

Before introducing backend infrastructure, ask:

```text
Can this run in the browser?

Can this happen at build time?

Can static data solve it?

Is a backend actually necessary?
```

Backend infrastructure is allowed when genuinely required, but should not be the default.

---

# Code Style

Follow the existing repository style.

Before introducing:

- a new directory structure
- naming convention
- component pattern
- data format
- JavaScript architecture

inspect how existing code handles similar cases.

Consistency with the project is usually preferable to introducing a second style.

---

# Design Rules

Do not turn the site into a generic SaaS landing page.

Prefer:

```text
minimal
technical
calm
fast
functional
```

Avoid unnecessary:

- gradients
- oversized heroes
- decorative dashboards
- floating UI
- animations
- marketing copy

Use existing visual patterns whenever possible.

---

# Mobile First

Any new interface must work on narrow screens.

At minimum consider:

```text
320px
375px
768px
desktop
```

Watch for:

- horizontal overflow
- cramped controls
- unusable side-by-side layouts
- tiny buttons
- code overflow
- copy buttons covering content

---

# Accessibility

Prefer native HTML.

Use:

```html
<button>
<input>
<textarea>
<select>
```

instead of custom equivalents unless necessary.

New UI should support:

- keyboard navigation
- visible focus states
- form labels
- meaningful button text
- sufficient contrast
- sensible heading structure

ARIA should supplement native HTML, not replace it unnecessarily.

---

# Error Messages

Errors should help users recover.

Bad:

```text
Invalid input.
```

Better:

```text
This does not appear to be a valid IPv4 address.
Expected something like 192.168.1.10.
```

Do not clear user input after a recoverable error.

Do not expose raw stack traces to normal users.

---

# Content Style

Writing should feel:

```text
personal
concise
practical
technical
calm
slightly casual
```

Avoid generic AI or marketing language.

Examples to avoid:

```text
powerful solution
seamless experience
cutting-edge
highly motivated
revolutionary
```

Avoid repetitive article templates.

Do not make every title begin with:

```text
How I...
```

---

# Technical Accuracy

Do not guess technical facts.

For standards, protocols, browser behavior, databases, cloud services, or security topics, prefer authoritative documentation.

Examples:

```text
RFCs
MDN
official product documentation
Linux man pages
nginx documentation
Docker documentation
PostgreSQL documentation
MySQL documentation
Cloudflare documentation
```

Do not invent:

- benchmarks
- statistics
- production numbers
- incidents
- test results

---

# Public Examples

Do not expose sensitive production values.

Use safe examples such as:

```text
example.com
user@example.com
192.168.1.10
10.0.0.5
```

Sanitize:

- private hostnames
- tokens
- credentials
- internal IP inventories
- database names
- customer data
- access keys

before publishing.

---

# Internal Linking

Prefer useful relationships between:

```text
Tool ↔ Guide ↔ Post
```

Example:

```text
/tools/cidr-calculator/
        ↓
/guides/understanding-cidr/
        ↓
/posts/a-real-networking-debugging-story/
```

Do not create irrelevant internal links solely for SEO.

---

# Tool Metadata

When creating or modifying a tool, keep its metadata accurate.

Review:

```text
id
name
description
category
keywords
aliases
processing model
network behavior
storage behavior
capabilities
related tools
related guides
status
```

See:

```text
TOOL-CATALOG.md
```

Do not create attractive metadata that does not match reality.

---

# Search Metadata

Think about how users may search.

For example, a CIDR tool may need:

```text
cidr
subnet
ip
netmask
network calculator
subnet calculator
```

Use genuine synonyms and terminology.

Do not add SEO keyword stuffing.

---

# Tool Relationships

Related tools should reflect actual workflows.

Bad:

```text
Every tool in the same category is related.
```

Good:

```text
JWT Decoder
→ Base64 Decoder
→ Unix Timestamp Converter
→ JSON Formatter
```

No related links are better than irrelevant ones.

---

# Offline Claims

Do not set:

```text
offline: true
```

unless the tool actually works without network access after loading.

Remote CDN dependencies may make a tool non-offline even when its processing logic is local.

---

# Security

Avoid unsafe handling of user input.

Be especially careful with:

```text
innerHTML
eval()
Function()
dynamic script execution
HTML preview
URL handling
file parsing
```

Sanitize untrusted HTML.

Do not automatically navigate to URLs supplied by users unless the feature explicitly requires it and the behavior is safe.

---

# Analytics

Never send raw user input as analytics metadata.

Acceptable examples:

```text
tool_opened
copy_clicked
format_used
validation_failed
```

Do not send:

```text
actual JWT
actual API key
raw JSON
authorization header
uploaded content
```

---

# Query Strings

Do not place secrets in URLs.

Query strings can appear in:

- browser history
- server logs
- analytics
- referrer headers
- screenshots

Only expose non-sensitive state in shareable URLs.

---

# Build and Validation

Before finishing a task, run the project's relevant validation steps.

Depending on the change, verify:

- build succeeds
- links resolve
- metadata is valid
- affected tool works
- no obvious console errors appear
- no unexpected network requests were introduced
- mobile layout still works
- public URLs remain correct

Use existing project scripts where available.

Do not invent new build workflows unnecessarily.

---

# Scope Control

Do not modify unrelated files just because you notice stylistic inconsistencies.

If a task reveals a separate issue:

- leave it unchanged
- document it separately if useful

Keep changes reviewable.

---

# Comments

Write comments only where they explain something non-obvious.

Avoid comments that merely repeat code.

Good:

```js
// Preserve the raw value because leading whitespace is significant
// for this hashing operation.
```

Bad:

```js
// Set value
value = input;
```

---

# Removing Existing Functionality

Do not remove a feature just because it seems unused.

First inspect:

- references
- navigation
- tool relationships
- links
- scripts
- documentation

If removal is intentional, also consider URL compatibility and redirects.

---

# New Categories

Do not create a new tool or content category until checking whether an existing category fits.

Too many categories make discovery worse.

Prefer broad, stable taxonomy.

---

# Deprecated Tools

Do not silently delete deprecated tools.

When practical:

```text
old tool
→ deprecated
→ replacement tool
```

and preserve old URLs through redirect or compatibility behavior.

---

# Agent Task Flow

For most tasks, follow this sequence:

```text
1. Understand the request
2. Read relevant guidelines
3. Inspect existing implementation
4. Search for related content/code
5. Decide the smallest correct change
6. Implement
7. Validate
8. Review privacy/security implications
9. Review URLs/metadata if relevant
10. Summarize what changed
```

---

# When Adding a Tool

Read:

```text
TOOLS-GUIDELINES.md
TOOL-CATALOG.md
GUIDE-GUIDELINES.md
DESIGN-SYSTEM.md
SEO-CHECKLIST.md
```

Then:

1. Search existing tools.
2. Confirm it is not a duplicate.
3. Decide local/remote/hybrid processing.
4. Identify sensitive input.
5. Reuse existing components.
6. Implement error states.
7. Add search metadata.
8. Add meaningful relationships.
9. Verify mobile behavior.
10. Verify privacy claims.
11. Add the tool guide walkthrough (`GUIDE-GUIDELINES.md`).

---

# When Adding a Guide

Read:

```text
CONTENT-GUIDELINES.md
GUIDE-GUIDELINES.md
SEO-CHECKLIST.md
AI-COMPATIBILITY.md
```

Then:

1. Search existing guides/posts/tools.
2. Avoid duplicate explanations.
3. Use technically accurate examples.
4. Link relevant tools.
5. Add primary references where useful.
6. Keep the writing practical.

---

# When Adding a Post

Read:

```text
CONTENT-GUIDELINES.md
SITE-KNOWLEDGE.md
```

Then verify:

```text
Did this actually happen?

Is there a real observation, decision, failure, experiment, or lesson?
```

If not, it may belong under `/guides/` instead.

Never fabricate personal context to make a generic article feel personal.

---

# When Moving Content

Read:

```text
SEO-CHECKLIST.md
```

Verify:

```text
redirect
canonical
sitemap
internal links
related content
publish date
modified date
```

Do not simply move the file and consider the work complete.

---

# When Changing Design

Read:

```text
DESIGN-SYSTEM.md
```

First inspect existing components.

Do not create a new pattern if an existing pattern works.

---

# When Improving AI Compatibility

Read:

```text
AI-COMPATIBILITY.md
```

Prefer:

```text
semantic HTML
stable URLs
clear descriptions
structured metadata
machine-readable catalogs
```

over AI-specific hacks.

---

# Agent Communication

When reporting completed work, be concise.

Explain:

- what changed
- why
- anything important to review
- any unresolved limitation

Do not produce a long narration of every file touched unless requested.

---

# Things Agents Must Not Do

Do not:

- fabricate personal stories
- fabricate benchmarks
- publish production secrets
- expose API credentials
- break existing URLs unnecessarily
- create duplicate tools
- create duplicate articles
- mass-generate SEO content
- add large dependencies without reason
- introduce a backend by default
- invent privacy guarantees
- rewrite unrelated code
- change the site's identity into generic SaaS copy

---

# Decision Priority

When instructions conflict, use this priority:

```text
Explicit user request
↓
Correctness
↓
Security and privacy
↓
Existing project behavior
↓
SITE-KNOWLEDGE.md
↓
Content / Tool / Design guidelines
↓
SEO and AI discoverability
```

Never sacrifice correctness or user privacy for SEO.

---

# Final Rule

When choosing between:

```text
more clever
```

and:

```text
simpler and easier to understand
```

prefer the simpler implementation unless the more complex option provides clear user value.

ilham.dev should remain:

> useful, understandable, personal, technical, and easy to maintain.
