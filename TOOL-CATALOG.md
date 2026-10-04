# Tool Catalog

This document defines the canonical metadata format for tools on **ilham.dev**.

The catalog exists so tools can be consistently understood by:

- humans
- the site search
- related-tool logic
- AI agents
- internal tooling
- privacy indicators
- future automation

This document should describe tools accurately.

Do not add metadata that is not maintained or cannot be verified.

---

# Goals

The tool catalog should make it possible to answer:

```text
What does this tool do?

What category does it belong to?

What can users search for to find it?

Does processing happen locally?

Does it send data over the network?

Does it store user input?

Can it work offline?

What type of input does it accept?

What output does it produce?

Which tools are related?

Is there a guide explaining the topic?
```

---

# Source of Truth

There should ideally be one canonical metadata source for every tool.

Avoid maintaining separate copies in:

```text
search index
tool page
related tools config
AI metadata
privacy config
```

when the same information can be generated from one source.

Preferred model:

```text
Tool metadata
      ↓
      ├── Tool page
      ├── Search index
      ├── Related tools
      ├── Privacy badges
      ├── AI catalog
      └── Sitemap / discovery metadata
```

---

# Recommended Structure

A tool entry should follow a structure similar to:

```yaml
id: cidr-calculator

name: CIDR Calculator

slug: cidr-calculator

url: /tools/cidr-calculator/

description: >
  Calculate network address, broadcast address,
  usable host range, subnet mask, and host count
  from IPv4 CIDR notation.

category: Networking

keywords:
  - cidr
  - subnet
  - ipv4
  - network
  - subnet mask

aliases:
  - subnet calculator
  - ip calculator
  - network calculator

processing:
  type: local
  network_required: false
  stores_input: false

capabilities:
  offline: true
  clipboard: true
  file_upload: false
  download: false
  shareable_state: true

input:
  - type: cidr
    example: 192.168.1.0/24

output:
  - network_address
  - broadcast_address
  - subnet_mask
  - host_range
  - host_count

related_tools:
  - ipv4-converter
  - port-lookup

related_guides:
  - understanding-cidr

related_posts: []

status: stable
```

The exact implementation format may be:

```text
YAML
JSON
TOML
front matter
data file
```

depending on the existing Hugo architecture.

Consistency matters more than the exact syntax.

---

# Required Fields

The minimum recommended fields are:

```text
id
name
url
description
category
keywords
processing.type
status
```

---

# `id`

Use a stable machine-readable identifier.

Example:

```yaml
id: jwt-decoder
```

Prefer:

```text
lowercase
hyphen-separated
short
descriptive
stable
```

Do not use:

```text
JWTDecoder123
jwt_tool_final
jwt-decoder-v2
```

The `id` should normally remain stable even if the visible title changes slightly.

---

# `name`

Human-readable tool name.

Example:

```yaml
name: JWT Decoder
```

Keep names literal.

Avoid promotional naming.

Good:

```text
JSON Formatter
CIDR Calculator
UUID Generator
HTTP Header Parser
```

Avoid:

```text
Ultimate JSON Tool
Super CIDR Utility
Developer Power Toolkit
```

---

# `slug`

Optional if derivable from `id`.

Example:

```yaml
slug: jwt-decoder
```

Do not change slugs casually because URLs should remain stable.

---

# `url`

Canonical public URL.

Example:

```yaml
url: /tools/jwt-decoder/
```

Use the final canonical path.

Do not put:

```text
temporary preview URLs
localhost URLs
deployment URLs
```

in the catalog.

---

# `description`

Describe what the tool actually does.

Good:

```yaml
description: >
  Decode the header and payload of a JSON Web Token
  directly in your browser.
```

Avoid:

```yaml
description: >
  A powerful and easy-to-use JWT solution
  for developers everywhere.
```

Descriptions should be factual, concise, and useful for search and AI retrieval.

---

# `category`

Use broad categories.

Recommended categories may include:

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

Avoid excessive categories.

Bad:

```text
JWT
Base64
IPv4
Subnetting
Watermark
JSON
```

Those are better represented as keywords.

---

# `keywords`

Keywords describe the technical concepts users may search for.

Example:

```yaml
keywords:
  - jwt
  - json web token
  - authentication
  - token
  - claims
```

Use actual concepts.

Do not add unrelated SEO keywords.

Bad:

```yaml
keywords:
  - free
  - best
  - online
  - tool
  - website
```

unless they are genuinely needed for internal search, which they usually are not.

---

# `aliases`

Aliases represent alternate names users may type.

Example:

```yaml
aliases:
  - subnet calculator
  - ip calculator
  - cidr lookup
```

Use aliases for:

- common terminology
- abbreviations
- alternative wording
- Indonesian terminology where useful

Example:

