# Design System

This document defines the visual and interaction principles for **ilham.dev**.

The goal is not to create a large component framework.

The goal is to keep the site:

- consistent
- fast
- readable
- technical
- calm
- easy to maintain

Design should support the content and tools rather than compete with them.

---

# Design Identity

ilham.dev should feel:

```text
minimal
technical
personal
practical
quiet
fast
```

It should not feel like:

```text
a SaaS landing page
a marketing template
a startup dashboard
a design showcase
a generic utility portal
```

---

# Core Principle

When choosing between:

```text
more decorative
```

and:

```text
clearer
```

prefer clearer.

When choosing between:

```text
more complex
```

and:

```text
easier to understand
```

prefer easier to understand.

---

# Existing Patterns First

Before creating a new UI pattern:

1. Inspect existing components.
2. Check whether a current pattern already solves the problem.
3. Reuse existing spacing and typography.
4. Avoid introducing a second visual language.

Do not redesign one page in isolation.

---

# Visual Hierarchy

The hierarchy should generally be:

```text
Page title
Short description
Primary interaction/content
Secondary information
Related content
Footer/navigation
```

Do not make low-priority metadata visually stronger than the main content.

---

# Layout

Use a predictable content container.

Long-form content should use a comfortable reading width.

Tools may use wider layouts when necessary.

Avoid making normal paragraphs span the full width of large displays.

---

# Content Width

Prefer narrower widths for:

```text
posts
guides
about
documentation
```

Wider layouts may be appropriate for:

```text
tables
comparisons
tool input/output
code-heavy interfaces
```

Do not widen the whole site just because one tool needs more space.

---

# Spacing

Use consistent spacing increments.

Conceptually:

```text
xs
sm
md
lg
xl
2xl
```

Do not introduce arbitrary spacing values for every component.

Common relationships should feel consistent:

```text
label → input
heading → paragraph
section → section
card content → card edge
```

---

# Vertical Rhythm

Content should breathe without becoming excessively spacious.

Avoid:

- huge empty gaps
- cramped text
- inconsistent section separation

Long-form content should have predictable vertical rhythm.

---

# Typography

Keep typography simple.

Primary roles:

```text
page title
section title
subsection title
body
small/meta
monospace
```

Do not create many nearly identical text styles.

---

# Body Text

Body text should prioritize readability.

Avoid:

- very small sizes
- extremely light weights
- low contrast
- overly wide lines

Paragraph spacing should support scanning.

---

# Headings

Headings should represent structure, not decoration.

Use:

```text
H1
H2
H3
```

according to document hierarchy.

Do not choose heading tags purely based on size.

---

# Monospace

Use monospace consistently for:

```text
commands
code
IP addresses
hostnames
paths
identifiers
configuration values
tokens/examples
```

Do not use monospace for large amounts of normal prose.

---

# Links

Links should be visually identifiable.

Avoid hiding links so well that users cannot distinguish them from normal text.

Use consistent hover and focus behavior.

---

# Navigation

Primary navigation should remain simple.

Conceptually:

```text
About
Posts
Guides
Tools
```

Do not add every category or tag to the primary navigation.

---

# Mobile Navigation

Mobile navigation should:

- be easy to open
- be easy to close
- support keyboard navigation
- not cover essential controls unexpectedly

Do not create complex nested menus unless necessary.

---

# Homepage

The homepage should introduce:

```text
who Ilham is
what he works on
what visitors can find
```

Do not turn the homepage into a complete tool catalog.

Use selected content rather than everything.

---

# Tool Pages

Tool interfaces should prioritize:

```text
input
action
result
```

Supporting explanations belong below or around the tool without delaying access.

Avoid giant hero sections above utilities.

---

# Guide Pages

Guides should prioritize reading.

Use:

- clear headings
- readable paragraphs
- code blocks
- callouts only where useful

Avoid excessive card-based layouts in long-form technical writing.

---

# Post Pages

Personal posts should feel like writing, not documentation dashboards.

Avoid over-structuring every paragraph into separate visual containers.

---

# Cards

Cards are appropriate for grouping things such as:

```text
tool entries
related content
summary results
featured items
status information
```

Avoid placing every text block inside a card.

Too many cards reduce visual hierarchy.

---

# Card Consistency

Cards should share consistent:

```text
padding
border style
radius
hover behavior
background behavior
```

