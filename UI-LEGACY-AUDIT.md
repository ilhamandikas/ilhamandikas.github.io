# Legacy UI audit

This follows the shared UI rules in `AGENTS.md`, `DESIGN-SYSTEM.md`, and
`PLAYGROUND-ARCHITECTURE.md`. The goal is to remove application-authored inline
CSS without hiding the same writes behind a CSSOM helper or changing tool themes.

## Completed in this pass

- Catalog and sidebar search no longer write or read `style.order`.
  `assets/js/dom-order.js` moves existing nodes and restores their original parents
  and sibling positions. It also preserves focus. Search scores and keyword
  matching still come from the existing `tools-search.js` implementation.
- Catalog results keep categories, ordered by their best match, with matching
  cards ordered inside each category. Clearing restores the original DOM order.
- Sidebar search uses one flat list of ranked rows, so visual, keyboard, and
  screen-reader order agree. Clearing restores the original category lists;
  query/scroll session memory is unchanged.
- JSON Diff and Text Diff use the existing `tool-grid-2` layout instead of inline
  `flex:1`. Narrow screens stack the inputs using the global grid rules.
- CSV Viewer uses a wrapping `tool-row` and a visibly labelled filter field with
  the shared `tool-grow` layout utility instead of an inline width.
- Hash Text uses the standard action row instead of an inline button margin.
- Case Converter uses native DOM creation, associated labels, and the shared
  `tool-result-row` layout instead of an HTML string with inline styles. Input
  values are assigned as values, not interpolated into markup.
- `assets/js/tools/playground.js` is now the clearly named shared runner.
  All six language entrypoints are compatibility aliases importing it. Existing
  tool URLs, metadata paths, and language entrypoint filenames remain unchanged.

## Regression coverage

`scripts/domtest/dom-order.cjs` checks reordered nodes, original parents/siblings,
repeated restoration, preserved focus, and absence of inline CSS in the migrated
files. It runs through `npm run test:dom` using existing dependencies.
Catalog/sidebar E2E checks inspect real DOM order rather than reproducing CSS order
sorting in test code. Playground tests bundle the compatibility entrypoint and
also guard the shared runner against authored inline CSS.

The DevOps E2E fixture cleanup was also moved inside its owning block, fixing a
pre-existing `ReferenceError: dt is not defined` that stopped the rest of E2E.

Run the existing validation commands:

```sh
hugo --gc --minify
npm run test:dom
npm run check:ai
git diff --check
```

Browser checks should cover catalog/sidebar filtering, clear/restore, Arrow keys,
Enter, no-result searches, repeated queries, and 320/375/768px layouts for the
migrated utilities. Native/fallback fullscreen and terminal input must continue to
work after the runner rename.

## Validation record

- Hugo build, the complete E2E assertion suite, DOM ordering checks, playground
  unit/bridge tests, AI compatibility, and whitespace checks passed.
- Chromium verified search/reset/Arrow-key ordering, safe labelled case output,
  and the five migrated utility layouts at 320, 375, 768 and 1280px.
- Chromium also passed terminal input and viewport-fit checks for all six runtimes,
  including native/fallback fullscreen and prepared-input recovery.
- The monolithic DOM run exhausted Node's default heap in this environment.
  The unchanged smoke-test logic passed for all tool pages when run in five
  sequential batches, each in a fresh process.
- A clean staged-tree snapshot was used for broad regression checks because the
  shared worktree contained concurrent, unfinished tool additions whose content
  counts did not yet match the built catalog. Those additions are not part of
  this change.

## Dynamic indicators — stage 1 completed

Mic Tester, Gamepad Tester, and DevOps Tycoon now share `tk.gauge()` in
`assets/js/tool-charts.js`, built with the existing `tk.svgEl()` helper. The SVG
fill width and pointer position are geometry attributes, not CSS. All appearance
comes from `.tool-gauge` in the existing central CSS bundle and global palette.
No new dependency, stylesheet request, network call, or persisted input was added.

The shared component covers fill-only, fill/peak, and signed-axis pointer tracks.
SVG is useful here because the same component can render a held peak and a
fixed-pixel round pointer on a responsive track. Gauges are decorative and hidden
from assistive technology; the existing labelled HTML numeric readings remain the
accessible source of measurements, without frame-by-frame live announcements.

- Microphone RMS/dBFS calculations, -60 dBFS floor, peak-held clipping, recording,
  permission handling, Stop, restart, and page-exit track cleanup are unchanged.
- Gamepad axes still map -1/0/+1 to the left/center/right of the track. The pointer
  remains round and fixed-size at every viewport width. Disconnect now forces a
  repaint even when the resulting controller list is empty, fixing stale rows.
- DevOps values are clamped visually to 0–100%, while numeric readings may still
  show overload. Warning remains strictly above 70%, critical strictly above 90%.
  Simulation rules, purchases, incidents, and reset behavior are unchanged.
- Shared tokens replace legacy hardcoded indicator surfaces and warning colors.
  The old DevOps-only width transition is not retained; measurement geometry
  updates directly, without adding motion or a competing gauge theme.