```yaml
aliases:
  - penghitung subnet
  - kalkulator cidr
```

Do not duplicate every keyword into aliases.

---

# Processing Metadata

Processing metadata is important for trust and privacy.

Recommended structure:

```yaml
processing:
  type: local
  network_required: false
  stores_input: false
```

Allowed `type` values:

```text
local
remote
hybrid
```

---

# Local Processing

Example:

```yaml
processing:
  type: local
  network_required: false
  stores_input: false
```

This may power badges such as:

```text
Runs locally
No upload
```

Only expose these labels if technically true.

---

# Remote Processing

Example:

```yaml
processing:
  type: remote
  network_required: true
  stores_input: false

  external_services:
    - name: Example API
      purpose: IP information lookup
```

If data is sent externally, document the service and purpose.

---

# Hybrid Processing

Example:

```yaml
processing:
  type: hybrid
  network_required: true
  stores_input: false

  external_services:
    - name: Example API
      purpose: Optional ASN lookup
```

Hybrid tools should not be presented as fully local.

---

# `stores_input`

This field should describe whether tool input is persisted.

Example:

```yaml
stores_input: false
```

If input is stored:

```yaml
stores_input: true

storage:
  type: localStorage
  purpose: Save recent non-sensitive preferences
```

Avoid persisting sensitive values.

---

# External Services

For remote tools:

```yaml
external_services:
  - name: ipinfo
    purpose: Retrieve network information
```

Where appropriate:

```yaml
external_services:
  - name: Google DNS
    purpose: DNS-over-HTTPS queries
    sends:
      - hostname
      - record_type
```

Do not expose private credentials.

---

# Capabilities

Capabilities describe what the tool can do.

Example:

```yaml
capabilities:
  offline: true
  clipboard: true
  file_upload: false
  download: false
  shareable_state: false
```

Useful fields may include:

```text
offline
clipboard
file_upload
download
shareable_state
drag_drop
camera
location
```

Only add fields that are useful across multiple tools.

---

# Offline

Example:

```yaml
offline: true
```

Only mark true if tested.

A local tool depending on remote CDN assets may not actually work offline.

---

# Clipboard

Example:

```yaml
clipboard: true
```

Use when output can be copied directly.

---

# File Upload

Example:

```yaml
file_upload: true
```

This does not imply files are uploaded to a server.

A file may still be processed locally.

Processing metadata must explain this separately.

---

# Download

Example:

```yaml
download: true
```

Use when the tool creates a downloadable result.

---

# Shareable State

Example:

```yaml
shareable_state: true
```

Only mark true when users can safely share tool state through URL or another mechanism.

Do not expose sensitive values in URLs.

---

# Input Definition

Inputs should describe expected data.

Simple:

```yaml
input:
  - type: jwt
```

More detailed:

```yaml
input:
  - name: token
    type: jwt
    required: true
    sensitive: true
    example: eyJhbGciOi...
```

Possible input types:

```text
text
json
jwt
url
hostname
ipv4
ipv6
cidr
number
date
timestamp
file
image
csv
xml
yaml
```

Do not invent unnecessarily narrow types if a common type works.

---

# Sensitive Inputs

Mark sensitive inputs when appropriate.

Example:

```yaml
input:
  - name: token
    type: jwt
    sensitive: true
```

Examples commonly considered sensitive:

```text
JWT
authorization header
cookies
private key
API key
logs
credentials
connection strings
EXIF metadata
```

This can help agents avoid unsafe persistence or sharing behavior.

---

# Examples

Examples must be fake and safe.

Good:

```yaml
example: 192.168.1.0/24
```

```yaml
example: example.com
```

Do not put real:

```text
production credentials
private IP inventories
customer data
real tokens
internal hostnames
```

into metadata.

---

# Output Definition

Describe the useful result types.

Example:

```yaml
output:
  - network_address
  - broadcast_address
  - subnet_mask
  - usable_host_range
```

For JSON tools:

```yaml
output:
  - formatted_json
  - validation_result
```

For file tools:

```yaml
output:
  - processed_file
```

Do not make output metadata overly detailed unless another system needs it.

---

# Status

Recommended status values:

```text
stable
experimental
deprecated
hidden
```

---

## Stable

```yaml
status: stable
```

Normal public tool.

---

## Experimental

```yaml
status: experimental
```

Public, but still evolving.

UI may display:

```text
Experimental
```

---

## Deprecated

```yaml
status: deprecated
```

Tool should normally point users toward its replacement.

Example:

```yaml
replacement: json-tool
```

Do not silently remove a tool that may have existing URLs or backlinks.

---

## Hidden

```yaml
status: hidden
```

Useful for:

- unfinished tools
- internal testing
- tools intentionally excluded from navigation

Hidden tools should generally not appear in:

