// End-to-end assertions: drive real pages with real input and check the output.
// Anything printed under "actual output" still needs a human eye.
const fs = require('fs');
const path = require('path');
const { ROOT, loadPage, loadFile, read, set, click, sleep, errorStatuses } = require('./harness.cjs');

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

  console.log('\n=== network tools (mocked fetch) ===');

  // Serve canned responses and remember which URLs were asked for.
  const http = (status, body) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new Error('empty body');
      return body;
    },
  });

  function mock(routes) {
    const seen = [];
    globalThis.fetch = async (url) => {
      seen.push(String(url));
      for (const [fragment, reply] of routes) {
        if (String(url).includes(fragment)) return typeof reply === 'function' ? reply(url) : reply;
      }
      throw new Error(`unrouted request: ${url}`);
    };
    return seen;
  }

  async function lookupWith(slug, fields, routes, buttonSel) {
    const page = loadPage(slug);
    const seen = mock(routes);
    for (const [sel, value] of Object.entries(fields)) set(page.w, sel, value);
    await sleep(80);
    click(page.w, buttonSel);
    await sleep(200);
    const out = {
      seen,
      results: read(page.w, slug === 'dns-lookup' ? '#dns-results' : '#whois-result'),
      status: read(page.w, '#dns-status') || read(page.w, '#whois-status'),
      errors: errorStatuses(page.w),
      finish: () => page.finish(),
      close: () => page.dom.window.close(),
    };
    return out;
  }

  const A_RECORDS = {
    Status: 0,
    Answer: [
      { name: 'example.com', type: 1, TTL: 121, data: '172.66.147.243' },
      { name: 'example.com', type: 1, TTL: 121, data: '104.20.23.154' },
    ],
  };

  // --- DNS ---
  {
    const dns = await lookupWith('dns-lookup', { '#dns-input': 'example.com', '#dns-type': 'A' }, [['cloudflare-dns.com', http(200, A_RECORDS)]], '#dns-lookup-btn');
    check('dns: records rendered', dns.results.includes('172.66.147.243') && dns.results.includes('104.20.23.154'), true);
    check('dns: type column', dns.results.includes('A'), true);
    check('dns: ttl column', dns.results.includes('121'), true);
    check('dns: status counts records', dns.status.includes('2 records via Cloudflare'), true);
    check('dns: no errors', dns.finish().thrown.length + dns.finish().errors.length, 0);
    dns.close();
  }
  {
    const dns = await lookupWith('dns-lookup', { '#dns-input': 'example.com', '#dns-type': 'A' }, [
      ['cloudflare-dns.com', http(500, undefined)],
      ['dns.google', http(200, A_RECORDS)],
    ], '#dns-lookup-btn');
    check('dns: falls back to Google', dns.status.includes('via Google'), true);
    check('dns: fallback still renders', dns.results.includes('172.66.147.243'), true);
    dns.close();
  }
  {
    const dns = await lookupWith('dns-lookup', { '#dns-input': 'nope.example', '#dns-type': 'A' }, [
      ['cloudflare-dns.com', http(200, { Status: 3 })],
      ['dns.google', http(200, { Status: 3 })],
    ], '#dns-lookup-btn');
    check('dns: NXDOMAIN reported', dns.status.includes('NXDOMAIN'), true);
    check('dns: NXDOMAIN is not an error', dns.errors.length, 0);
    dns.close();
  }
  {
    const dns = await lookupWith('dns-lookup', { '#dns-input': 'https://Example.COM/some/path?q=1', '#dns-type': 'A' }, [
      ['cloudflare-dns.com', http(200, A_RECORDS)],
    ], '#dns-lookup-btn');
    check('dns: input stripped to a bare host', dns.seen[0].includes('name=example.com'), true);
    check('dns: only the host was sent', dns.seen[0].includes('path'), false);
    dns.close();
  }
  {
    const dns = await lookupWith('dns-lookup', { '#dns-input': 'not a domain', '#dns-type': 'A' }, [['cloudflare-dns.com', http(200, A_RECORDS)]], '#dns-lookup-btn');
    check('dns: nonsense rejected before requesting', dns.seen.length, 0);
    check('dns: nonsense message', dns.status.includes('does not look like a domain name'), true);
    dns.close();
  }

  // --- WHOIS / RDAP ---
  const BOOTSTRAP = {
    services: [
      [['com', 'net'], ['https://rdap.verisign.com/com/v1/']],
      [['dev', 'app'], ['https://pubapi.registry.google/rdap/']],
    ],
  };
  const RDAP_COM = {
    objectClassName: 'domain',
    handle: '2336799_DOMAIN_COM-VRSN',
    ldhName: 'EXAMPLE.COM',
    status: ['client delete prohibited', 'client transfer prohibited', 'client update prohibited'],
    entities: [{
      objectClassName: 'entity',
      handle: '376',
      roles: ['registrar'],
      publicIds: [{ type: 'IANA Registrar ID', identifier: '376' }],
      vcardArray: ['vcard', [['version', {}, 'text', '4.0'], ['fn', {}, 'text', 'Example Registrar Inc.']]],
      entities: [{
        objectClassName: 'entity',
        roles: ['abuse'],
        vcardArray: ['vcard', [['version', {}, 'text', '4.0'], ['fn', {}, 'text', 'Abuse Desk'], ['email', {}, 'text', 'abuse@example-registrar.test']]],
      }],
    }],
    events: [
      { eventAction: 'registration', eventDate: '1995-08-14T04:00:00Z' },
      { eventAction: 'expiration', eventDate: '2027-08-13T04:00:00Z' },
      { eventAction: 'last changed', eventDate: '2026-08-14T08:01:43Z' },
    ],
    nameservers: [{ ldhName: 'ELLIOTT.NS.CLOUDFLARE.COM' }, { ldhName: 'HERA.NS.CLOUDFLARE.COM' }],
    secureDNS: { delegationSigned: true, dsData: [{ keyTag: 2371, algorithm: 13, digestType: 2, digest: 'C988' }] },
  };
  {
    const w = await lookupWith('whois-lookup', { '#whois-input': 'example.com' }, [
      ['data.iana.org', http(200, BOOTSTRAP)],
      ['rdap.verisign.com', http(200, RDAP_COM)],
    ], '#whois-lookup-btn');
    check('whois: registrar shown', w.results.includes('Example Registrar Inc.'), true);
    check('whois: registrar id shown', w.results.includes('376'), true);
    check('whois: registered date', w.results.includes('1995-08-14'), true);
    check('whois: expiry date', w.results.includes('2027-08-13'), true);
    check('whois: last changed date', w.results.includes('2026-08-14'), true);
    check('whois: nameservers lowercased', w.results.includes('elliott.ns.cloudflare.com'), true);
    check('whois: status chips', w.results.includes('client transfer prohibited'), true);
    check('whois: dnssec state', w.results.includes('signed'), true);
    check('whois: nested abuse contact', w.results.includes('abuse@example-registrar.test'), true);
    check('whois: asks the registry directly', w.seen.some((u) => u.startsWith('https://rdap.verisign.com/com/v1/domain/example.com')), true);
    check('whois: no errors', w.finish().thrown.length + w.finish().errors.length, 0);
    w.close();
  }
  {
    const w = await lookupWith('whois-lookup', { '#whois-input': 'example.io' }, [
      ['data.iana.org', http(200, BOOTSTRAP)],
      ['rdap.org', http(200, RDAP_COM)],
    ], '#whois-lookup-btn');
    check('whois: unsupported TLD explained', w.status.includes('No RDAP service is published for .io'), true);
    check('whois: unsupported TLD says why', w.status.includes('plain WHOIS'), true);
    check('whois: no pointless rdap.org retry', w.seen.length, 1);
    w.close();
  }
  {
    const w = await lookupWith('whois-lookup', { '#whois-input': 'example.com' }, [
      ['data.iana.org', http(200, BOOTSTRAP)],
      ['rdap.verisign.com', http(404, undefined)],
      ['rdap.org', http(200, RDAP_COM)],
    ], '#whois-lookup-btn');
    check('whois: falls back to rdap.org', w.results.includes('rdap.org'), true);
    check('whois: fallback still renders', w.results.includes('Example Registrar Inc.'), true);
    w.close();
  }
  {
    const w = await lookupWith('whois-lookup', { '#whois-input': 'example.com' }, [
      ['data.iana.org', http(200, BOOTSTRAP)],
      ['rdap.verisign.com', http(404, { title: 'Not Found', description: ['example.com not found'] })],
      ['rdap.org', http(404, { title: 'No RDAP service is available for this resource' })],
    ], '#whois-lookup-btn');
    check('whois: json error body surfaced', w.status.includes('No RDAP service is available'), true);
    w.close();
  }
  {
    const w = await lookupWith('whois-lookup', { '#whois-input': 'example.com' }, [
      ['data.iana.org', http(200, BOOTSTRAP)],
      ['rdap.verisign.com', http(200, { ...RDAP_COM, redacted: [{ name: 'Registrant Email' }] })],
    ], '#whois-lookup-btn');
    check('whois: redaction disclosed', w.results.includes('redacted by the registry'), true);
    w.close();
  }

  globalThis.fetch = () => Promise.reject(new Error('offline (harness)'));

  console.log('\n=== catalog page ===');
  {
    const page = loadFile(path.join(ROOT, 'tools', 'index.html'), 'https://ilham.dev/tools/');
    const { document } = page.w;
    const search = document.querySelector('#tools-search');
    const key = (init) => document.dispatchEvent(new page.w.KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
    const visibleCards = () => [...document.querySelectorAll('[data-tool-card]')].filter((c) => !c.hidden).length;

    check('catalog: script ran', page.scripts.length, 1);
    check('catalog: all cards visible at rest', visibleCards() > 80, true);

    key({ key: 'k', metaKey: true });
    check('catalog: Cmd+K focuses search', document.activeElement === search, true);

    search.blur();
    key({ key: 'k', ctrlKey: true });
    check('catalog: Ctrl+K focuses search', document.activeElement === search, true);

    search.value = 'yaml';
    search.dispatchEvent(new page.w.Event('input', { bubbles: true }));
    const yamlOnly = visibleCards();
    check('catalog: filters to a few cards', yamlOnly > 0 && yamlOnly < 15, true);
    check('catalog: filter keeps yaml tools', [...document.querySelectorAll('[data-tool-card]')].filter((c) => !c.hidden).every((c) => c.getAttribute('data-search').includes('yaml')), true);

    key({ key: 'Escape' });
    check('catalog: Escape clears the query', search.value, '');
    check('catalog: Escape restores every card', visibleCards() > 80, true);
    check('catalog: Escape keeps focus while text remained', document.activeElement === search, true);

    key({ key: 'Escape' });
    check('catalog: second Escape leaves the field', document.activeElement === search, false);

    // A plain "k" must not hijack typing elsewhere on the page.
    key({ key: 'k' });
    check('catalog: bare k is ignored', document.activeElement === search, false);

    const result = page.finish();
    check('catalog: no uncaught errors', result.thrown.length + result.errors.length, 0);
    page.dom.window.close();
  }

  console.log('\n=== sort button ===');
  {
    const page = loadPage('json-formatter');
    const button = page.w.document.querySelector('#jf-sort');
    const label = () => button.querySelector('.tool-sort-text').textContent;
    const labels = [label()];
    const pressed = [button.getAttribute('aria-pressed')];
    for (let i = 0; i < 3; i += 1) {
      click(page.w, '#jf-sort');
      labels.push(label());
      pressed.push(button.getAttribute('aria-pressed'));
    }
    check('sort button: label cycles off -> ↑ -> ↓ -> off', labels, ['off', '↑', '↓', 'off']);
    check('sort button: pressed only while sorted', pressed, ['false', 'true', 'true', 'false']);
    check('sort button: title names the next action', button.title, 'Sort keys A → Z');
    page.dom.window.close();
  }
  {
    // jsdom has no layout engine, so guard the size by inspecting the rule.
    const css = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'css', 'tools.css'), 'utf8');
    const rule = css.slice(css.indexOf('.tool-sort-btn {'), css.indexOf('.tool-sort-btn:hover'));
    check('sort button: box has a fixed width', /(^|\s)width:\s*\d/.test(rule), true);
    check('sort button: box has a fixed height', /(^|\s)height:\s*\d/.test(rule), true);
    check('sort button: press does not change the weight', /aria-pressed="true"\][^{]*\{[^}]*font-weight/.test(css), false);
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
