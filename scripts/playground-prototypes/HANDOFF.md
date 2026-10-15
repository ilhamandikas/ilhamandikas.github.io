# Playground handoff

Work was paused at the user's request and then resumed for Go feasibility
research. No Go playground integration has been made. The resumed probe and
current failures are recorded in [GO-RESEARCH.md](GO-RESEARCH.md); the earlier
pause snapshot below is retained for context.

## Published to Git

- Playground family commit: `9421f46` — pushed to `origin/main`.
- JavaScript, TypeScript, Python, Ruby, C and C++ pages, guides, examples,
  navigation, metadata, adapters and tests are included in that commit.
- The prior complete real-browser test passed all **122** examples:
  20 JavaScript, 22 TypeScript, 20 Python, 20 Ruby, 20 C and 20 C++.
- Hugo, `npm run test:dom`, `npm run check:ai` and diff whitespace checks passed
  during that integration. These checks were not rerun during the Go research.
- Deployment status has not been checked.
- At pause, HEAD and origin/main are `c7dc888`, a subsequent search-companion
  commit. Working tree was clean before creating this handoff note.

## Latest research: Go

Source checkout, outside this repository:

```text
/tmp/ilham-hackpad-probe
https://github.com/hack-pad/hackpad
```

Findings from upstream source:

- Hackpad's Makefile targets a patched Go 1.20 branch:
  `hack-pad/go`, branch `hackpad/release-branch.go1.20`.
- Building its browser toolchain is not equivalent to using the ordinary Go
  compiler to produce a precompiled WASM program. The playground must compile
  newly entered source inside the browser.
- Its frontend loads `wasm_exec.js`, `main.wasm` and `go.tar.gz` and configures
  a virtual filesystem/process layer. Its default frontend persists filesystem
  overlays in IndexedDB; do not copy this behavior for sensitive playground inputs.
- The repository LICENSE identifies Apache-2.0. A redistribution review must
  also cover the patched Go distribution and included dependencies.
- Upstream README lists slow compile times and Safari WASM crash issues.

## Browser probe outcome

A temporary Puppeteer probe visited `https://hackpad.org/` (the upstream site,
not a local ilham.dev integration).

- The browser exposed `hackpad.ready`, `fs` and `child_process`.
- The probe timed out while checking for the Go executable. Its check called
  `fs.existsSync`, which is **not present** in the exposed API; exceptions were
  caught and converted to false. Thus the timeout is a **probe bug**, not evidence
  that Hackpad cannot compile Go or that its download failed.
- Later probe code also assumed `writeFileSync` and `readFileSync`, which were
  absent from the exposed API listing. Those calls were never reached.
- No source compilation or program execution was validated.
- Temporary `scripts/playground-prototypes/_go-research.mjs` was removed.
- No runtime assets, dependencies, catalog entries or public pages were added.

## Resume safely

1. Fix filesystem probing using available `statSync`, `openSync`, `writeSync`
   and `readSync` APIs; inspect their signatures in upstream source.
2. Validate an arithmetic Go program on the upstream runtime first.
3. Build/pin a local static, disposable-Worker probe with persistence disabled.
4. Test compilation, standard input/output, errors, Stop/recovery, asset sizes
   and lazy loading before advertising a Go page.
5. Review licenses and packaging; keep the public site backend-free.

Go, Java, C# and Rust remain unvalidated. PHP remains a local prototype pending
GPL source/license distribution. Do not interpret this research as a ready tool.

The README example-count correction has been applied: the built-site suite
contains **122** examples including TypeScript's reused JavaScript examples.