```text
search
sitemap
related tools
catalog pages
```

unless intentionally configured.

---

# Related Tools

Related tools should describe real workflows.

Example:

```yaml
related_tools:
  - base64-decoder
  - unix-timestamp
  - json-formatter
```

Do not relate every tool within the same category automatically.

Prefer relationships such as:

```text
JWT Decoder
→ Base64 Decoder
→ Timestamp Converter
→ JSON Formatter
```

because those tools may naturally be used together.

---

# Related Guides

Example:

```yaml
related_guides:
  - debugging-jwt
```

Guide IDs should reference the canonical guide registry or slug.

Do not duplicate full URLs everywhere if IDs can be resolved centrally.

---

# Related Posts

Example:

```yaml
related_posts:
  - why-authentication-kept-returning-401
```

Posts should only be linked when genuinely relevant.

Do not force every tool to have a related post.

---

# Search Weight

Optional advanced field:

```yaml
search:
  boost: 1
```

Possible uses:

```text
popular tool
canonical tool for a concept
preferred result among similar utilities
```

Avoid manually tuning every tool unless needed.

Search quality should mostly come from:

```text
name
aliases
keywords
description
category
```

---

# Search Terms

Optional explicit search terms may be used when aliases are insufficient.

Example:

```yaml
search:
  terms:
    - subnetting
    - prefix length
    - netmask
```

Do not use this to stuff unrelated keywords.

---

# Language Metadata

If tools support localized search terms:

```yaml
language:
  primary: en
  search_aliases:
    id:
      - kalkulator subnet
      - hitung cidr
```

Do not duplicate full content unless localization is actually implemented.

---

# Tool Privacy Badge Generation

The UI should preferably derive badges from metadata.

Example:

```yaml
processing:
  type: local
  network_required: false
  stores_input: false

capabilities:
  offline: true
```

May produce:

```text
Runs locally
No upload
Works offline
```

Do not manually write these claims in multiple places if they can be generated.

This reduces inconsistencies.

---

# Example: JWT Decoder

```yaml
id: jwt-decoder

name: JWT Decoder

slug: jwt-decoder

url: /tools/jwt-decoder/

description: >
  Decode the header and payload of a JSON Web Token
  directly in your browser.

category: Developer

keywords:
  - jwt
  - json web token
  - token
  - claims
  - authentication

aliases:
  - jwt parser
  - jwt reader
  - token decoder

processing:
  type: local
  network_required: false
  stores_input: false

capabilities:
  offline: true
  clipboard: true
  file_upload: false
  download: false
  shareable_state: false

input:
  - name: token
    type: jwt
    required: true
    sensitive: true
    example: eyJhbGciOi...

output:
  - header
  - payload
  - claims

related_tools:
  - base64-decoder
  - unix-timestamp
  - json-formatter

related_guides:
  - debugging-jwt

related_posts: []

status: stable
```

---

# Example: JSON Formatter

```yaml
id: json-formatter

name: JSON Formatter

url: /tools/json-formatter/

description: >
  Format, validate, and inspect JSON directly in your browser.

category: Data

keywords:
  - json
  - formatter
  - pretty print
  - validate
  - minify

aliases:
  - json beautifier
  - pretty json
  - json validator

processing:
  type: local
  network_required: false
  stores_input: false

capabilities:
  offline: true
  clipboard: true
  download: true
  shareable_state: false

input:
  - name: json
    type: json
    required: true

output:
  - formatted_json
  - validation_result
  - minified_json

related_tools:
  - json-to-yaml
  - base64-decoder

related_guides:
  - working-with-json

status: stable
```

---

# Example: IP Information Tool

```yaml
id: ip-information

name: IP Information

url: /tools/ip-information/

description: >
  Look up public network information for an IP address.

category: Networking

keywords:
  - ip
  - asn
  - isp
  - network
  - geolocation

aliases:
  - ip lookup
  - ip info
  - asn lookup

processing:
  type: remote
  network_required: true
  stores_input: false

  external_services:
    - name: Example IP API
      purpose: Retrieve network metadata
      sends:
        - ip_address

capabilities:
  offline: false
  clipboard: true
  shareable_state: true

input:
  - name: ip
    type: ipv4
    required: true
    sensitive: false
    example: 8.8.8.8

output:
  - asn
  - organization
  - country
  - network

related_tools:
  - cidr-calculator
  - ipv4-converter

status: stable
```

---

# Example: EXIF Cleaner