`scripts/domtest/tool-gauges.cjs` is included in `npm run test:dom`. It exercises
bounds and invalid numeric values, peak hold, permission denial, recording/Stop,
restart and exit cleanup, axis positions/reconnect, warning boundaries, reset,
and the no-authored-inline-CSS guard.

Chromium checks passed at 320, 375, 768 and 1280px in light and dark themes, with
no page overflow or console errors. Microphone/recording checks used Chromium's
fake media device; controller checks used simulated Gamepad API readings. These
are not a claim of physical microphone/controller or Safari/Firefox validation.
The Hugo build, complete E2E suite, all-page smoke test in five sequential batches,
shared gauge/ordering tests, playground/bridge regressions, and AI compatibility
checks also passed against an isolated snapshot of the scoped changes.

## Game grids and staggered motion — stage 2 completed

- Snake and Tetris boards use fixed 20/10-column declarations in the global game
  CSS. The duplicate JavaScript CSS-variable assignments were removed.
- Memory Match selects 4/6 columns and Minesweeper 9/12/16 through a bounded
  `data-columns` attribute. Existing difficulty definitions remain the source of
  logical board dimensions. Unsupported select values still fall back to Easy.
- Tetris previews select 2/3/4-column layouts with the same attribute. Empty Hold
  previews remove the attribute on reset; gameplay, shape matrices and input
  controls are unchanged.
- The two Difficulty labels now wrap their existing select controls when needed,
  fixing the Minesweeper field's overflow at 320px without changing its options.
- `.stagger-step-0` through `.stagger-step-19` are shared, static global classes.
  Only CSS defines `--stagger-step`; JavaScript selects a bounded class and never
  writes a CSS variable or generates stylesheet rules.
- Random results keep their existing maximum of 20 items and 55ms delay per step.
  Each fetched post batch restarts at step zero, caps at step five, and keeps its
  28ms delay per step. Both animations remain inside their existing
  `prefers-reduced-motion: no-preference` rules.
- Fetch URLs, pagination, failure fallback, chooser timing, privacy, storage and
  dependencies are unchanged. No new stylesheet request was introduced.

`scripts/domtest/game-layout-motion.cjs` runs through `npm run test:dom`. It checks
all board sizes and reset, safe first Minesweeper reveal, all Tetris preview sizes
and Hold reset, bounded/unique random results, post batch restart/capping,
concurrent-load protection and end-of-pagination cleanup, plus no inline CSS.

Chromium checks passed for all difficulty layouts at 320, 375, 768 and 1280px in
light/dark themes, fixed boards and preview geometry, exact random/post animation
delays and reduced motion. Post pagination was exercised with a synthetic batch
fixture, since the current public posts list has no next page. Hugo build, the
complete E2E suite, all-page smoke test in five sequential batches, shared
ordering/gauge checks, playground/bridge regressions, and AI compatibility also
passed against an isolated snapshot of this change.

## Companion geometry and visibility — stage 3 completed

The companion no longer reads or writes element styles. Continuous drag positions
cannot sensibly be represented by thousands of CSS classes, so the static partial
now wraps the existing native HTML aside/button/guide link in a presentational
SVG `foreignObject`. Its `x`, `y`, `width` and `height` geometry attributes own the
position and hit-box size. The fixed outer SVG is pointer-transparent; only the
existing companion controls receive pointer events. It is not `aria-hidden`, so
native controls remain in the accessibility tree.

Responsibilities are split rather than adding another style wrapper:

| Module | Responsibility |
| --- | --- |
| `mascot-position.js` | Native geometry, interrupted-dock freeze and temporary dock effect |
| `mascot-spring.js` | Existing head/tail physics, SVG group rotation and flexible-wire geometry |
| `mascot-visibility.js` | Full/peek layout measurement and temporary visibility effects |
| `search-mascot.js` | Existing interaction, gaze, message/guide and lifecycle orchestration |

- Spring rotation is an SVG group `transform`, separate from the existing CSS
  expression/peek transforms. No animation-frame loop remains after settling.
- Visibility measurements use the existing `is-transitioning` class with rules
  in the central stylesheet instead of temporarily rewriting art/main styles.
  Cancellation and completion remove the class and `data-visibility-motion`.
- Docking and fold/unfold use bounded Web Animations effects. These are temporary
  animation effects, not injected CSS rules or persistent coordinates. Completion,
  resize, reduced motion, page exit and hidden-tab handling cancel the effects;
  native SVG geometry remains the final state. Browsers without `animate()` snap
  to that state without a lingering docking class.
- Mouse/pointer capture, nearest-edge docking, edge-hide threshold, touch edge
  zone, keyboard moves/H/Enter, peek, expressions, quote/invitation behavior,
  viewport/safe-area clamping and presentation-only storage are preserved.
- Touch taps explicitly activate within `pointerup`, ignoring a duplicate native
  compatibility click. Chromium sometimes omitted that click after a captured
  drag in both the old and new implementations; a new tap can now reliably reveal
  the tucked control, without accidentally opening search twice.
- Hidden-tab handling cancels in-progress gestures. A persisted `pageshow`
  recalculates the dock before replaying the existing arrival effect.

