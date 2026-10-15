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

## Remaining work — not claimed complete

The repository still has legacy dynamic style writes outside the migrated scope:

| Area | Remaining concern | Preferred next step |
| --- | --- | --- |
| Games | Board column counts and DevOps bar widths | Fixed-size class variants; native progress or SVG geometry |
| Microphone/gamepad | Meter fill, peak and axis positions | Shared native meter/progress or SVG component |
| Random picker | Per-item animation delay | Bounded class variants using global animation rules |
| Infinite posts | Entry animation index | Bounded shared animation classes |
| Color Converter | DOM color-parser probe | Verify a native color parsing alternative without breaking supported colors |
| Search mascot | Drag/dock coordinates and transforms | Separate interaction audit; preserve touch, reduced-motion and visibility behavior |
| Mascot visibility | Temporary measurement styles | Shared measurement classes with reliable cleanup |

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
