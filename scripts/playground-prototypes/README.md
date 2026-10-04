# Browser playground feasibility probes

Development-only prototypes, **not published by Hugo**. Nothing here is imported by
home, the tools index, or the existing JavaScript playground. This is a proof of
compile/run feasibility, not a new production playground framework.

The server serves static files only. There is no code-execution endpoint and no
COOP/COEP configuration. Code runs in disposable browser Web Workers; runtime
assets are loaded only when Run is pressed. Dependencies and generated bundles
stay in this directory's ignored `node_modules/`, not in the site asset pipeline.

## Run locally

Use Node/npm and an installed Chrome/Chromium. Upstream WordPress PHP-WASM
packages declare Node >=24.18.0 and npm >=11.16.0; prefer versions satisfying those
requirements. The recorded browser tests were executed with Node 22.23.2/npm
10.9.8 and installation emitted engine warnings.

```sh
npm --prefix scripts/playground-prototypes ci --ignore-scripts
npm --prefix scripts/playground-prototypes run serve
# Open http://127.0.0.1:8099/
```

The server is bound to localhost. It generates browser-only TypeScript, Ruby and
PHP bundles before serving the page. This is build-time preparation, not a
backend execution API. Do not copy all of `node_modules` into the published site.

## Automated real-browser tests

```sh
CHROME_BIN=/path/to/chromium \
  npm --prefix scripts/playground-prototypes test
```

Optional environment variables:

- `LANGUAGES=typescript,python`: run a subset.
- `REPORT_PATH=/tmp/playground-results.json`: save the detailed machine report.
- `DEBUG_PROBE=1`: print test phases and browser console failures.

For each adapter, the tests check:

1. No runtime download on initial page load.
2. Initialization without cross-origin isolation.
3. Hello World.
4. Prepared input containing Unicode.
5. Syntax/compile errors.
6. Runtime errors/nonzero exit status.
7. Infinite-loop termination, followed by a fresh successful run.
8. Static GET asset requests and no observed external requests/page errors.

Only synthetic fixtures are used. Dependency fetching occurs during npm setup;
browser tests load installed assets from localhost, not a CDN.

### Existing site regression check

```sh
hugo --ignoreCache --minify --destination /tmp/ilham-playground-build
CHROME_BIN=/path/to/chromium SITE_ROOT=/tmp/ilham-playground-build \
  npm --prefix scripts/playground-prototypes run test:site
```

This tests the **built and minified** JavaScript, TypeScript, Python, Ruby, C
and C++ playgrounds, including real runtime downloads from jsDelivr, examples,
prepared stdin, interactive JS/TS prompt, Stop/recovery, clipboard indentation and
page overflow at 320/375/768/1440px. Home, the tools catalog and the playground
index must not download runtimes. It also checks the submenu's Escape behavior.

Set `ALL_EXAMPLES=1` to execute all 102 examples. `SITE_LANGUAGES=python` limits
this test to one language. `DEBUG_PROBE=1` prints run locations. Unlike the
local adapter probes, this command needs network access for the actual site's
runtime CDN URLs. It does not load Monaco or cover all browsers/themes.

## Adapter boundaries

| Adapter | Pinned dependency | Scope |
|---|---|---|
| JavaScript | Browser runtime | Control case; async wrapper and prepared prompt answers |
| TypeScript | TypeScript 5.9.3 | Transpile and syntactic diagnostics; **not semantic type-checking** |
| Python | Pyodide 0.28.2 | Core runtime, prepared stdin; no extra packages loaded |
| PHP | `@php-wasm/web-8-4` and `@php-wasm/universal` 3.1.56 | WordPress PHP-WASM Asyncify build in a Worker |
| Ruby | `@ruby/3.4-wasm-wasi` 2.10.1 | CRuby WASI build with filesystem-backed stdin |
| C / C++ | browsercc 0.1.1 + browser_wasi_shim 0.4.2 | Clang/LLD inside the browser, WASI execution; C17/C++20 |

Important integration findings:

- TypeScript is deliberately pinned to the JavaScript compiler implementation.
  Do not blindly replace it with a new compiler distribution that lacks the same
  browser API.
- The initial `php-wasm@0.2.0` candidate failed: its `PhpWorker` wrapper references
  binaries not included in the published package, while the web binary accesses
  `document`. The working adapter uses WordPress's PHP-WASM instead.
- PHP's web SAPI is **not a CLI or a real PHP server**. Prepared stdin is emulated
  using `/input.txt` and a bootstrap-defined `STDIN` resource. Other CLI constants
  are not emulated. The prototype does not install a service worker.
- Ruby output is buffered unless `$stdout.sync`/`$stderr.sync` is enabled. WASI
  file descriptors provide input/output; there is no terminal session.
- browsercc uses a `clang++` driver. C mode requires `--driver-mode=gcc`; simply
  selecting a `.c` filename or appending `-x c` was insufficient with its API.
- C++ exceptions are disabled. Neither native OS APIs nor arbitrary libraries
  are provided. Compiler/linker/sysroot assets are substantial.

## Not yet validated locally

Go, Java, C# and Rust remain **unverified by this local test suite**. Documentation
and source show candidate approaches, not proof of compatibility with our site:

- [Hackpad](https://github.com/hack-pad/hackpad): Go toolchain in-browser; version,
  build/export procedure and current browser compatibility need a separate probe.
- [JavaFiddle](https://github.com/leaningtech/javafiddle): browser-side `javac` plus
  [CheerpJ](https://github.com/leaningtech/cheerpj-meta). Check licensing and
  redistribution/loading terms before embedding assets on ilham.dev.
- [.NET Lab](https://github.com/jjonescz/DotNetLab): Roslyn plus .NET WASM; building
  the worker and extracting a minimal static deployment is a separate task.
- [Rubrc](https://github.com/oligamiq/rubrc): pre-release Rust toolchain requiring
  COOP/COEP. This server intentionally does not supply those headers. A workaround
  for GitHub Pages has not been implemented or verified.

## What this does not prove

A passing probe does not establish mobile performance, Safari/Firefox support,
offline caching, complete standard-library compatibility, package installation,
interactive terminal stdin, secure isolation, or production readiness.

Workers prevent direct DOM access and allow termination; they are **not a
security sandbox**. Supported JS bridges can expose browser APIs, and snippets
may still make network requests. Do not execute untrusted code or add persistence
for user input by default.

Before publication, integrate only each runner's necessary assets, retain its
license notices, evaluate compressed downloads/memory, and test responsive UI,
error recovery, network behavior, and runtime caching. See `RESULTS.md` for the
recorded checks.