Do not create a different card style for every page.

---

# Buttons

Use clear action hierarchy.

Recommended conceptual levels:

```text
Primary
Secondary
Ghost/Text
Danger
```

A small section should normally have one obvious primary action.

---

# Button Labels

Prefer explicit verbs:

```text
Decode
Format
Calculate
Convert
Generate
Copy
Clear
Download
```

Avoid:

```text
Submit
Proceed
Click here
Go
```

when a clearer verb exists.

---

# Button Size

Buttons should be comfortably clickable on touch devices.

Avoid tiny icon-only targets.

Where icon-only buttons are used:

- provide accessible labels
- keep hit area large enough
- make purpose obvious

---

# Destructive Actions

Destructive actions should be visually distinguishable.

Examples:

```text
Delete
Remove
Reset all
Clear stored data
```

Do not use danger styling for normal actions.

---

# Inputs

Every meaningful input should have a visible label.

Use placeholders as examples, not labels.

Good:

```text
IPv4 address

192.168.1.10
```

Avoid:

```text
[ Enter value here ]
```

with no visible context.

---

# Input States

Inputs should support:

```text
default
hover
focus
disabled
error
success where appropriate
```

Focus states must remain visible.

---

# Textareas

Large text inputs should be comfortable for:

```text
JSON
logs
JWT
headers
configuration
text transformations
```

Allow enough vertical space for the task.

Avoid tiny textareas for inherently multiline input.

---

# Selects

Use native or established project select patterns where possible.

Do not create custom dropdown implementations without a clear need.

---

# Error States

Errors should be:

- noticeable
- readable
- calm
- specific

Do not use aggressive full-screen error styling for simple validation problems.

---

# Success States

Use success feedback sparingly.

Examples:

```text
Copied
File generated
Validation passed
```

Avoid celebratory animations for normal utility actions.

---

# Empty States

Explain what the user should do.

Good:

```text
Paste a JWT above to inspect its header and payload.
```

Avoid leaving a blank result panel with no explanation.

---

# Loading States

Only show loading indicators when there is meaningful waiting time.

Do not add artificial loading animations to instant local tools.

---

# Badges

Badges may communicate:

```text
Runs locally
No upload
External API
Offline
Experimental
```

Keep badge styling consistent.

Do not overload pages with badges.

---

# Privacy Badges

Privacy labels should appear where useful, especially on tools handling sensitive data.

Badges should reflect real implementation behavior.

Do not display:

```text
Secure
Private
Anonymous
```

as vague marketing claims.

---

# Code Blocks

Code blocks should be easy to read and copy.

Consider:

- readable line height
- horizontal scrolling
- copy button
- sufficient contrast
- sensible padding

Do not shrink code text excessively to avoid scrolling.

---

# Copy Button

Use a consistent copy interaction.

After copying:

```text
Copy
→
Copied
```

or equivalent subtle feedback.

Do not use blocking browser alerts.

---

# Inline Code

Use inline code for:

```text
filenames
commands
paths
config keys
short code expressions
```

Avoid turning ordinary words into code styling.

---

# Tables

Use tables when the information is genuinely tabular.

Avoid using tables for:

- simple two-item comparisons
- normal lists
- layout

Tables should remain usable on mobile.

---

# Responsive Tables

For wide tables:

- allow horizontal scrolling
- preserve readable cell content
- avoid destroying the information structure

Do not compress columns until content becomes unreadable.

---

# Color

Use the established palette.

Do not introduce arbitrary colors for individual tools.

Color should usually communicate:

```text
brand
information
success
warning
error
interaction
```

---

# Semantic Color

Do not rely solely on color.

For example, an error should include:

```text
icon or label
+
message
+
color
```

not just red text.

---

# Contrast

Ensure text, controls, borders, and focus states have sufficient contrast.

Pay special attention to:

```text
muted text
disabled controls
code blocks
badges
dark mode borders
```

---

# Light and Dark Mode

If both modes are supported, every new component must work in both.

Verify:

- text
- borders
- surfaces
- code blocks
- inputs
- focus states
- hover states
- badges
- errors

Do not build light-mode-only components.

---

# Theme Preference

Respect existing site behavior for theme preference.

Do not introduce a second competing theme system.

---

# Icons

Use icons only when they improve recognition.

Avoid icon-only interfaces where text would be clearer.

