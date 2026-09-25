// End-to-end assertions: drive real pages with real input and check the output.
// Anything printed under "actual output" still needs a human eye.
const { loadPage, read, set, click, sleep, errorStatuses } = require('./harness.cjs');

async function run(slug, fields = {}, { clicks = [], wait = 150 } = {}) {
  const page = loadPage(slug);
  for (const [sel, value] of Object.entries(fields)) set(page.w, sel, value);
  await sleep(wait);
  for (const sel of clicks) click(page.w, sel);
  await sleep(wait);
  return page;
}

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`}`);
};

(async () => {
  console.log('=== exact assertions ===');

  const cases = [
    ['base64 encode', 'base64-string-converter', { '#b64enc-input': 'hello' }, '#b64enc-output', 'aGVsbG8='],
    ['base64 encode unicode', 'base64-string-converter', { '#b64enc-input': 'héllo ✓' }, '#b64enc-output', 'aMOpbGxvIOKckw=='],
    ['base64 decode', 'base64-string-converter', { '#b64dec-input': 'aGVsbG8=' }, '#b64dec-output', 'hello'],
    ['html entity encode', 'html-entities', { '#he-input': '<a>' }, '#he-output', '&lt;a&gt;'],
    ['html entity decode', 'html-entities', { '#he-decode': true, '#he-input': '&lt;a&gt;' }, '#he-output', '<a>'],
    ['slugify', 'slugify', { '#slug-input': 'Hello, World!' }, '#slug-output', 'hello-world'],
    ['text to binary', 'text-to-binary', { '#bin-input': 'A' }, '#bin-output', '01000001'],
    ['binary to text', 'text-to-binary', { '#bin-decode': true, '#bin-input': '01000001' }, '#bin-output', 'A'],
    ['roman encode', 'roman-numeral', { '#roman-input': '14' }, '#roman-output', 'XIV'],
    ['roman encode 2024', 'roman-numeral', { '#roman-input': '2024' }, '#roman-output', 'MMXXIV'],
    ['roman decode', 'roman-numeral', { '#roman-dir': 'decode', '#roman-input': 'MMXXIV' }, '#roman-output', '2024'],
    ['json minify', 'json-minifier', { '#jmin-input': '{ "a" : 1 }' }, '#jmin-output', '{"a":1}'],
    ['markdown to html', 'markdown-to-html', { '#md-input': '# Hi' }, '#md-output', '<h1>Hi</h1>\n'],
    ['json sort off keeps order', 'json-formatter', { '#jf-input': '{"b":1,"a":2}', '#jf-sort': 'off' }, '#jf-output', '{\n  "b": 1,\n  "a": 2\n}'],
    ['json sort asc', 'json-formatter', { '#jf-input': '{"b":1,"a":2}', '#jf-sort': 'asc' }, '#jf-output', '{\n  "a": 2,\n  "b": 1\n}'],
    ['json sort desc', 'json-formatter', { '#jf-input': '{"b":1,"a":2}', '#jf-sort': 'desc' }, '#jf-output', '{\n  "b": 1,\n  "a": 2\n}'],
    ['json sort desc nested', 'json-formatter', { '#jf-input': '{"a":{"d":1,"c":2}}', '#jf-sort': 'desc' }, '#jf-output', '{\n  "a": {\n    "d": 1,\n    "c": 2\n  }\n}'],
    ['json sort asc keeps array order', 'json-formatter', { '#jf-input': '{"z":[3,1,2],"a":1}', '#jf-sort': 'asc' }, '#jf-output', '{\n  "a": 1,\n  "z": [\n    3,\n    1,\n    2\n  ]\n}'],
    ['json sort asc then minify', 'json-formatter', { '#jf-input': '{"b":1,"a":2}', '#jf-sort': 'asc' }, '#jf-output', '{"a":2,"b":1}', ['#jf-minify']],
  ];

  for (const [label, slug, fields, out, expect, clicks] of cases) {
    const page = await run(slug, fields, { clicks: clicks || [] });
    check(label, read(page.w, out), expect);
    page.dom.window.close();
  }

  console.log('\n=== round trips ===');

  // JSON -> YAML -> JSON
  {
    const original = { name: 'Ada', tags: ['math', 'code'], nested: { ok: true, n: 42 } };
    const a = await run('json-to-yaml', { '#j2y-input': JSON.stringify(original) });
    const yamlText = read(a.w, '#j2y-output');
    a.dom.window.close();
    const b = await run('yaml-to-json', { '#y2j-input': yamlText });
    check('json -> yaml -> json', JSON.parse(read(b.w, '#y2j-output')), original);
    b.dom.window.close();
  }

  // JSON -> TOML -> JSON
  {
    const original = { title: 'Demo', server: { port: 8080, hosts: ['a', 'b'] } };
    const a = await run('json-to-toml', { '#j2t-input': JSON.stringify(original) });
    const tomlText = read(a.w, '#j2t-output');
    a.dom.window.close();
    const b = await run('toml-to-json', { '#t2j-input': tomlText });
    check('json -> toml -> json', JSON.parse(read(b.w, '#t2j-output')), original);
    b.dom.window.close();
  }

  // YAML -> TOML -> YAML
  {
    const yamlText = 'title: Demo\nserver:\n  port: 8080\n';
    const a = await run('yaml-to-toml', { '#y2t-input': yamlText });
    const tomlText = read(a.w, '#y2t-output');
    a.dom.window.close();
    const b = await run('toml-to-yaml', { '#t2y-input': tomlText });
    check('yaml -> toml -> yaml', read(b.w, '#t2y-output').trim(), yamlText.trim());
    b.dom.window.close();
  }

  // XML -> JSON -> XML
  {
    const xml = '<root><item>one</item><item>two</item></root>';
    const a = await run('xml-to-json', { '#x2j-input': xml });
    const jsonText = read(a.w, '#x2j-output');
    a.dom.window.close();
    const b = await run('json-to-xml', { '#j2x-input': jsonText });
    check(
      'xml -> json -> xml',
      read(b.w, '#j2x-output').replace(/\s+/g, '').replace(/^<\?xml[^>]*\?>/, ''),
      xml,
    );
    b.dom.window.close();
  }

  // base64 round trip through the url-safe variant
  {
    const a = await run('base64-string-converter', { '#b64-encode-urlsafe': true, '#b64enc-input': '??>>' });
    const encoded = read(a.w, '#b64enc-output');
    a.dom.window.close();
    const b = await run('base64-string-converter', { '#b64-decode-urlsafe': true, '#b64dec-input': encoded });
    check('base64 url-safe round trip', read(b.w, '#b64dec-output'), '??>>');
    b.dom.window.close();
  }

  // json-viewer honours the same sort control
  {
    const asc = await run('json-viewer', { '#jv-input': '{"b":1,"a":2}', '#jv-sort': 'asc' });
    const ascText = read(asc.w, '#jv-tree');
    check('json-viewer sort asc order', ascText.indexOf('a:') < ascText.indexOf('b:'), true);
    asc.dom.window.close();

    const desc = await run('json-viewer', { '#jv-input': '{"b":1,"a":2}', '#jv-sort': 'desc' });
    const descText = read(desc.w, '#jv-tree');
    check('json-viewer sort desc order', descText.indexOf('b:') < descText.indexOf('a:'), true);
    desc.dom.window.close();
  }

  console.log('\n=== actual output (review by eye) ===');

  const review = [
    ['text-to-unicode', 'text-to-unicode', { '#uni-input': 'A' }, '#uni-output'],
    ['text-to-unicode', 'text-to-unicode decode', { '#uni-dir': 'decode', '#uni-input': 'U+0041' }, '#uni-output'],
    ['text-to-nato-alphabet', 'text-to-nato-alphabet', { '#nato-input': 'AB' }, '#nato-output'],
    ['numeronym', 'numeronym', { '#num-input': 'internationalization kubernetes accessibility' }, '#num-output'],
    ['color-converter', 'color-converter', { '#color-input': '#ff0000' }, '#color-output'],
    ['temperature-converter', 'temperature-converter', { '#temp-input': '100', '#temp-unit': 'C' }, '#temp-output'],
    ['ipv4-address-converter', 'ipv4-address-converter', { '#ip-input': '192.168.1.1' }, '#ip-output'],
    ['email-normalizer', 'email-normalizer', { '#email-input': 'First.Last+tag@gmail.com' }, '#email-output'],
    ['sql-prettify', 'sql-prettify', { '#sql-input': 'select a,b from t where a=1 order by b desc' }, '#sql-output'],
    ['json-to-csv', 'json-to-csv', { '#jcsv-input': '[{"a":1,"b":"x"},{"a":2,"b":"y,z"}]' }, '#jcsv-output'],
    ['chmod-calculator', 'chmod-calculator', { '#chmod-octal': '755' }, '#chmod-results'],
    ['percentage-calculator', 'percentage-calculator', { '#pct-a': '15', '#pct-b': '200' }, '#pct-results'],
  ];

  for (const [slug, label, fields, out] of review) {
    const page = await run(slug, fields);
    const value = read(page.w, out);
    const err = errorStatuses(page.w);
    console.log(`\n${label}`);
    console.log(`  ${JSON.stringify(value && value.slice(0, 300))}${err.length ? `\n  error status: ${err.join(' | ')}` : ''}`);
    page.dom.window.close();
  }

  console.log(`\n${failures ? `${failures} FAILED` : 'all assertions passed'}`);
  process.exit(failures ? 1 : 0);
})().catch((error) => {
  console.error('e2e crashed:', error);
  process.exit(1);
});
