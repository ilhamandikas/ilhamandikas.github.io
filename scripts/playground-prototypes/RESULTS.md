# Recorded feasibility results

These are **actual local browser test results**, not estimated compatibility.
The latest full probe run completed successfully with
`HeadlessChrome/154.0.8037.57` on Linux. The local static server supplied no
COOP/COEP headers and `crossOriginIsolated` was false.

| Language | Hello World | Prepared Unicode input | Syntax / runtime failure | Stop infinite loop and rerun | Lazy assets |
|---|---|---|---|---|---|
| JavaScript | Pass | Pass | Pass | Pass | Pass |
| TypeScript | Pass | Pass | Pass | Pass | Pass |
| Python | Pass | Pass | Pass | Pass | Pass |
| PHP | Pass | Pass | Pass | Pass | Pass |
| Ruby | Pass | Pass | Pass | Pass | Pass |
| C | Pass | Pass | Pass | Pass | Pass |
| C++ | Pass | Pass | Pass | Pass | Pass |

No external requests or unexpected page errors were observed in that run. All
requests recorded by the local static server were GET requests. Runtime and
compiler assets were downloaded from the local npm installation, not a remote
execution service. The JSON report was saved outside the repository at
`/tmp/playground-probe-results.json`; use `REPORT_PATH` to reproduce it.

## Asset footprint in this probe

Sum of the unique runtime/compiler files actually requested from `node_modules`
for each adapter, rounded to MiB. **These are uncompressed file sizes**, excluding
the common HTML/UI/Worker files. They are not real-world transfer measurements,
RAM requirements, or predictions for an optimized production bundle.

| Language | Requested runtime/compiler files |
|---|---:|
| JavaScript | No extra runtime |
| TypeScript | 9.5 MiB |
| Python | 11.7 MiB |
| PHP | 19.5 MiB |
| Ruby | 16.0 MiB |
| C / C++ | 90.2 MiB each; same shared toolchain |

C/C++ compiler assets load during compilation, not merely when their adapter
module initializes. Do not interpret the initialization timing as compile time.
These sizes reinforce the requirement to load assets **per language and on
Run**, not on home or when showing links to other playgrounds.

## Existing JavaScript page

The optional real-site test also passed against Hugo's minified output:

- Default example returns `20`.
- Interactive `await prompt()` accepts input and displays output.
- Infinite loop can be stopped; a following run succeeds.
- No horizontal page overflow at 320, 375, 768 or 1440px.
- No tested language-runtime downloads on home.
- No unexpected page errors.

Monaco loading, dark mode, Safari, Firefox and real mobile devices were not tested
by this command.

Additional validation:

- Hugo build with `--ignoreCache --minify`: passed.
- `npm run check:ai`: passed.
- `node scripts/domtest/javascript-playground.cjs`: passed.
- `git diff --check`: passed.
- Initial full `npm run test:dom`: reached the review-output phase but hit the
  180-second timeout. That initial attempt was not a completed passing suite;
  the subsequent integration run completed and passed (see below).

## Remaining languages

| Language | Local status | Next verification |
|---|---|---|
| Go | Not tested | Export/build Hackpad's browser toolchain and check supported version/imports |
| Java | Not tested | Confirm CheerpJ licensing, then test local javac + JVM deployment |
| C# | Not tested | Build a minimal Roslyn + .NET WASM runner |
| Rust | Not tested | Resolve Rubrc's COOP/COEP requirement on GitHub Pages and pre-release stability |

The initial probe did not create public pages or catalog entries. Subsequent
integration added JavaScript/TypeScript/Python navigation and two new language
pages; the original JavaScript URL remains unchanged. These repository changes
have not been deployed by the agent.

## Subsequent site integration checks

A real browser run against Hugo's minified output passed for JavaScript,
TypeScript and Python, with real runtime requests to jsDelivr:

- All 62 examples executed: 20 JavaScript, 22 TypeScript, 20 Python.
- Examples preserve existing code, pause Auto-run and do not execute on click.
- Pyramid output and copied text preserve leading spaces and line breaks.
- Prime-number and OOP examples produced their expected results.
- JS/TS prompt input, prepared Python stdin and Python EOF errors behaved as documented.
- Stop interrupts an infinite loop, and a subsequent run succeeds in all three languages.
- No runtime downloads occurred on home, the tools catalog, the playground index,
  language page load, or example selection.
- The submenu closes with Escape; per-language related links are present.
- No horizontal overflow at 320/375/768/1440px, and no unexpected page errors.
- Generic input/history persistence is not offered on playground pages.
- Hugo build, the complete `npm run test:dom` suite and `npm run check:ai` passed.

This does not validate the four remaining language adapters, Monaco loading,
Safari/Firefox, offline behavior or real mobile-device performance. Use
`ALL_EXAMPLES=1` with `test:site` to reproduce the full examples check.

## Ruby and C/C++ integration checks

Later real-browser runs against the built site covered the additional adapters:

- **Ruby** 2.10.1 (`ruby.wasm`) runs all 20 examples, including `STDIN.readline`,
  UTF-8 input, stderr fragments and raised exceptions.
- **C** and **C++** use browsercc 0.1.1 loaded from jsDelivr. All 20 examples per
  language compile and run, including prepared stdin, structs/classes, sorting,
  searching and every pyramid pattern.
- Compiled examples **replace** the editor instead of prepending, because each is
  a complete program with its own `main`.
- Only the selected language's runtime is requested. Home, the tools catalog and
  the playground index load no runtime; each language page defers the runtime
  until Run.
- Stop interrupts an infinite loop and a later Run recovers in every language.

New finding while integrating C++:

- C++ must be compiled with `-fno-exceptions`. Without it, `std::string` pulls in
  `__cxa_allocate_exception`/`__cxa_throw`, which the WASI sysroot does not
  provide, and linking fails. The runner passes `-fno-exceptions`, so examples
  avoid throwing paths.

This still does not validate Monaco loading, Safari/Firefox, offline behavior or
real mobile devices. Go, Java, C# and Rust remain unvalidated; PHP remains a local
prototype pending GPL source/license handling.
