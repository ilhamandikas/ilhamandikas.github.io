# Tools Guidelines

This document defines the standard for building, reviewing, and maintaining interactive tools on **ilham.dev**.

The goal is simple:

> Every tool should be useful immediately, understandable without documentation, privacy-conscious, fast, and consistent with the rest of the site.

Tools should feel like practical utilities, not mini SaaS products.

---

# Core Principles

Every tool should prioritize:

1. usefulness
2. clarity
3. correctness
4. privacy
5. speed
6. accessibility
7. consistency
8. discoverability

Do not prioritize decorative UI over utility.

Do not add complexity unless it solves a real user problem.

---

# Tool Page Anatomy

A typical tool page should contain:

```text
Title
Short description
Privacy / processing status
Main input area
Primary action
Result
Secondary actions
Short explanation
Related tools
Related guide, if available
```

Not every tool needs all sections.

Keep the actual utility near the top of the page.

Users should not need to scroll through a long introduction before using the tool.

---

# Above-the-Fold Rule

A user should understand within a few seconds:

- what the tool does
- what input is expected
- what output they will get
- whether their data leaves the browser

Avoid large hero sections for simple utilities.

Preferred:

```text
JWT Decoder

Decode a JWT header and payload directly in your browser.

[ Runs locally ] [ No upload ]

[ input ]

[ Decode ]
```

Avoid:

```text
Welcome to the ultimate JWT decoding experience.

JWTs are widely used across modern applications...
```

before the actual tool.

---

# Tool Naming

Tool names should be short and literal.

Good:

```text
JWT Decoder
JSON Formatter
CIDR Calculator
Unix Timestamp Converter
Image Metadata Viewer
HTTP Header Parser
```

Avoid names such as:

```text
Ultimate JWT Utility
Super JSON Toolkit
Powerful Network Helper
Developer Toolbox Pro
```

Do not add words like:

```text
free
best
online
ultimate
powerful
```

only for SEO.

---

# Tool Description

Descriptions should explain exactly what the tool does.

Good:

```text
Decode the header and payload of a JSON Web Token.
```

Better when privacy matters:

```text
Decode the header and payload of a JSON Web Token directly in your browser.
```

Bad:

```text
A powerful utility for all your JWT needs.
```

---

# Processing Classification

Every tool must be classified internally as one of:

```text
LOCAL
REMOTE
HYBRID
```

## LOCAL

All meaningful processing happens inside the browser.

Examples:

```text
JSON formatting
Base64 conversion
hashing
UUID generation
timestamp conversion
CIDR calculation
text transformation
```

Recommended user-facing label:

```text
Runs locally
```

Optional secondary label:

```text
No upload
```

Only claim this if it is completely true.

---

## REMOTE

The tool requires an external or first-party API.

Examples:

```text
IP geolocation
DNS lookup through external service
public API queries
remote validation
```

Clearly disclose that network requests occur.

Recommended wording:

```text
Uses an external API.
```

Where useful, explain:

```text
Your IP address is sent to Example API to retrieve network information.
```

---

## HYBRID

Some work is local while other features require network access.

Example:

```text
Local image preview
+
optional external reverse image lookup
```

Explain the boundary clearly.

Do not label the whole tool "local" if one important action sends data externally.

---

# Privacy Metadata

Each tool should ideally expose internal metadata such as:

```yaml
processing: local
network_required: false
stores_input: false
external_services: []
```

For remote tools:

```yaml
processing: remote
network_required: true
stores_input: false
external_services:
  - name: Example API
    purpose: IP lookup
```

This metadata can later power:

- UI badges
- search filters
- AI-readable data
- privacy documentation
- audits

---

# Sensitive Input

Treat these as potentially sensitive:

```text
JWTs
API keys
access tokens
authorization headers
cookies
private keys
certificates
EXIF data
logs
database connection strings
email headers
personal data
```

For these tools:

- avoid persistent storage
- avoid analytics events containing user input
- avoid logging raw input
- avoid automatically sending input anywhere
- explain processing clearly

Never store sensitive input by default.

---

# Browser Storage

Do not use storage without a reason.

Possible storage mechanisms:

```text
localStorage
sessionStorage
IndexedDB
cookies
```

Good uses:

```text
theme preference
tool settings
recent non-sensitive options
UI preferences
```

Bad uses:

```text
JWT tokens
passwords
API keys
private keys
raw logs
authorization headers
```

If tool state is persisted, document it.

---

# Default Behavior

Tools should do the obvious thing by default.

