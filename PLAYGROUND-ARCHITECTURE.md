# Shared UI and playground architecture

## Rules

- Prefer KISS: native controls, straightforward functions, no extra UI framework.
- Prefer DRY: use the shared toolkit and components rather than copying behavior.
- Do not author inline CSS: no `style` attributes, `<style>` blocks, `.style` writes,
  or dynamically injected CSS rules. Toggle shared classes or semantic attributes.
- Use global `btn`, `tool-input`, `tool-select`, `tool-check`, `tool-row`,
  `tool-panel`, and `dialog-panel` classes. Do not override their colors, typography,
  or button sizing just for a playground. Layout rules are allowed in shared
  components; a separate per-language visual theme is not.
- Keep colors and surfaces in the design tokens in `assets/css/styles.css`.
- Share genuine cross-tool behavior through `window.tk`; keep language/runtime
  details in playground modules. Do not build a generic framework for one caller.
- Around 400 lines, review whether a file mixes responsibilities. Split by
  responsibility, not by arbitrary line chunks or one-line wrapper functions.
- Keep public URLs, runtime versions, privacy behavior, and unrelated work intact.

The inline-CSS rule applies to application-authored code. Monaco generates internal
DOM styles for its renderer; those are library implementation details, not an
alternate site theme. Its font and padding options read the standard input's
computed CSS rather than defining another typography system.

## CSS: two shared bundles

`layouts/partials/head.html` assembles the global site bundle from foundation,
content, dialog, shortcuts, responsive, syntax-highlighting, and mascot styles.

`layouts/partials/tools/styles.html` is the single entry point for the tools bundle.
All tool layouts use it. It assembles the foundation and component files under
`assets/css/components/`: controls, knowledge/history, result panels, interactive
panels, device/media panels, games, data panels, and the shared code workspace.
Files are concatenated at build time; there are no extra per-tool CSS requests.
Legacy tool rules were moved in their original order, not redesigned.

`dialog.css` owns the panel surface used by confirmations, keyboard help, and site
search. `tool-workspace.css` owns editor/console structure and fullscreen layout.
Global button/input styling is not overridden there. Interactive workspace pages
use immediate (not smooth) page scrolling: animating a focus-driven scroll moves
input underneath a pointer click. Standard form labels wrap long prompt text to
prevent narrow-screen horizontal overflow. The fullscreen workspace uses
`100dvh`, with `100vh` as fallback; no JavaScript-written height variables.
Playground viewport metadata requests `interactive-widget=resizes-content` for
browsers that support resizing around the software keyboard. Browsers that ignore
this directive may overlay their keyboard; verify real-device behavior rather
than claiming universal keyboard support.

## JavaScript modules

| File | Responsibility |
| --- | --- |
| `assets/js/toolkit.js` | Stable `window.tk` API and common utilities |
| `assets/js/tool-ui.js` | Opt-in native confirmation and fullscreen controllers |
| `assets/js/tool-images.js` | Existing shared image helpers |
| `assets/js/tool-charts.js` | Shared SVG chart helpers and decorative measurement gauges |
| `assets/js/tools/playground.js` | Execution lifecycle, deadlines, and wiring |
| `assets/js/tools/playground/editor.js` | On-demand Monaco, formatting, suggestions, diagnostics |
| `assets/js/tools/playground/examples.js` | Categories, selection, replacement confirmation |
| `assets/js/tools/playground/console.js` | Safe output rendering, copy/clear, elapsed metrics |
| `assets/js/tools/playground/terminal.js` | Editable draft, focus, Send/EOF, keyboard interaction |
| `assets/js/tools/playground/input-bridge.js` | Local service-worker registration/session handshake |
| `assets/js/tools/playground/worker.js` | Isolated runtime execution and shared byte-stream decoder |
| `static/tools/playground-input-sw.js` | Local synchronous stdin responses and session isolation |

All six language entrypoints import the shared `playground.js` orchestrator.
`javascript-playground.js` remains a compatibility entrypoint like the other five.
Do not copy the controller or CSS for another language. Display names come from
the global tool catalog via `data-language-name`; do not maintain another language
name table in the template or JavaScript.

The runner is serialized into a worker Blob. Keep its dependencies inside
`workerMain`, apart from the explicitly serialized `format` function. A page-side
helper/import will not automatically exist in the worker's global context.

## Shared UI API

- `tk.confirmDialog(dialog)` returns a function resolving to a Boolean. Its native
  dialog needs `data-dialog-cancel` and `data-dialog-accept` buttons. Cancel receives
  initial focus; Escape, backdrop dismissal, and page cleanup resolve false.
- `tk.fullscreen({ workspace, button, hint, options, onChange, onResize, onError })`
  returns `{ active, exit }`. It handles native fullscreen, CSS fallback, surrounding
  inert controls, focus restoration, and Escape. Callbacks own tool-specific work.

## Terminal behavior

The input draft is always visible, focusable, and editable, including before Run.
Send/EOF are enabled only while the worker requests input. Early Enter does not
clear the draft or execute code. An incoming prompt preserves a typed draft;
accepted submission clears it. Stop keeps an unsent draft; Clear and accepted
example replacement clear it. Clicking console output focuses input unless text
is being selected. An arriving fullscreen prompt closes Options before focusing
input so its popup does not cover the terminal.

This is line-based stdin, not a shell or a full terminal emulator. JavaScript and
TypeScript use `await prompt()`. Other languages need Interactive input mode and
HTTPS/service-worker support; Prepared input remains the fallback. No draft,
answer, or source code is persisted or added to analytics/URLs by this refactor.
Execution/input-wait limits and WASM memory labeling remain unchanged.

See `UI-LEGACY-AUDIT.md` for the follow-up audit of global search ordering and
legacy utility layouts, including explicitly deferred dynamic-style migrations.

## Refactor record

- Split the approximately 1,000-line runner into six focused modules and wiring.
- Split the large shared toolkit into core, UI, image, and chart modules while
  preserving its existing public API.
- Split the large site/tools stylesheets into centrally bundled component files.
- Removed playground-only control/dialog styling and JavaScript-written CSS.
- Unified Python/Ruby/C/C++ streaming stdout/stderr decoding and suggestion options.
- Consolidated jsdom dialog mocks in `scripts/domtest/browser-stubs.cjs`.
- Added terminal draft/focus/send-state regression coverage to the runner tests.
- Fixed focus/click races caused by smooth page scrolling, and long-prompt label
  overflow using the shared workspace and global label rules.

## Validation

```sh
hugo --gc --minify
npm run test:dom
npm run check:ai
git diff --check
```

Validation: build, AI checks, the complete DOM/E2E suite, playground/bridge tests,
and Chromium checks passed. The broad DOM smoke test booted 186 tools without
uncaught errors.

A follow-up corrected two E2E assumptions without changing production behavior:
OpenSSL keyword coverage checks RSA discoverability rather than requiring first
place when TLS tools also match; incident resolution targets the explicitly forced
disk incident and verifies that other incidents remain intact. Resolution was also
checked with RNG forced to both boundaries (random incident present/absent).

DOM tests bundle the real toolkit and playground modules using the existing
esbuild dependency. They do not substitute a second UI implementation.
Browser checks must also cover all six runtimes, Unicode/empty input, EOF,
Stop/re-run, blocked service-worker recovery, native/fallback fullscreen, Options,
confirmation, Monaco, 320/375/768px widths, and short landscape viewports. Verify
input with actual pointer clicks and keyboard typing, not only programmatic values.
