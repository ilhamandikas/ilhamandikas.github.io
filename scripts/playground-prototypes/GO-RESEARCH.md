# Go feasibility research

Status: **not validated for integration**. No Go page, registry entry or runtime
asset has been added to the public site.

## Reproduce the upstream probe

```sh
CHROME_BIN=/path/to/chromium \
  node scripts/playground-prototypes/go-upstream-probe.mjs
```

This is a separate research script, not part of the passing site regression
suite. It visits the live upstream `https://hackpad.org/` with synthetic code,
uses the upstream page's APIs and its IndexedDB filesystem, and closes the
browser afterward. It is not a local, disposable-Worker implementation and does
not prove GitHub Pages compatibility. It currently fails the arithmetic check.
The upstream site is not pinned and could change between runs.

## What was established

Source inspected in `/tmp/ilham-hackpad-probe`:
`https://github.com/hack-pad/hackpad`.

- The Makefile builds a patched Go 1.20 toolchain from `hack-pad/go`, not just
  a Go program precompiled to WASM.
- A browser subprocess successfully reported `go version go1.20.3 js/wasm`
  in an intermediate probe. This only validates the version command.
- Upstream APIs do not expose `existsSync`, `readFileSync` or `writeFileSync`.
  Use `stat`, `open`, `read`, `write` and `close` with callbacks instead.
- Synchronous filesystem calls stalled the probes when accessing the
  IndexedDB-backed mount. Async callback calls allowed progress.
- `spawn` options replace the environment in these tests. Explicit `GOROOT`,
  `HOME`, `GOCACHE` and `PATH` were necessary; without `GOROOT` the command
  reported a build-machine temporary path that does not exist in the browser.
- `stdio: ['ignore', ...]` is rejected as unsupported. An empty input file
  descriptor works for the synthetic stdin fixture.
- The upstream startup message does not mean the Go archive has been fully
  extracted. Waiting for `/usr/local/go/.tarfs-complete` avoids prematurely
  reporting missing standard-library packages.
- After that marker appeared, `/usr/local/go/src/fmt/print.go` was readable
  and its size was reported as 32,652 bytes.
- The downloaded upstream `go.tar.gz` is approximately 59 MiB compressed;
  source files for `fmt` and `runtime` are present. Local inspection copy:
  `/tmp/ilham-hackpad-go.tar.gz` (not a site asset, not committed).

## Execution remains unsuccessful

The final isolated probe wrote this synthetic program through async filesystem
APIs, then ran `go run main.go` with `GO111MODULE=off` and `GOPROXY=off`:

```go
package main
import "fmt"
func main() { fmt.Println("sum:", 2+4+6+8) }
```

It did not finish within the probe's 90-second compilation/execution limit and
its output file was empty. A previous attempt that first ran `go version` also
emitted `Go program has already exited` and eventually hit Puppeteer's protocol
timeout. The causes are not established; these results do not show that every
Hackpad configuration is unusable.

The upstream UI independently requested module-proxy URLs, including paths
returning HTTP 404, despite the synthetic subprocess's `GOPROXY=off`. Those
requests must not be mistaken for evidence that the synthetic program uploaded
source; no such upload was established. A future local probe must omit the
upstream UI, disable package installation and verify its own network behavior.

## Next investigation

1. Separate `go build` from launching the resulting binary to identify whether
   compilation or execution stalls; capture bounded compiler output and process
   diagnostics.
2. Build a pinned local adapter without the upstream React/terminal processes or
   IndexedDB input persistence. Do not rely on an unversioned third-party binary
   host for production.
3. Confirm Worker behavior, loading time, memory, Stop/recovery and input/output
   before adding metadata or public pages.
4. Review Apache-2.0 notices for Hackpad and licensing for patched Go and its
   bundled dependencies before redistributing assets.

No site build or six-language regression suite was rerun for this research-only
change. The new probe passed JavaScript syntax checking but its execution check
failed as described above.
