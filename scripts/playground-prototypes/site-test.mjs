// Real browser checks of Hugo's built/minified playgrounds. Runtime CDN requests
// are real; no backend runner or mocked language execution is used.
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

if (!process.env.CHROME_BIN || !process.env.SITE_ROOT) throw new Error('Set CHROME_BIN and SITE_ROOT (built Hugo directory).');
const root = resolve(process.env.SITE_ROOT);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root + sep) && file !== root) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
let page;
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN, args: ['--no-sandbox', '--disable-gpu'] });
  page = await browser.newPage();
  page.setDefaultTimeout(120000);
  const errors = [];
  const requests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  const url = `http://127.0.0.1:${server.address().port}`;
  await browser.defaultBrowserContext().overridePermissions(url, ['clipboard-read', 'clipboard-write']);
  const hasRuntime = (u) => /pyodide|typescript@|monaco-editor|@ruby\/|\/js\/vendor\/playground-runtimes|browsercc/.test(u);
  for (const path of ['/', '/tools/', '/tools/playgrounds/']) {
    const offset = requests.length;
    await page.goto(url + path);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(requests.slice(offset).some(hasRuntime), false, `runtime fetched on ${path}`);
  }
  await page.click('.nav-playgrounds > summary');
  assert.equal(await page.$$eval('.nav-playgrounds-links a', (links) => links.length), 7);
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('.nav-playgrounds', (el) => el.open), false);

  async function click(selector) {
    await page.$eval(selector, (el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    // Native keyboard activation avoids pointer races beneath the sticky header
    // when long example descriptions change the page's scroll anchoring.
    await page.focus(selector);
    await page.keyboard.press('Enter');
  }
  async function run(code) {
    if (process.env.DEBUG_PROBE) console.log('RUN', page.url());
    if (code !== undefined) await page.$eval('#jsp-code', (el, code) => { el.value = code; }, code);
    await click('#jsp-run');
    await page.waitForFunction(() => {
      const text = document.querySelector('#jsp-status').textContent;
      return text.includes('Ran in') || text.includes('Threw') || text.includes('timed out') || text.includes('Could not');
    });
    assert(await page.$eval('#jsp-status', (el) => el.textContent.includes('Ran in')), await page.$eval('#jsp-output', (el) => el.textContent));
  }
  async function example(name) {
    const index = await page.$eval('#jsp-examples', (el, name) => JSON.parse(el.textContent).findIndex((item) => item.name === name), name);
    assert(index >= 0, `missing example ${name}`);
    await page.$eval('.jsp-examples', (el) => { el.open = true; });
    await click(`[data-jsp-example="${index}"]`);
  }

  for (const language of process.env.SITE_LANGUAGES?.split(',') || ['javascript', 'typescript', 'python', 'ruby', 'c', 'cpp']) {
    const compiled = ['c', 'cpp'].includes(language);
    const offset = requests.length;
    await page.goto(`${url}/tools/${language}-playground/`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(requests.slice(offset).some(hasRuntime), false, `runtime fetched before Run in ${language}`);
    assert.equal(await page.$('#tool-memory'), null, 'code must not be stored by the generic memory feature');
    assert.equal(await page.$$eval('.jsp-language-nav a', (links) => links.length), 7);
    const count = await page.$eval('#jsp-examples', (el) => JSON.parse(el.textContent).length);
    assert.equal(count, { typescript: 22 }[language] || 20);
    await run();
    assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('20')));
    const selectedRuntime = {
      javascript: /$^/,
      typescript: /typescript@/,
      python: /pyodide/,
      ruby: /@ruby\/|\/js\/vendor\/playground-runtimes/,
      c: /browsercc|\/js\/vendor\/playground-runtimes/,
      cpp: /browsercc|\/js\/vendor\/playground-runtimes/,
    }[language];
    const downloaded = requests.slice(offset).filter(hasRuntime);
    assert(downloaded.every((u) => selectedRuntime.test(u)), `unrelated runtime loaded in ${language}`);
    if (language !== 'javascript') assert(downloaded.length > 0, `runtime requests were not observed in ${language}`);

    if (!compiled) {
      // Selecting an example preserves code and pauses Auto-run without a request.
      await page.$eval('#jsp-code', (el) => { el.value = '// keep this marker'; });
      await page.$eval('#jsp-auto', (el) => { el.checked = true; });
      const before = requests.length;
      await example('Centered pyramid');
      assert(await page.$eval('#jsp-code', (el) => el.value.includes('keep this marker')));
      assert.equal(await page.$eval('#jsp-auto', (el) => el.checked), false);
      await new Promise((resolve) => setTimeout(resolve, 800));
      assert.equal(requests.length, before, 'example selection must not load/execute a runtime');
    } else {
      // Compiled examples are complete programs and replace the editor.
      await page.$eval('#jsp-code', (el) => { el.value = 'int main(void) { return 0; }'; });
      await page.$eval('#jsp-auto', (el) => { el.checked = true; });
      const before = requests.length;
      await example('Centered pyramid');
      assert(await page.$eval('#jsp-code', (el) => el.value.trim() !== 'int main(void) { return 0; }' && el.value.includes('main')));
      assert.equal(await page.$eval('#jsp-auto', (el) => el.checked), false);
      await new Promise((resolve) => setTimeout(resolve, 800));
      assert.equal(requests.length, before, 'example selection must not load/execute a runtime');
    }

    await click('#jsp-clear');
    await example('Centered pyramid');
    await run();
    assert.deepEqual(await page.$$eval('.jsp-line > span:last-child', (rows) => rows.map((el) => el.textContent)), ['    *', '   ***', '  *****', ' *******', '*********']);
    await click('#jsp-copy-output');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'log:     *\nlog:    ***\nlog:   *****\nlog:  *******\nlog: *********');
    await click('#jsp-clear');
    await example('Find prime numbers');
    await run();
    const primes = await page.$eval('#jsp-output', (el) => el.textContent);
    assert(primes.includes('29') && primes.includes('23') && !primes.includes('27'));
    await click('#jsp-clear');
    await example('OOP: bank account');
    await run();
    assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('70')));

    if (['python', 'ruby'].includes(language)) {
      await click('#jsp-clear');
      await example('Read standard input');
      await run();
      assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('Hello, Ilham!')));
      await page.$eval('#jsp-stdin', (el) => { el.value = ''; });
      await click('#jsp-run');
      await page.waitForFunction(() => document.querySelector('#jsp-status').textContent.includes('Threw'));
      assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('EOFError')));
      if (language === 'ruby') {
        await page.$eval('#jsp-stdin', (el) => { el.value = 'hé🙂\n'; });
        await run("print STDIN.readline.chomp; warn 'stderr fragment'");
        assert.deepEqual(await page.$$eval('.jsp-line > span:last-child', (rows) => rows.map((el) => el.textContent)), ['stderr fragment', 'hé🙂']);
        for (const code of ["puts(", "print 'before failure'; raise 'boom'"]) {
          await page.$eval('#jsp-code', (el, code) => { el.value = code; }, code);
          await click('#jsp-run');
          await page.waitForFunction(() => document.querySelector('#jsp-status').textContent.includes('Threw'));
          assert(await page.$eval('#jsp-output', (el) => el.textContent !== '(no output)'));
        }
        assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('before failure') && el.textContent.includes('boom')));
      }
    } else if (compiled) {
      await click('#jsp-clear');
      await example('Read standard input');
      await run();
      assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('Hello, Ilham!')));
      await page.$eval('#jsp-stdin', (el) => { el.value = ''; });
      await run("#include <stdio.h>\nint main(void) { puts(\"Hello again\"); return 0; }");
      assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('Hello again')));
    } else {
      await page.$eval('#jsp-code', (el) => { el.value = "const name = await prompt('Name?'); console.log(name);"; });
      await click('#jsp-run');
      await page.waitForFunction(() => !document.querySelector('#jsp-input-form').hidden);
      await page.type('#jsp-input', 'Ilham');
      await click('#jsp-input-form button');
      await page.waitForFunction(() => document.querySelector('#jsp-output').textContent.includes('Ilham'));
    }

    const loop = { python: 'while True:\n    pass', ruby: 'loop {}', c: 'int main(void) { while (1) {} }', cpp: 'int main() { while (true) {} }' }[language] || 'while (true) {}';
    await page.$eval('#jsp-code', (el, code) => { el.value = code; }, loop);
    await click('#jsp-run');
    await page.waitForFunction(() => document.querySelector('#jsp-status').textContent === 'Running…');
    await new Promise((resolve) => setTimeout(resolve, 250));
    await click('#jsp-stop');
    assert.equal(await page.$eval('#jsp-stop', (el) => el.disabled), true);
    const recovered = { python: "print('recovered')", ruby: "puts 'recovered'", c: '#include <stdio.h>\nint main(void) { puts("recovered"); return 0; }', cpp: '#include <iostream>\nint main() { std::cout << "recovered\\n"; }' }[language] || "console.log('recovered');";
    await run(recovered);
    assert(await page.$eval('#jsp-output', (el) => el.textContent.includes('recovered')));

    if (process.env.ALL_EXAMPLES) {
      const names = await page.$eval('#jsp-examples', (el) => JSON.parse(el.textContent).map((item) => item.name));
      for (const name of names) {
        await click('#jsp-clear');
        await example(name);
        await click('#jsp-run');
        if (name === 'Interactive input') {
          await page.waitForFunction(() => !document.querySelector('#jsp-input-form').hidden);
          await click('#jsp-input-form button');
        }
        await page.waitForFunction(() => document.querySelector('#jsp-status').textContent.includes('Ran in') || document.querySelector('#jsp-status').textContent.includes('Threw'));
        assert(await page.$eval('#jsp-status', (el) => el.textContent.includes('Ran in')), `${language}: ${name} failed`);
        assert(await page.$eval('#jsp-output', (el) => el.textContent !== '(no output)'), `${language}: ${name} has no output`);
      }
      console.log(`PASS all ${names.length} ${language} examples execute`);
    }
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewport({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow in ${language} at ${width}px`);
    }
    console.log(`PASS built ${language}: lazy runtime, examples, pyramid indentation, primes, OOP, input, Stop/recovery and responsive layout`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS home/catalog/index do not load runtimes; submenu keyboard dismissal; no unexpected page errors.');
} catch (error) {
  if (page) console.error('Current URL:', page.url());
  if (page) console.error('Current status:', await page.$eval('#jsp-status', (el) => el.textContent).catch(() => 'not available'));
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