Avoid requiring configuration for common tasks.

Example:

A JSON formatter should:

```text
paste JSON
→ format
```

without asking users to select:

```text
indent width
newline style
parser mode
format profile
```

before first use.

Advanced options may exist, but should not block basic usage.

---

# Input Handling

Inputs should tolerate normal human behavior.

Where safe:

- trim accidental whitespace
- accept pasted input
- support multiline text
- normalize common line endings
- avoid losing input on errors

Do not silently transform meaningful values.

For example, trimming spaces is fine for an IP address:

```text
  192.168.1.1
```

but may not be safe for:

```text
hash input
password derivation
raw text comparison
```

Understand the domain before normalizing input.

---

# Input Labels

Every input should have a real label.

Good:

```text
JWT
```

```text
IPv4 address
```

```text
JSON input
```

Do not rely only on placeholder text.

Placeholder:

```text
192.168.1.10
```

is useful.

Placeholder:

```text
Enter something here...
```

is usually not.

---

# Validation

Validate input as early as practical.

Errors should be specific.

Bad:

```text
Invalid input.
```

Good:

```text
This does not appear to be a valid IPv4 address.
Expected something like 192.168.1.10.
```

Good:

```text
The JWT should contain three dot-separated sections.
```

Avoid technical parser errors such as:

```text
Unexpected token at position 18
```

unless useful.

When appropriate, expose both:

```text
Invalid JSON near line 12.
```

and optional technical detail.

---

# Error Recovery

A user should be able to fix an error without starting over.

Do not:

- clear the user's input
- reset all settings
- navigate away
- hide the error immediately

unless required.

Keep the problematic input visible.

---

# Primary Actions

Buttons should use explicit verbs.

Good:

```text
Decode
Format
Convert
Calculate
Generate
Validate
Inspect
Parse
Compare
```

Avoid vague buttons:

```text
Submit
Go
Run
Process
Click
```

unless the context makes them clearer.

---

# Secondary Actions

Common secondary actions:

```text
Copy
Clear
Reset
Download
Swap
Share
```

Do not make every action visually equal.

There should usually be one obvious primary action.

---

# Copy Behavior

Outputs likely to be reused should have a copy action.

Examples:

```text
generated UUID
formatted JSON
decoded claims
CIDR result
hash
timestamp
curl command
SQL output
```

After copying, provide clear feedback.

Examples:

```text
Copied
```

or:

```text
Copied to clipboard
```

Do not show blocking alerts.

---

# Download Behavior

Only add download when it is genuinely useful.

Examples:

```text
generated file
converted image
processed JSON
CSV output
certificate
```

Do not add download buttons for short values that are easier to copy.

---

# Clear and Reset

Use:

```text
Clear
```

when only content is removed.

Use:

```text
Reset
```

when the tool returns to its initial state, including options.

Do not unexpectedly reset user preferences.

---

# Live Processing vs Submit Button

Use live processing when:

- processing is cheap
- results are immediate
- there are no network requests
- changing input continuously is useful

Examples:

```text
text counter
Base64 preview
timestamp conversion
color conversion
```

Use an explicit action when:

- work is expensive
- input is large
- network requests occur
- execution has meaningful consequences
- results should not update while typing

Examples:

```text
DNS lookup
API request
large image processing
file conversion
```

---

# Keyboard Behavior

Where appropriate:

```text
Ctrl/Cmd + Enter
```

may trigger the primary action.

But do not override common browser/editor keyboard behavior unnecessarily.

Textareas should still behave like normal textareas.

---

# Auto Focus

Use autofocus sparingly.

It can be useful on single-purpose tools.

Do not autofocus if it:

- opens the mobile keyboard unnecessarily
- disrupts page navigation
- harms accessibility

---

# Result Presentation

Results should be easy to scan.

Prefer structured display when possible.

Example for CIDR:

```text
Network
192.168.1.0

Broadcast
192.168.1.255

Usable range
192.168.1.1 – 192.168.1.254

Hosts
254
```

Better than:

```text
192.168.1.0 192.168.1.255 192.168.1.1-192.168.1.254 254
```

---

# Result States

Each tool should handle:

```text
initial
processing
success
empty
error
```

Not all require visible representations, but none should produce confusing blank areas.

Example initial state:

```text
Paste a JWT above to inspect its contents.
```

---

# Loading

Only display loading states if the operation takes noticeable time.

Avoid artificial loaders for instant local operations.

For remote requests, show:

```text
Loading…
```

or a subtle spinner.

