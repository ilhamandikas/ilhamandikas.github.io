// Development-only static asset server. No execution API and no isolation headers.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(fileURLToPath(import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.css': 'text/css' };

async function prepareBundles() {
  for (const [name, contents] of Object.entries({
    typescript: "export { default } from 'typescript';",
    ruby: "export { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser';",
    php: "export { PHP, loadPHPRuntime } from '@php-wasm/universal'; export * as loader from './node_modules/@php-wasm/web-8-4/asyncify/php_8_4.js';",
  })) {
    await build({
      stdin: { contents, resolveDir: root, sourcefile: `${name}.js` },
      bundle: true, platform: 'browser', format: 'esm', target: 'es2022',
      outfile: resolve(root, `node_modules/.cache/${name}.mjs`),
      loader: { '.wasm': 'file' },
      external: ['node:*', 'events', 'worker_threads'],
    });
  }
}

export async function startServer(port = 0) {
  await prepareBundles();
  const requests = [];
  const server = createServer(async (req, res) => {
    try {
      requests.push({ method: req.method, path: new URL(req.url, 'http://localhost').pathname });
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      const info = await stat(file);
      if (!info.isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, {
        'Content-Type': mime[extname(file)] || 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  server.requests = requests;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await startServer(Number(process.env.PORT || 8099));
  console.log(`Prototype: http://127.0.0.1:${server.address().port}/ (not part of the published site)`);
}
