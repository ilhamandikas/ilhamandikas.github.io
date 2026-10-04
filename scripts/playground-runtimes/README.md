# Playground runtime adapters

Rebuild the committed browser JavaScript/WASI adapters without installing the
full feasibility-probe dependencies or any WASM binaries:

```sh
npm --prefix scripts/playground-runtimes ci --ignore-scripts
npm --prefix scripts/playground-runtimes run build
hugo --ignoreCache --minify
```

The build script bundles two MIT-licensed adapters into the committed
`assets/js/vendor/playground-runtimes.js`:

- `@ruby/wasm-wasi` 2.10.1, used by the Ruby Playground.
- `@bjorn3/browser_wasi_shim` 0.4.2, used by the Ruby and C/C++ playgrounds.

The build asserts the pinned adapter versions before bundling, so run `npm ci`
after changing `package.json`.

Hugo/CI use the committed bundle, not npm. The Ruby, C and C++ pages embed a
fingerprinted adapter URL in `data-runtime-module`; the runner dynamically
imports it inside a disposable Worker only on Run. The runner then fetches
Ruby's WASM binary (pinned jsDelivr URL in
`assets/js/tools/javascript-playground.js`) or the browsercc 0.1.1 Clang/LLD
toolchain and sysroot from jsDelivr. Other language pages and listing pages
neither import nor preload this adapter.

The MIT license notices are published under
`static/licenses/playground-runtimes/`. The Ruby MIT notice is retained in this
repository because `@ruby/wasm-wasi` omits LICENSE from its npm package; the
same notice ships in the pinned `@ruby/3.4-wasm-wasi@2.10.1/dist/LICENSE`.
`browsercc` is MIT and is loaded from jsDelivr, not bundled. Update the
adapters, WASM/toolchain pins and notices together when upgrading, then run the
real-browser tests documented in `scripts/playground-prototypes/README.md`.

Do not copy `node_modules/` or any WASM binary into the site. PHP's validated
WordPress adapter remains a local prototype pending preparation of its GPL
source/license distribution.