Icons should come from existing project conventions.

Do not import a large icon library for one icon.

---

# Decorative Graphics

Decorative visuals should not dominate utility.

Avoid unnecessary:

```text
gradients
glows
3D effects
floating blobs
complex backgrounds
```

unless they are already part of the established identity.

---

# Animation

Animation should support understanding or feedback.

Good:

```text
small hover transition
copy confirmation
loading state
menu transition
```

Avoid:

```text
large entrance animations
continuous motion
scroll gimmicks
animated backgrounds
```

---

# Reduced Motion

Respect reduced-motion preferences where practical.

Do not require animation to understand the interface.

---

# Hover

Hover behavior should never be the only way to discover important information.

Touch users do not have hover.

---

# Focus

Keyboard focus must remain clearly visible.

Do not globally remove:

```css
outline
```

without providing an equally visible alternative.

---

# Accessibility

Prefer native HTML behavior.

Use:

```html
<button>
<input>
textarea
select
details
summary
```

where appropriate.

Do not recreate native interactions unnecessarily.

---

# ARIA

Use ARIA when native HTML cannot express the interaction correctly.

Do not add redundant or incorrect ARIA attributes.

Incorrect ARIA is often worse than no ARIA.

---

# Keyboard Support

Interactive UI should be usable with keyboard navigation.

Check:

```text
Tab
Shift+Tab
Enter
Space
Escape
```

where appropriate.

---

# Mobile

Every significant page and tool must work on small screens.

Review at least:

```text
320px
375px
768px
desktop
```

---

# Mobile Layout

Side-by-side desktop layouts should generally stack when narrow.

Desktop:

```text
Input | Output
```

Mobile:

```text
Input
Output
```

Do not preserve cramped multi-column layouts.

---

# Horizontal Overflow

Common sources:

```text
code blocks
long URLs
tables
tool results
badges
button groups
```

Contain overflow intentionally.

Do not let the entire page scroll horizontally.

---

# Touch Targets

Interactive controls should have comfortable hit areas.

Do not make critical controls tiny just to save space.

---

# Sticky UI

Use sticky elements sparingly.

Avoid persistent UI that covers content on small screens.

---

# Modals

Avoid modals when inline UI is sufficient.

If a modal is necessary:

- focus should move into it
- Escape should close it where appropriate
- focus should return afterward
- mobile layout must remain usable

---

# Tool Result Layout

Tool results should favor scanability.

Example:

```text
Network
192.168.1.0

Broadcast
192.168.1.255

Hosts
254
```

Prefer clear labels over dense raw output.

---

# Data Density

Technical tools may contain dense data.

Do not over-simplify important technical information.

Instead improve:

```text
grouping
labels
spacing
hierarchy
```

---

# Progressive Disclosure

Advanced settings may be hidden behind:

```text
Advanced
More options
Details
```

when basic users do not need them.

Do not make basic functionality depend on opening advanced panels.

---

# Defaults

Choose useful defaults.

Avoid forcing users to configure every option before using a tool.

---

# Consistency Over Novelty

The same action should generally look the same throughout the site.

For example:

```text
Copy
Clear
Download
```

should not use completely different patterns across tools.

---

# Component Reuse

Before creating:

```text
new button
new badge
new card
new form layout
new alert
```

check whether an existing component already handles it.

---

# Design Tokens

Where the codebase supports them, use shared tokens for:

```text
spacing
radius
font size
border
surface
text
accent
success
warning
error
```

Avoid hardcoding random values repeatedly.

---

# Border Radius

Use a small consistent set of radius values.

Do not mix:

```text
2px
5px
7px
11px
17px
26px
```

without reason.

---

# Borders

Borders should help separation without making every element visually heavy.

Avoid boxing every section.

Whitespace may be enough.

---

# Shadows

Use shadows sparingly.

The site should not depend on deep card shadows for hierarchy.

Prefer subtle boundaries.

---

# Dividers

Dividers are useful for structural separation.

Do not add a divider between every paragraph or component.

---

# Footer

Footer should remain simple and useful.

Potential links:

```text
About
Posts
Guides
Tools
GitHub
RSS
llms.txt
```

Do not turn the footer into another large navigation system.

---

# Search UI

Search should be quick and obvious.

For tool search:

- input should be easy to find
- results should update predictably
- empty state should help
- keyboard behavior should work

