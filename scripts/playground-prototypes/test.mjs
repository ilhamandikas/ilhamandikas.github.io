import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { startServer } from './server.mjs';

const js = {
  hello: "console.log('Hello browser');",
  input: "console.log('input: ' + await prompt('Name?'));",
  syntax: 'const = ;', runtime: "throw new Error('probe boom');",
  loop: 'while (true) {}',
};
const fixtures = {
  javascript: js,
  typescript: { ...js, hello: "const message: string = 'Hello browser'; console.log(message);" },
  python: {
    hello: "print('Hello browser')", input: "print('input: ' + input())",
    syntax: 'def broken(', runtime: "raise ValueError('probe boom')", loop: 'while True:\n    pass',
  },
  php: {
    hello: '<?php echo "Hello browser\\n";', input: '<?php echo "input: " . trim(fgets(STDIN)) . "\\n";',
    syntax: '<?php echo (;', runtime: '<?php throw new Exception("probe boom");', loop: '<?php while (true) {}',
  },
  ruby: {
    hello: "puts 'Hello browser'", input: "puts 'input: ' + STDIN.gets.strip",
    syntax: 'def broken(', runtime: "raise 'probe boom'", loop: 'loop {}',
  },
  c: {
    hello: '#include <stdio.h>\nint main(void) { puts("Hello browser"); return 0; }',
    input: '#include <stdio.h>\nint main(void) { char s[100]; fgets(s, sizeof(s), stdin); printf("input: %s", s); return 0; }',
    syntax: 'int main( {', runtime: 'int main(void) { return 7; }', loop: 'int main(void) { while (1) {} }',
  },
  cpp: {
    hello: '#include <iostream>\nint main() { std::cout << "Hello browser\\n"; }',
    input: '#include <iostream>\n#include <string>\nint main() { std::string s; std::getline(std::cin, s); std::cout << "input: " << s << "\\n"; }',
    syntax: 'int main( {', runtime: 'int main() { return 7; }', loop: 'int main() { while (true) {} }',
  },
};

if (!process.env.CHROME_BIN) throw new Error('Set CHROME_BIN to an installed Chrome/Chromium executable.');
const server = await startServer();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN, args: ['--no-sandbox', '--disable-gpu'] });
const report = { browser: await browser.version(), isolationHeaders: false, results: [] };
const selected = process.env.LANGUAGES?.split(',') || Object.keys(fixtures);
try {
  for (const language of selected) {
    const page = await browser.newPage();
    page.setDefaultTimeout(120000);
    const requests = [];
    const external = [];
    const failures = [];
    page.on('request', (request) => {
      requests.push(request.url());
      if (!request.url().startsWith(origin + '/')) external.push(request.url());
    });
    if (process.env.DEBUG_PROBE) {
      page.on('console', (message) => console.log(language, message.type(), message.text()));
      page.on('requestfailed', (request) => console.log('REQUEST FAILED', request.url(), request.failure()));
    }
    page.on('pageerror', (error) => failures.push(error.message));
    const result = { language, tests: {}, externalRequests: external, pageErrors: failures };
    report.results.push(result);
    const started = Date.now();
    const requestOffset = server.requests.length;
    try {
      await page.goto(origin);
      await new Promise((resolve) => setTimeout(resolve, 100));
      assert.equal(server.requests.slice(requestOffset).some((request) => request.path.includes('/node_modules/')), false, 'page load must not fetch runtimes');
      assert.equal(await page.evaluate(() => crossOriginIsolated), false);
      result.tests.lazyLoad = 'pass';
      await page.evaluate(async (language) => {
        window.probe = { messages: [] };
        window.probe.open = () => {
          const worker = new Worker('./worker.mjs', { type: 'module' });
          probe.worker = worker;
          worker.onmessage = ({ data }) => probe.messages.push(data);
          worker.onerror = (event) => probe.messages.push({ type: 'error', text: event.message });
          worker.postMessage({ type: 'init', language });
        };
        probe.open();
      }, language);
      await page.waitForFunction(() => probe.messages.some((m) => m.type === 'ready' || m.type === 'error'));
      const init = await page.evaluate(() => probe.messages);
      assert(init.some((m) => m.type === 'ready'), JSON.stringify(init));
      result.tests.initialize = 'pass';
      result.firstInitializeMs = Date.now() - started;

      async function run(code) {
        await page.evaluate((code) => {
          probe.messages = [];
          probe.worker.postMessage({ type: 'run', code, input: 'Ilham ☕\n' });
        }, code);
        await page.waitForFunction(() => probe.messages.some((m) => m.type === 'done' || m.type === 'error'));
        return page.evaluate(() => probe.messages);
      }
      for (const name of ['hello', 'input', 'syntax', 'runtime']) {
        if (process.env.DEBUG_PROBE) console.log(language, name);
        const messages = await run(fixtures[language][name]);
        const output = messages.filter((m) => m.type === 'output').map((m) => m.text).join('');
        if (name === 'hello' || name === 'input') {
          assert(messages.some((m) => m.type === 'done'), JSON.stringify(messages));
          assert(output.includes(name === 'hello' ? 'Hello browser' : 'input: Ilham ☕'), JSON.stringify(messages));
        } else {
          assert(messages.some((m) => m.type === 'error'), JSON.stringify(messages));
        }
        result.tests[name] = 'pass';
      }
      if (process.env.DEBUG_PROBE) console.log(language, 'infinite loop');
      await page.evaluate((code) => {
        probe.messages = [];
        probe.worker.postMessage({ type: 'run', code });
      }, fixtures[language].loop);
      await page.waitForFunction(() => probe.messages.some((m) => m.type === 'running' || m.type === 'error'));
      await new Promise((resolve) => setTimeout(resolve, 250));
      assert.equal(await page.evaluate(() => probe.messages.some((m) => m.type === 'done' || m.type === 'error')), false);
      if (process.env.DEBUG_PROBE) console.log(language, 'stop and reload');
      await page.evaluate(() => { probe.worker.terminate(); probe.messages = []; probe.open(); });
      await page.waitForFunction(() => probe.messages.some((m) => m.type === 'ready' || m.type === 'error'));
      const recovered = await run(fixtures[language].hello);
      assert(recovered.some((m) => m.type === 'done'), JSON.stringify(recovered));
      result.tests.stopAndRecover = 'pass';
      assert.equal(external.length, 0, 'no external requests observed');
      assert(server.requests.slice(requestOffset).every((request) => request.method === 'GET'), 'no execution POST requests');
      assert.equal(failures.length, 0, 'no unexpected page errors');
      result.tests.localOnly = 'pass';
      result.status = 'pass';
    } catch (error) {
      result.status = 'fail';
      result.error = error.message;
      process.exitCode = 1;
    } finally {
      result.durationMs = Date.now() - started;
      result.assetPaths = [...new Set(server.requests.slice(requestOffset).map((request) => request.path))];
      console.log(JSON.stringify(result));
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  if (process.env.REPORT_PATH) await writeFile(process.env.REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
}