Disable duplicate submissions while an identical request is running when appropriate.

---

# External APIs

When using external APIs:

- handle timeout
- handle unavailable service
- handle rate limits
- handle malformed responses
- avoid exposing API secrets
- do not assume response shape forever

Give useful error messages.

Instead of:

```text
500
```

show:

```text
The lookup service could not be reached.
Try again in a moment.
```

---

# API Keys

Public frontend code must not contain private API keys.

If a service requires a secret credential, the tool needs an appropriate backend or proxy.

Do not attempt to hide secrets using:

```text
obfuscation
Base64
minification
JavaScript variables
```

These do not protect credentials.

---

# Third-Party Dependencies

Prefer native browser APIs when practical.

Before adding a library, consider:

```text
Can the browser already do this?
How large is the dependency?
Is it maintained?
Does it introduce network calls?
Does it require tracking?
```

Avoid large frameworks for tiny utilities.

---

# Offline Capability

If a tool has no network dependencies after load, consider making it usable offline.

Do not claim:

```text
Works offline
```

unless tested.

Tools that depend on CDNs may not truly work offline.

---

# File Tools

Tools accepting files require extra care.

Validate:

```text
file type
file size
processing capability
```

Do not trust file extensions alone.

Where possible, inspect MIME type or file structure.

Do not upload files when processing can safely happen locally.

---

# File Size Limits

If there is a practical file size limit, show it before processing.

Example:

```text
Maximum recommended size: 25 MB
```

Do not wait until the operation fails to explain the limit.

---

# Image Tools

For image tools:

- preserve orientation correctly
- avoid unexpected metadata retention
- state whether metadata is stripped
- state whether images leave the browser
- provide output dimensions
- show output file size where useful

Avoid silent quality degradation.

---

# Crypto and Hash Tools

Clearly distinguish:

```text
encoding
hashing
encryption
signing
```

Do not call Base64 encryption.

Do not imply that hashing is reversible.

Do not present weak algorithms as secure choices without context.

If legacy algorithms exist for compatibility, label them appropriately.

---

# Network Tools

Networking tools should be explicit about notation.

Examples:

```text
IPv4
IPv6
CIDR
port
hostname
URL
```

Do not mix:

```text
hostname
domain
URL
IP
```

as though they are interchangeable.

---

# Time and Date Tools

Always make timezone behavior explicit.

Examples:

```text
Local time
UTC
Asia/Jakarta
```

Avoid displaying ambiguous dates such as:

```text
03/04/2026
```

Prefer:

```text
2026-04-03
```

or a clearly labeled locale representation.

---

# Unit Tools

Show units next to both input and output.

Do not make users infer whether:

```text
MB
MiB
Mbps
MB/s
```

are being used.

Where relevant, explain binary vs decimal units.

---

# Tool Categories

Use broad categories.

Possible categories:

```text
Developer
Networking
Data
Security
Privacy
Text
Image
File
Finance
Utilities
Indonesia
```

Do not create a unique category for every tool.

---

# Search

Every tool should have search metadata.

Example:

```yaml
title: CIDR Calculator
description: Calculate network, broadcast, host range, and subnet information from IPv4 CIDR notation.
category: Networking

keywords:
  - cidr
  - subnet
  - ip
  - network
  - mask
  - prefix

aliases:
  - subnet calculator
  - ip calculator
  - network calculator
```

Search aliases should represent how real users might describe the tool.

---

# Related Tools

Related tools should be based on workflow.

For example:

```text
CIDR Calculator
├── IPv4 Converter
├── Subnet Reference
├── Port Lookup
└── IP Information
```

Avoid automatically listing tools merely because they share a category.

---

# Related Guides

Every tool should have a short tool guide walkthrough, written per
`GUIDE-GUIDELINES.md`. Link it from the tool.

When a broader topic guide exists, link it too.

Example:

```text
CIDR Calculator

Learn more:
Understanding CIDR and subnet masks
```

The tool itself should remain usable without reading the guide.

---

# Related Posts

Personal posts may be linked when genuinely relevant.

Example:

```text
From my notes:
Why a service was reachable over IPv6 but not IPv4
```

Do not turn every tool into a blog promotion surface.

---

# Tool URLs

Preferred:

```text
/tools/jwt-decoder/
/tools/cidr-calculator/
/tools/json-formatter/
```

URLs should remain stable.

Avoid renaming slugs because of small title changes.

---

# Page Metadata

Each tool needs:

```text
title
description
canonical
Open Graph metadata
```

The description should describe functionality, not marketing language.