```yaml
id: exif-cleaner

name: EXIF Cleaner

url: /tools/exif-cleaner/

description: >
  Remove metadata from images directly in your browser.

category: Privacy

keywords:
  - exif
  - metadata
  - image
  - privacy
  - remove metadata

aliases:
  - metadata remover
  - image metadata cleaner

processing:
  type: local
  network_required: false
  stores_input: false

capabilities:
  offline: true
  clipboard: false
  file_upload: true
  download: true
  shareable_state: false

input:
  - name: image
    type: image
    required: true
    sensitive: true

output:
  - cleaned_image

related_tools:
  - image-metadata-viewer

related_guides:
  - removing-private-image-metadata

status: stable
```

---

# Machine-Readable Catalog

Where practical, generate a public machine-readable catalog.

Possible endpoint:

```text
/tools/index.json
```

or:

```text
/tools.json
```

Example:

```json
[
  {
    "id": "jwt-decoder",
    "name": "JWT Decoder",
    "url": "/tools/jwt-decoder/",
    "description": "Decode the header and payload of a JSON Web Token.",
    "category": "Developer",
    "processing": {
      "type": "local",
      "network_required": false
    }
  }
]
```

The public version does not need to expose every internal field.

Keep it lightweight.

---

# AI Discovery

The catalog can also help AI agents answer:

```text
Which ilham.dev tool can calculate CIDR?

Does the JWT decoder upload tokens?

Which networking tools are available?

Which tools can work offline?

Is there a guide related to this tool?
```

For AI-facing output, factual metadata is more useful than marketing copy.

---

# Catalog Validation

The build process should ideally detect invalid metadata.

Possible validation rules:

```text
id must be unique
url must be unique
category must be allowed
processing.type must be valid
related tool IDs must exist
related guide IDs should exist
status must be valid
```

Warnings may be generated for:

```text
tool without description
tool without keywords
remote tool without external service details
sensitive input with persistent storage
offline=true while network_required=true
```

Some combinations may be legitimate, so warnings should not always block builds.

---

# Useful Consistency Checks

Detect:

```text
duplicate tool names
duplicate aliases
broken related-tool references
unused categories
missing privacy metadata
deprecated tools without replacement
hidden tools appearing in search
```

---

# Category Registry

Maintain a controlled category list.

Example:

```yaml
categories:
  - Developer
  - Networking
  - Data
  - Security
  - Privacy
  - Text
  - Image
  - File
  - Finance
  - Utilities
  - Indonesia
```

Do not let agents create a new category without checking whether an existing category fits.

---

# Relationship Rules

A tool may relate to:

```text
0..n tools
0..n guides
0..n posts
```

No related content is better than irrelevant related content.

Do not create filler relationships.

---

# Adding a New Tool

Before adding metadata:

1. Search the catalog for similar tools.
2. Decide whether this should be a new tool or an extension of an existing one.
3. Select an existing category.
4. Define processing behavior.
5. Identify sensitive inputs.
6. Define keywords and aliases.
7. Add genuine relationships.
8. Validate metadata.
9. Verify that visible UI claims match catalog metadata.

---

# Removing a Tool

Do not simply delete its catalog entry.

First determine whether the tool has:

```text
existing links
search traffic
backlinks
guide references
post references
related tool references
```

When replacing a tool:

```yaml
status: deprecated
replacement: new-tool-id
```

and redirect the old URL when appropriate.

---

# Agent Rules

AI agents must:

- inspect the existing catalog before creating tools
- reuse existing categories
- avoid duplicate tools
- preserve stable IDs and URLs
- accurately classify local/remote/hybrid processing
- never fabricate privacy claims
- never mark a tool offline without evidence
- mark sensitive input correctly
- use safe fake examples
- avoid random related-tool links
- validate references before finishing

Agents should not create metadata simply because a field exists.

Unknown is better than false.

---

# Recommended Catalog Flow

```text
Tool implementation
        ↓
Metadata entry
        ↓
Validation
        ↓
Tool page
        ↓
Search index
        ↓
Related tools
        ↓
Privacy badges
        ↓
AI-readable catalog
```

Metadata should reduce duplication, not create more maintenance work.

---

# Definition of Done

A catalog entry is complete when:

- [ ] ID is unique
- [ ] Name is accurate
- [ ] Canonical URL is correct
- [ ] Description is factual
- [ ] Category is valid
- [ ] Keywords are relevant
- [ ] Aliases are useful
- [ ] Processing model is correct
- [ ] Network behavior is documented
- [ ] Storage behavior is documented
- [ ] Sensitive inputs are marked
- [ ] Capabilities are accurate
- [ ] Related tools exist
- [ ] Related guides exist where referenced
- [ ] Status is correct
- [ ] Examples contain no real sensitive data
- [ ] UI privacy claims match metadata

---

# Final Principle

The catalog should describe reality.

Do not make the implementation fit attractive metadata.

Make the metadata accurately describe the implementation.

The goal is:

> One reliable source that explains what every ilham.dev tool does, how it behaves, and how it relates to the rest of the site.
