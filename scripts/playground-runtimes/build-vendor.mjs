// Build only the small JavaScript/WASI adapters. WASM binaries stay on the CDN.
// The generated bundle and license notices are committed; Hugo needs no npm.
import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const output = resolve(root, 'assets/js/vendor/playground-runtimes.js');
const notices = resolve(root, 'static/licenses/playground-runtimes');
for (const [name, version] of [['@ruby/wasm-wasi', '2.10.1'], ['@bjorn3/browser_wasi_shim', '0.4.2']]) {
  const pkg = JSON.parse(await readFile(resolve(here, `node_modules/${name}/package.json`), 'utf8'));
  if (pkg.version !== version) throw new Error(`Expected ${name}@${version}; run npm ci before rebuilding.`);
}
await mkdir(dirname(output), { recursive: true });
await mkdir(notices, { recursive: true });
await build({
  stdin: {
    contents: "export { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser'; export { WASI, File, OpenFile, ConsoleStdout } from '@bjorn3/browser_wasi_shim';",
    resolveDir: here,
    sourcefile: 'playground-runtimes.js',
  },
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  minify: true,
  legalComments: 'eof',
  banner: { js: '/*! Playground WASI adapters: @ruby/wasm-wasi 2.10.1 (MIT), browser_wasi_shim 0.4.2 (MIT). License notices: /licenses/playground-runtimes/ */' },
  outfile: output,
});
// ruby-wasm's npm adapter omits LICENSE; keep the upstream MIT notice
// alongside the committed bundle instead of installing the large WASM package.
await readFile(resolve(notices, 'ruby-wasm-MIT.txt'));
await copyFile(resolve(here, 'node_modules/@bjorn3/browser_wasi_shim/LICENSE-MIT'), resolve(notices, 'browser-wasi-shim-MIT.txt'));
await writeFile(resolve(notices, 'NOTICE.txt'), `Playground JavaScript/WASI adapters

@ruby/wasm-wasi 2.10.1
Copyright (c) 2022 Yuta Saito. MIT license: ruby-wasm-MIT.txt
Source: https://github.com/ruby/ruby.wasm
Used by the Ruby Playground.

@bjorn3/browser_wasi_shim 0.4.2
MIT license: browser-wasi-shim-MIT.txt
Source: https://github.com/bjorn3/browser_wasi_shim
Used by the Ruby and C/C++ playgrounds.

The adapters are bundled and minified; their upstream code is not otherwise
modified. WASM binaries and the C/C++ compiler are downloaded separately from
jsDelivr, not redistributed in this repository.
Ruby's own license: https://www.ruby-lang.org/en/about/license/
The C/C++ compiler is browsercc 0.1.1 (MIT):
https://github.com/BertalanD/browsercc
Build instructions: scripts/playground-runtimes/README.md in the site repository.
`);
console.log(`Built ${output} and ${notices}`);