---

# Tool Structured Metadata

When the site has a machine-readable tool catalog, expose fields like:

```yaml
id: jwt-decoder
name: JWT Decoder
url: /tools/jwt-decoder/

category: Developer

processing:
  type: local
  network_required: false

input:
  - jwt

output:
  - header
  - payload

keywords:
  - jwt
  - json web token
  - token
  - auth

related_tools:
  - base64-decoder
  - unix-timestamp

related_guides:
  - debugging-jwt
```

Do not expose metadata that is not actually used or maintained.

---

# Accessibility

Every tool must work without a mouse where reasonable.

Requirements:

- semantic controls
- keyboard navigation
- visible focus states
- proper form labels
- error announcements where appropriate
- sufficient contrast
- readable text size

Use native:

```html
<button>
<input>
<textarea>
<select>
```

instead of rebuilding them unnecessarily.

---

# Mobile

Every tool must be tested on narrow screens.

Check at least:

```text
320 px
375 px
768 px
desktop
```

Common problems to avoid:

- overflowing code
- controls too wide
- copy buttons covering output
- horizontal scroll caused by cards
- unusable side-by-side layouts
- tiny tap targets

---

# Responsive Layout

Desktop may use:

```text
Input | Output
```

Mobile should usually become:

```text
Input
Output
```

Do not preserve side-by-side layouts when they become cramped.

---

# Performance

Tools should load quickly.

Avoid:

- unnecessary large packages
- remote fonts for a single icon
- huge UI frameworks for one utility
- loading all tool code on every site page

Prefer loading tool-specific JavaScript only when required.

---

# Progressive Enhancement

Where practical, basic content should remain understandable even if JavaScript fails.

At minimum, the user should still see:

- tool name
- purpose
- expected input
- privacy information

Interactive functionality may require JavaScript.

---

# Analytics

Do not send raw user inputs to analytics.

Safe events may include:

```text
tool_opened
tool_action_used
copy_clicked
error_type
```

Unsafe analytics:

```text
jwt=<actual token>
ip=<user input>
json=<entire payload>
authorization_header=<value>
```

Do not leak sensitive data through URLs either.

---

# Query Parameters

Query parameters may be useful for shareable non-sensitive tool state.

Example:

```text
/tools/cidr-calculator/?cidr=192.168.1.0/24
```

Do not put secrets into query strings.

Never encourage shareable URLs containing:

```text
tokens
passwords
private keys
cookies
authorization headers
```

because URLs can appear in:

- browser history
- logs
- analytics
- referrers
- screenshots

---

# Share Functionality

Only add share functionality when useful.

Prefer sharing:

```text
tool URL
non-sensitive settings
public result
```

Never automatically include private input.

---

# Clear Privacy Language

Avoid vague claims:

```text
Your data is safe.
```

Prefer factual claims:

```text
This calculation runs in your browser.
The tool does not send the input to ilham.dev.
```

Specific > reassuring.

---

# Security

Never execute user input as code unless the tool explicitly exists to execute code and has an appropriate isolation model.

Avoid:

```text
eval()
Function()
innerHTML with untrusted content
```

unless absolutely necessary and securely handled.

Escape rendered user content.

---

# HTML Output

If a tool renders HTML supplied by a user, sanitize it.

Do not insert raw untrusted HTML directly into the page.

---

# URL Parsing Tools

Do not automatically navigate to parsed user URLs.

Display parsed data first.

This avoids accidental navigation to:

```text
malicious
phishing
unexpected
local-network
```

destinations.

---

# Destructive Tools

If a transformation can lose information:

```text
metadata removal
image compression
text replacement
minification
```

make the behavior clear.

When possible, preserve original input until the user leaves or clears it.

---

# Tool Versioning

Do not put versions in public URLs.

Avoid:

```text
/tools/json-formatter-v2/
```

Keep:

```text
/tools/json-formatter/
```

and update implementation behind the same stable URL.

---

# Experimental Tools

If a tool is incomplete or potentially unreliable, label it:

```text
Experimental
```

Do not pretend experimental results are authoritative.

---

# Empty Tools

Do not publish a tool page before the core feature works.

A placeholder such as:

```text
Coming soon
```

usually does not need a public indexed URL.

---

# Duplicate Tools

Before creating a new tool, search existing tools.

Avoid duplicates such as:

```text
JSON Beautifier
JSON Formatter
Pretty JSON
JSON Prettifier
```

unless they genuinely differ.

Prefer one strong tool with aliases.

---

# Tool Expansion