Do not over-design search.

---

# Search Results

Results should emphasize:

```text
tool name
short purpose
category when useful
```

Avoid excessive metadata in each result.

---

# Related Content

Related content should be visually secondary to the main page.

It should help the next step, not interrupt the current one.

---

# External Links

External links should look like links.

If the site uses an external-link indicator, apply it consistently.

Do not add excessive warning UI to normal external links.

---

# Empty Pages

Do not publish visually complete pages whose actual content or tool is missing.

A polished "Coming Soon" page usually does not need to exist.

---

# Experimental Features

Experimental tools may use a subtle:

```text
Experimental
```

badge.

Do not redesign the whole tool around the experimental state.

---

# Performance

Design decisions should preserve performance.

Avoid:

- heavy animation libraries
- large icon packs
- unnecessary web fonts
- large images
- client-side layout frameworks for simple pages

---

# Fonts

Use the existing font strategy.

Do not introduce new font families for individual sections.

If remote fonts are used, consider performance and fallback behavior.

---

# Images

Use images when they genuinely help understanding.

Do not add stock-like decorative images to technical articles just to fill space.

---

# Screenshots

Screenshots should:

- focus on relevant UI
- remove sensitive data
- remain readable
- avoid unnecessary browser chrome where possible

---

# Responsive Images

Serve appropriately sized images when the project architecture supports it.

Avoid loading desktop-size images unnecessarily on mobile.

---

# Design Review Questions

Before shipping a UI change, ask:

```text
Does this solve a real usability problem?

Does it match existing pages?

Is it simpler than the previous version?

Does it work on mobile?

Does it work with keyboard navigation?

Does it work in dark and light mode?

Does it add useful information?

Does it introduce unnecessary dependencies?
```

---

# Tool Review Checklist

For tool UI changes:

- [ ] Purpose is immediately clear
- [ ] Input labels are visible
- [ ] Primary action is obvious
- [ ] Error state is useful
- [ ] Empty state is useful
- [ ] Output is readable
- [ ] Copy/download is available where useful
- [ ] Privacy status is visible where relevant
- [ ] Mobile works
- [ ] Keyboard navigation works
- [ ] No horizontal page overflow
- [ ] Dark/light modes work

---

# Long-Form Content Checklist

For posts and guides:

- [ ] Reading width is comfortable
- [ ] Heading hierarchy is clear
- [ ] Paragraphs are readable
- [ ] Code blocks are usable
- [ ] Links are identifiable
- [ ] Tables work on small screens
- [ ] Callouts are not overused
- [ ] Related content does not dominate the article

---

# Homepage Checklist

- [ ] Ilham's identity is clear
- [ ] Engineering focus is clear
- [ ] Tools do not dominate everything
- [ ] Primary navigation is simple
- [ ] Featured content is curated
- [ ] Homepage is not a complete directory dump
- [ ] Mobile hierarchy remains clear

---

# Agent Rules

AI agents working on design must:

1. Inspect current components before creating new ones.
2. Reuse existing patterns.
3. Keep scope focused.
4. Avoid generic SaaS aesthetics.
5. Avoid introducing large dependencies.
6. Verify responsive behavior.
7. Preserve accessibility.
8. Preserve performance.
9. Avoid changing unrelated visual styles.
10. Prefer functional clarity over visual novelty.

---

# Do Not

Do not:

```text
redesign the whole site for one feature
add gradients everywhere
introduce excessive animation
use card layouts for every section
make all buttons primary
hide labels inside placeholders
remove keyboard focus
rely only on color
make desktop-only layouts
add decorative dependencies
```

---

# Definition of Done

A design change is complete when:

- [ ] It matches existing site identity
- [ ] It improves usability or clarity
- [ ] It works on mobile
- [ ] It works with keyboard navigation
- [ ] It has visible focus states
- [ ] It works in supported themes
- [ ] It does not introduce unnecessary dependencies
- [ ] It does not cause horizontal page overflow
- [ ] It preserves performance
- [ ] It uses existing patterns where possible
- [ ] It remains understandable without animation
- [ ] It does not make the site feel more generic

---

# Final Principle

The design system for ilham.dev should make the interface disappear behind the usefulness of the site.

The ideal reaction is not:

> This website has a lot of design.

It is:

> This is easy to read, easy to use, and everything feels like it belongs here.