The controller is still a large existing orchestrator (over the 400-line review
trigger). This pass extracts geometry/physics only; unrelated quote, invitation,
expression and gaze policy was not broadly rewritten just to reduce line count.

`mascot-motion.mjs` adds deterministic geometry, namespace, cancellation,
completion/fallback and animation-frame-budget tests. The existing companion,
quote and cat tests now run in `npm run test:dom`, with inline-CSS guards and touch
tap deduplication assertions.

Chromium checks passed for real mouse drag/interrupted docking, SVG rotation,
keyboard focus and accessibility-tree exposure, hide/show, remembered state,
320/375/768/1280px light/dark layouts, reduced motion, emulated touch drag/tap,
page exit, a pointer-reachable/clickable guide link outside the anchor box, and
underlying page clicks/wheel scrolling. All six playground viewport/fullscreen
checks also passed. This does not replace real-device Safari/iOS or Firefox
validation; in particular, verify native touch scrolling and foreignObject
painting/hit-testing there before treating cross-browser behavior as verified.

The clean scoped snapshot also passed Hugo build, the complete E2E suite,
all-page smoke tests in five sequential processes, all companion/quote/cat/motion
tests, shared ordering/gauge/game-motion regressions, playground/bridge tests,
and AI compatibility. At this stage, the audit scan found only the Color Converter
parsing probe among the previously identified authored element-style accesses;
that separate migration is recorded in stage 4 below.

## Color parsing — stage 4 completed

Color Converter uses a lazily created, detached 1×1 Canvas 2D context to parse
colors. It reads the native `fillStyle` serialization, never pixel data, so it
does not lose transparent RGB channels or introduce an extra 8-bit-alpha
readback round trip. No probe is attached to the page and no element styles are
written. The context is reused; empty input does not allocate it.

Canvas ignores invalid fill assignments, so validation assigns each input from
two different starting colors and compares the resulting serialization. This
rejects invalid input without mistaking either sentinel for an invalid color.
HEX/RGB serialization is decoded into the existing output/conversion functions;
no replacement HSL/named-color grammar or dependency was introduced. Standalone
`currentColor` and CSS-wide inheritance/reset keywords retain the old body-child
semantics through read-only computed-style access.

Compatibility is scoped explicitly rather than promising “any CSS color”:

- HEX (including shorthand/alpha), RGB/RGBA, HSL/HSLA, named colors, transparent
  channels, normal whitespace/case, supported HWB and channel clamping remain.
- Wide-gamut/perceptual serialization such as `color(display-p3 ...)`, `lab(...)`
  and `oklch(...)` still produces a helpful unsupported-format error. The old
  implementation also rejected these because it only understood computed RGB.
- Stylesheet-dependent expressions such as `var(--accent)` and `light-dark(...)`
  now explicitly produce an error. Some previously resolved through the page's
  stylesheet. Preserving arbitrary CSS evaluation would require another style
  probe or a substantially larger evaluator, neither appropriate for this small
  converter. The UI and guide disclose this intentional boundary.
- The guide's old preview/nearest-name claims were removed: the existing tool
  presents text formats, not those features. Input, output, privacy, copy controls
  and public URLs otherwise remain unchanged.

Native Chromium compared 496 supported-input/theme cases against the previous
parser with identical results, including low/zero alpha and both sentinel colors.
Live input/error/recovery/empty states and 320/375/768/1280px light/dark layouts
passed. `color-converter.mjs` adds automated coverage for empty/context reuse, normalized
formats/alpha, validation/recovery, no DOM probes/styles, and unavailable Canvas.
The color-page-only jsdom Canvas stub is not evidence of native browser support;
Chromium checks exercise the real Canvas implementation.

A clean scoped snapshot passed Hugo build, the complete E2E suite, all-page smoke
checks in five sequential processes, the Color Converter test, shared
ordering/gauge/game-motion/companion regressions, playground/bridge tests, AI
compatibility and whitespace checks. Safari/iOS and Firefox remain unverified.

Reference: [HTML Canvas fill/stroke parsing and serialization](https://html.spec.whatwg.org/multipage/canvas.html#fill-and-stroke-styles).

## Remaining work — not claimed complete

The previously identified application-authored element-style writes in
`assets/js/` and tool/layout partials have been migrated. No CSSOM rule injection
or generated positioning stylesheet was introduced. Cross-browser/device checks
below remain outstanding; this is not a claim that every runtime dependency or
external application is free of its own style generation.

Do not mechanically replace dynamic CSS variables with generated CSS rules or a
wrapper around `.style`; that would keep the same problem. Validate each migration
against its actual behavior. Presentation attributes for SVG geometry and native
canvas drawing are not inline CSS.

Monaco's own renderer continues to generate internal DOM styles. Those are
third-party implementation details, not application-authored CSS.

## Device limitation

This environment can run Chromium desktop/mobile-viewport checks, not a physical
iPhone or Android software keyboard. Safari/iOS keyboard behavior still needs a
real-device check. `100dvh` and `interactive-widget=resizes-content` are not proof
that every browser resizes around its keyboard; keep that limitation explicit.