Prefer adding a useful capability to an existing tool when the workflow is closely related.

Example:

Instead of:

```text
JSON Formatter
JSON Validator
JSON Minifier
```

consider one:

```text
JSON Tool
```

with:

```text
Format
Validate
Minify
```

However, do not create giant "everything tools" that become confusing.

Use judgment.

---

# Tool Quality Review

Before shipping a new tool, test:

## Functionality

- valid input
- invalid input
- empty input
- very large input
- unusual characters
- copy
- reset
- repeated usage

## Browser

At minimum verify in modern:

```text
Chrome
Safari
Firefox
```

when feasible.

## Responsive

Verify:

```text
mobile
tablet
desktop
```

## Theme

Verify:

```text
light
dark
```

if both are supported.

---

# Content Review

Before publishing, check:

- title is literal
- description is accurate
- privacy claim is true
- related links are relevant
- examples do not contain real secrets
- instructions are concise
- terminology is correct

---

# Examples

Examples should be safe and clearly fake.

Good:

```text
192.168.1.10
example.com
user@example.com
eyJhbGciOi...
```

Do not use real production:

```text
credentials
tokens
IPs
internal hostnames
emails
API keys
customer data
```

unless intentionally public and safe.

---

# AI Agent Rules

When an AI agent creates or modifies a tool:

1. Inspect existing tools first.
2. Reuse existing components and patterns.
3. Do not introduce a new design language.
4. Determine whether processing should be local or remote.
5. Prefer local processing when practical.
6. Do not introduce external services unnecessarily.
7. Do not add a dependency without justification.
8. Verify terminology and calculations.
9. Add useful search metadata.
10. Add related content only when relevant.
11. Do not fabricate privacy guarantees.
12. Do not expose secrets.
13. Test error handling.
14. Preserve existing URLs.
15. Keep the tool focused.

---

# Agent Pre-Implementation Questions

Before implementing a new tool, answer internally:

```text
What problem does this solve?

Does a similar tool already exist?

Can it run entirely in the browser?

Does it process sensitive information?

Does it need browser storage?

Does it need an external API?

What can fail?

What should the empty state say?

What should invalid input look like?

What output is most useful?

Should the output be copyable?

Is a guide already available?

Which existing tools are genuinely related?
```

If these questions are unclear, inspect the existing codebase before creating the tool.

---

# Recommended Tool Definition

Where practical, every tool should have a definition similar to:

```yaml
id: cidr-calculator

name: CIDR Calculator

description: >
  Calculate network, broadcast, usable host range,
  and subnet details from IPv4 CIDR notation.

category: Networking

keywords:
  - cidr
  - subnet
  - ipv4
  - network
  - mask

aliases:
  - subnet calculator
  - ip calculator

processing:
  type: local
  network_required: false
  stores_input: false

capabilities:
  offline: true
  file_upload: false
  clipboard: true

input:
  - cidr

output:
  - network_address
  - broadcast_address
  - host_range
  - subnet_mask
  - host_count

related_tools:
  - ipv4-converter
  - port-lookup

related_guides:
  - understanding-cidr
```

The exact schema may differ based on the site implementation.

Consistency matters more than the exact syntax.

---

# Recommended Tool Status Badges

Possible badges:

```text
Runs locally
No upload
External API
Works offline
Experimental
```

Do not use badges such as:

```text
Secure
Private
Safe
Anonymous
```

unless the claim has a precise and defensible meaning.

---

# Definition of Done

A tool is complete when:

- [ ] Purpose is immediately clear
- [ ] Input is clearly labeled
- [ ] Valid input works
- [ ] Invalid input produces useful feedback
- [ ] Empty state makes sense
- [ ] Processing behavior is documented
- [ ] Privacy claims are accurate
- [ ] Sensitive values are not persisted
- [ ] No unnecessary network request occurs
- [ ] Output is easy to understand
- [ ] Copy/download actions exist where useful
- [ ] Tool works on mobile
- [ ] Keyboard navigation works
- [ ] Light/dark modes work if applicable
- [ ] Search metadata exists
- [ ] URL is stable
- [ ] Related tools are meaningful
- [ ] Related guide is linked when available
- [ ] Technical terminology is correct
- [ ] No real secrets appear in examples
- [ ] No unnecessary dependency was introduced

---

# Final Principle

When unsure, choose the implementation that is:

```text
simpler
more local
more transparent
more predictable
easier to maintain
```

The best ilham.dev tool should feel like:

> I needed this, so I made the smallest useful version of it.
