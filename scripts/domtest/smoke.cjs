// Smoke test: boot every built tool page, poke every field and button, and
// report anything that throws outside the tool's own error handling.
const fs = require('fs');
const path = require('path');
const { TOOLS, loadPage, bodyText, errorStatuses, sleep } = require('./harness.cjs');

// Field values for inputs whose placeholder is prose rather than an example.
const SAMPLES = {
  'yaml-viewer': { '#yv-input': 'a: 1\nb:\n  - x\n  - y: 2\n' },
  'ip-lookup': { '#ip-input': '8.8.8.8' },
  'json-viewer': { '#jv-input': '{"a":1,"b":[1,2,{"c":true}],"d":null}' },
  'markdown-to-html': { '#md-input': '# Hello\n\nSome **bold** text.\n' },
  'benchmark-builder': { '#bb-input': '1 + 1' },
};

// A placeholder is a usable example only if it isn't a prose hint.
function exampleFrom(el) {
  const ph = el.placeholder || '';
  if (ph.length < 2) return null;
  if (/…|\.\.\./.test(ph)) return null;
  if (/^(paste|type|enter|write|search|choose|leave|select|e\.g\.)/i.test(ph)) return null;
  return ph;
}

function poke(w, slug) {
  const { document } = w;
  const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));

  // 1. fill empty fields with their own example, leaving sensible defaults alone
  document
    .querySelectorAll('textarea, input[type="text"], input[type="search"], input[type="number"], input[type="password"]')
    .forEach((el) => {
      if (el.id === 'tools-search' || el.value !== '') return;
      const perSlug = (SAMPLES[slug] || {})[el.id ? `#${el.id}` : ''];
      const sample = perSlug !== undefined ? perSlug : exampleFrom(el);
      if (sample === null || sample === undefined) return;
      if (el.type === 'number' && !/^-?\d+(\.\d+)?$/.test(sample)) return;
      el.value = sample;
      fire(el, 'input');
      fire(el, 'change');
    });

  document.querySelectorAll('input[type="range"]').forEach((el) => {
    el.value = el.min || '0';
    fire(el, 'input');
    fire(el, 'change');
  });
  document.querySelectorAll('select').forEach((el) => {
    if (el.options.length > 1) el.selectedIndex = el.options.length - 1;
    fire(el, 'change');
  });
  document.querySelectorAll('input[type="checkbox"]').forEach((el) => {
    el.checked = !el.checked;
    fire(el, 'change');
  });

  // 2. click everything clickable
  document.querySelectorAll('button, [data-copy], [data-download]').forEach((el) => {
    el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

(async () => {
  const slugs = fs.readdirSync(TOOLS).filter((d) => fs.statSync(path.join(TOOLS, d)).isDirectory()).sort();
  const report = [];

  for (const slug of slugs) {
    const page = loadPage(slug);
    const before = bodyText(page.w);
    const pristineErr = errorStatuses(page.w);

    let pokeError = null;
    try {
      poke(page.w, slug);
    } catch (error) {
      pokeError = error.message;
    }
    await sleep(120);

    const after = bodyText(page.w);
    const errStatus = errorStatuses(page.w);
    const result = page.finish();
    if (pokeError) result.thrown.push(`poke: ${pokeError}`);

    report.push({
      slug,
      scripts: page.scripts.length,
      changed: after !== before,
      outputBytes: after.length,
      pristineErr,
      errStatus,
      ...result,
    });

    page.dom.window.close();
  }

  const bad = report.filter((r) => r.thrown.length || r.rejections.length || r.errors.length);
  const silent = report.filter((r) => !r.changed && !r.outputBytes);
  const noload = report.filter((r) => r.scripts === 0);
  const errored = report.filter((r) => r.errStatus.length);
  const pristine = report.filter((r) => r.pristineErr.length);

  console.log(`checked ${report.length} tool pages`);
  console.log(`scripts executed: ${report.reduce((n, r) => n + r.scripts, 0)} across ${report.length - noload.length} pages`);
  if (noload.length) console.log(`\n!! FAIL: no scripts found on: ${noload.map((r) => r.slug).join(', ')}`);

  if (bad.length === 0) {
    console.log('no uncaught errors on any page');
  } else {
    console.log(`\n--- pages with uncaught errors (${bad.length}) ---`);
    for (const r of bad) {
      console.log(`\n${r.slug}`);
      r.thrown.forEach((t) => console.log('  throw     :', t));
      r.rejections.forEach((t) => console.log('  rejection :', t));
      r.errors.forEach((t) => console.log('  error     :', t.slice(0, 300)));
    }
  }
  if (silent.length) console.log(`\n--- no visible output (${silent.length}) ---\n${silent.map((r) => r.slug).join(', ')}`);
  if (errored.length) {
    console.log(`\n--- example input produced an error status (${errored.length}) ---`);
    for (const r of errored) console.log(`  ${r.slug}: ${r.errStatus.join(' | ').slice(0, 200)}`);
  }
  if (pristine.length) {
    console.log(`\n--- error shown before any interaction (${pristine.length}) ---`);
    for (const r of pristine) console.log(`  ${r.slug}: ${r.pristineErr.join(' | ').slice(0, 160)}`);
  }

  process.exit(bad.length || noload.length ? 1 : 0);
})();
