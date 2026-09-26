// End-to-end assertions: drive real pages with real input and check the output.
// Anything printed under "actual output" still needs a human eye.
const fs = require('fs');
const path = require('path');
const { ROOT, TOOLS, loadPage, loadFile, read, set, click, sleep, errorStatuses } = require('./harness.cjs');

// jsdom has no layout engine, so stylesheet guarantees are asserted by reading the
// built CSS instead of by measuring anything.
const CSS = fs
  .readdirSync(path.join(ROOT, 'css'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(ROOT, 'css', f), 'utf8'))
  .join('\n');

// Counted from the files that define the tools rather than typed in, so adding a
// tool does not need a test edit — while a sidebar, catalog or sitemap that
// disagrees with those files is still caught.
const TOOL_COUNT = fs.readdirSync(path.join(ROOT, '..', 'content', 'tools')).filter((f) => f.endsWith('.md') && f !== '_index.md').length;

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

  console.log('\n=== background prerender ===');
  {
    // A browser may build this page in the background ahead of a click, and that
    // background run executes the page's script too. The IP lookup must not
    // spend a request on the free services until the page is really shown.
    const page = loadPage('ip-lookup', { prerendering: true });
    const seen = mock([['ipwho.is', http(200, {
      ip: '203.0.113.7', success: true, type: 'IPv4', country: 'Indonesia', country_code: 'ID',
      city: 'Jakarta', continent: 'Asia', region: 'Jakarta',
      connection: { asn: 7713, org: 'Example ISP', isp: 'Example ISP' },
    })]]);
    await sleep(150);
    check('prerender: no request while the page is only being built', seen.length, 0);

    page.w.document.prerendering = false;
    page.w.document.dispatchEvent(new page.w.Event('prerenderingchange'));
    await sleep(200);
    check('prerender: request fires once the page is shown', seen.length, 1);
    check('prerender: result renders after activation', read(page.w, '#ip-result').includes('203.0.113.7'), true);
    page.finish();
    page.dom.window.close();
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
    // Same trap as the sidebar: ranked groups use negative `order` inside this
    // flex container, so anything else in here would sort below the results.
    check('catalog: the catalog holds nothing but ranked groups', [...document.querySelector('#tools-catalog').children].every((c) => c.hasAttribute('data-tools-group')), true);

    key({ key: 'k', metaKey: true });
    check('catalog: Cmd+K focuses search', document.activeElement === search, true);

    search.blur();
    key({ key: 'k', ctrlKey: true });
    check('catalog: Ctrl+K focuses search', document.activeElement === search, true);

    search.value = 'yaml';
    search.dispatchEvent(new page.w.Event('input', { bubbles: true }));
    const yamlOnly = visibleCards();
    check('catalog: filters to a few cards', yamlOnly > 0 && yamlOnly < 15, true);

    // Ranking is expressed as CSS `order`, so this is also the visual order.
    const ranked = () =>
      [...document.querySelectorAll('[data-tool-card]')]
        .filter((c) => !c.hidden)
        .sort((a, b) => Number(a.style.order) - Number(b.style.order));
    check('catalog: the best match is ranked first', ranked()[0].getAttribute('href').includes('yaml'), true);

    // jsdom has no layout engine, so the only way to catch "el.hidden = true but
    // display:flex keeps it on screen" is to read the built stylesheet.
    check('catalog: the hidden attribute beats component display rules', /\[hidden\]\s*\{\s*display:\s*none\s*!important/.test(CSS), true);

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

  console.log('\n=== fuzzy search ===');
  {
    const page = loadFile(path.join(ROOT, 'tools', 'index.html'), 'https://ilham.dev/tools/');
    const { document } = page.w;
    const input = document.querySelector('#tools-search');
    const fuzzy = document.querySelector('#tools-fuzzy');
    const empty = document.querySelector('#tools-empty');
    const cards = [...document.querySelectorAll('[data-tool-card]')];
    const name = (card) => card.querySelector('.tool-card-name').textContent;

    const rank = (query) => {
      input.value = query;
      input.dispatchEvent(new page.w.Event('input', { bubbles: true }));
      return cards
        .filter((card) => !card.hidden)
        .sort((a, b) => Number(a.style.order) - Number(b.style.order));
    };
    const top = (query) => {
      const first = rank(query)[0];
      return first ? name(first) : null;
    };
    const shows = (query, title) => rank(query).some((card) => name(card) === title);

    // Multi-token queries: every token has to match, in any order.
    check('search: "generator qr code" finds the QR tool', top('generator qr code'), 'QR Code Generator');
    check('search: "sha 256" finds the hash tool', top('sha 256'), 'Hash Text');
    check('search: "base 64" finds base64', String(top('base 64')).startsWith('Base64'), true);
    check('search: "domain lookup" finds WHOIS', top('domain lookup'), 'WHOIS Lookup');

    // Ranking, which matters more than fuzziness. With a plain substring filter
    // "ip" put JSON Minifier first (str-IP) and the IP tool fourth.
    check('search: "ip" ranks the IP tool first', top('ip'), 'IP & Geolocation Lookup');
    check('search: "time" ranks a time tool first', ['Time Zone Converter', 'Timestamp Converter'].includes(top('time')), true);
    check('search: "password" ranks password strength first', top('password'), 'Password Strength');

    // One edit away.
    check('search: "qr genereator" still finds the QR tool', top('qr genereator'), 'QR Code Generator');
    check('search: "json formater" still finds the formatter', top('json formater'), 'JSON Formatter');
    check('search: "uuid generatr" still finds the UUID tool', top('uuid generatr'), 'UUID Generator');
    check('search: "scheduler" still finds crontab', top('scheduler'), 'Crontab Generator');

    // The two guards that keep fuzzy matching from turning into noise.
    check('search: "time" does not drag in MIME Types', shows('time', 'MIME Types'), false);
    check('search: "hash" does not drag in the Git cheatsheet', shows('hash', 'Git Cheatsheet'), false);

    // Subsequences, but only a word-initial one.
    check('search: "b64" finds base64', String(top('b64')).startsWith('Base64'), true);

    // Keywords, which no amount of fuzziness can invent.
    check('search: keywords are searched too ("compare")', top('compare'), 'JSON Diff');
    check('search: keywords are searched too ("2fa")', top('2fa'), 'OTP Generator');
    check('search: keywords are searched too ("unique id")', top('unique id'), 'UUID Generator');
    check('search: keywords are searched too ("bearer")', top('bearer'), 'JWT Parser');
    check('search: keywords are searched too ("color picker")', top('color picker'), 'Color Converter');
    check('search: keywords are searched too ("screen size")', top('screen size'), 'Device Information');
    check('search: keywords are searched too ("keyboard shortcut")', top('keyboard shortcut'), 'Keycode Info');
    check('search: keywords are searched too ("bcrypt generator")', top('bcrypt generator'), 'bcrypt');
    check('search: keywords are searched too ("rsa key match")', top('rsa key match'), 'RSA Key Pair');
    check('search: keywords are searched too ("openssl")', top('openssl'), 'RSA Key Pair');
    check('search: keywords are searched too ("jwt verify")', top('jwt verify'), 'JWT Parser');
    check('search: keywords are searched too ("hs256")', top('hs256'), 'JWT Parser');

    // Typed the way people actually type: run together, abbreviated, inflected,
    // and with "2" for "to".
    check('search: "qt generater" finds the QR tool', top('qt generater'), 'QR Code Generator');
    check('search: "qrcode" finds the QR tool', top('qrcode'), 'QR Code Generator');
    check('search: "qrgenerator" finds the QR tool', top('qrgenerator'), 'QR Code Generator');
    check('search: "jsonformatter" finds the formatter', top('jsonformatter'), 'JSON Formatter');
    check('search: "json 2 yaml" finds the converter', top('json 2 yaml'), 'JSON to YAML');
    check('search: "md 2 html" finds the markdown tool', top('md 2 html'), 'Markdown to HTML');
    check('search: "screen sz" finds device information', top('screen sz'), 'Device Information');
    check('search: "pwd gen" finds a generator', top('pwd gen'), 'Token Generator');
    check('search: "html entity" finds the entities tool', top('html entity'), 'HTML Entities');
    check('search: "status code" finds the status codes', top('status code'), 'HTTP Status Codes');
    check('search: "mime type" finds the MIME types', top('mime type'), 'MIME Types');
    // The shorthand map must not touch a token that only looks like one.
    check('search: "sha 256" is not read as "sha to56"', top('sha 256'), 'Hash Text');
    check('search: "ip 4" is not read as "ip for"', top('ip 4'), 'IPv4 Subnet Calculator');

    // Nonsense, and real terms the catalog has no tool for, have to keep finding
    // nothing, or fuzzy matching is just a random generator. "imei" is the
    // interesting one: it sits inside "date time iso" once the spaces go.
    for (const nonsense of ['asdfgh', 'xyz', 'qqq', 'nonsense', 'kubernetes', 'imei']) {
      check(`search: "${nonsense}" finds nothing`, rank(nonsense).length, 0);
    }
    check('search: the empty state is shown when nothing matches', empty.hidden, false);

    // The UI has to admit when the match was not something the user typed.
    rank('json formater');
    check('search: a fuzzy match says so', fuzzy.hidden, false);
    rank('qt generater');
    check('search: two typos in one query still say so', fuzzy.hidden, false);
    rank('json formatter');
    check('search: an exact match does not', fuzzy.hidden, true);

    rank('');
    check('search: clearing restores every card', cards.filter((card) => !card.hidden).length > 80, true);
    check('search: clearing drops the ranking', cards.every((card) => card.style.order === ''), true);

    const result = page.finish();
    check('search: no uncaught errors', result.thrown.length + result.errors.length, 0);
    page.dom.window.close();
  }

  console.log('\n=== sidebar search ===');
  {
    const page = loadPage('uuid-generator');
    const { document } = page.w;
    const input = document.querySelector('#tool-nav-search');
    const nav = document.querySelector('.tool-nav');
    const navSearch = document.querySelector('.tool-nav-search');
    const empty = document.querySelector('#tool-nav-empty');
    const links = [...document.querySelectorAll('.tool-nav a')];
    const name = (link) => link.textContent.trim();
    const shown = () =>
      links
        .filter((link) => !link.hidden)
        .sort((a, b) => Number(a.parentElement.style.order) - Number(b.parentElement.style.order));
    const selected = () => document.querySelector('.tool-nav a.selected');
    const type = (value) => {
      input.value = value;
      input.dispatchEvent(new page.w.Event('input', { bubbles: true }));
    };
    const key = (key_) => input.dispatchEvent(new page.w.KeyboardEvent('keydown', { key: key_, bubbles: true, cancelable: true }));

    check('sidebar: the field is there', Boolean(input), true);
    check('sidebar: every tool is listed', links.length, TOOL_COUNT);
    // The field must not share a flex container with the ranked groups: a flex
    // item's default `order` is 0 and ranked groups use negative values, so
    // sharing one sorted the field to the bottom of the sidebar.
    check('sidebar: the field is outside the ranked list', nav.querySelector('.tool-nav-list').contains(navSearch), false);
    check('sidebar: the field is the first thing in the nav', nav.firstElementChild, navSearch);
    check('sidebar: the ranked list is a flex container', /\.tool-nav-list\{[^}]*display:flex/.test(CSS), true);
    // ...and the mobile rule that reopens the collapsed nav must not clobber it.
    check('sidebar: the ranked list keeps its own display on mobile', /#tool-nav-toggle:checked~\.tool-nav\{display:block\}/.test(CSS), true);

    document.dispatchEvent(new page.w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true, cancelable: true }));
    check('sidebar: Cmd+K focuses the field', document.activeElement === input, true);

    type('uuid');
    check('sidebar: "uuid" narrows the list', shown().length <= 2, true);
    check('sidebar: ...to the UUID generator', name(shown()[0]), 'UUID Generator');

    type('domain');
    check('sidebar: keywords work here too ("domain")', name(shown()[0]), 'WHOIS Lookup');

    // Ranking matters here because Enter follows the preselected row.
    type('ip');
    check('sidebar: "ip" ranks the IP tool first', name(shown()[0]), 'IP & Geolocation Lookup');
    check('sidebar: the best match is preselected', name(selected()), 'IP & Geolocation Lookup');
    check('sidebar: the categories are dropped while searching', nav.hasAttribute('data-searching'), true);

    type('generatr');
    check('sidebar: typos work here too', shown().length > 0, true);

    // The sidebar uses the same matcher as the catalog, so the shorthand and
    // multi-token shapes have to work here too — Enter follows the top row.
    type('qt generater');
    check('sidebar: two typos in one query work here too', name(shown()[0]), 'QR Code Generator');
    type('json 2 yaml');
    check('sidebar: the "2" shorthand works here too', name(shown()[0]), 'JSON to YAML');
    type('html entity');
    check('sidebar: singular finds the plural here too', name(shown()[0]), 'HTML Entities');

    type('qqqqq');
    check('sidebar: nothing matches', shown().length, 0);
    check('sidebar: the empty message is shown', empty.hidden, false);

    type('json');
    const first = name(shown()[0]);
    key('ArrowDown');
    check('sidebar: ArrowDown moves the selection', name(selected()) === first, false);
    key('ArrowUp');
    check('sidebar: ArrowUp comes back', name(selected()), first);
    key('ArrowUp');
    check('sidebar: ArrowUp wraps to the last row', name(selected()), name(shown()[shown().length - 1]));

    // Capture activation rather than navigating: jsdom does not follow anchors.
    let activated = null;
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        activated = link;
        event.preventDefault();
      });
    });
    const chosen = selected();
    key('Enter');
    check('sidebar: Enter activates the selected row', activated === chosen, true);

    type('qqqqq');
    key('Escape');
    check('sidebar: Escape clears the query', input.value, '');
    check('sidebar: Escape restores every tool', shown().length, TOOL_COUNT);
    check('sidebar: the categories come back', nav.hasAttribute('data-searching'), false);

    const result = page.finish();
    check('sidebar: no uncaught errors', result.thrown.length + result.errors.length, 0);
    page.dom.window.close();
  }

  console.log('\n=== sidebar survives a navigation ===');
  {
    const KEY = 'tk:tool-nav';
    const page = loadPage('uuid-generator');
    const input = page.w.document.querySelector('#tool-nav-search');
    input.value = 'json';
    input.dispatchEvent(new page.w.Event('input', { bubbles: true }));
    const narrowed = [...page.w.document.querySelectorAll('.tool-nav a')].filter((a) => !a.hidden).length;

    // Leaving the page is the only moment the query can be written down.
    page.w.dispatchEvent(new page.w.Event('pagehide'));
    const saved = page.w.sessionStorage.getItem(KEY);
    check('sidebar nav: the query is written down on the way out', JSON.parse(saved).q, 'json');
    page.dom.window.close();

    // Now land on another tool the way a click would: a brand new document that
    // can only know about the query through that storage.
    const next = loadPage('json-formatter', { session: { [KEY]: saved } });
    const nextInput = next.w.document.querySelector('#tool-nav-search');
    const visibleLinks = () => [...next.w.document.querySelectorAll('.tool-nav a')].filter((a) => !a.hidden).length;
    const type = (value) => {
      nextInput.value = value;
      nextInput.dispatchEvent(new next.w.Event('input', { bubbles: true }));
    };

    check('sidebar nav: the query comes back on the next page', nextInput.value, 'json');
    check('sidebar nav: the list comes back already narrowed', visibleLinks(), narrowed);
    check('sidebar nav: ...and is still ranked', next.w.document.querySelectorAll('.tool-nav a.selected').length, 1);

    // The point of keeping the query: deleting a character widens the list
    // instead of throwing the search away.
    type('j');
    check('sidebar nav: deleting a character widens the list', visibleLinks() > narrowed, true);
    type('jso');
    check('sidebar nav: typing more narrows it again', visibleLinks() <= narrowed, true);
    type('');
    check('sidebar nav: an empty query brings every tool back', visibleLinks(), TOOL_COUNT);
    check('sidebar nav: ...and the categories with them', next.w.document.querySelector('.tool-nav').hasAttribute('data-searching'), false);

    // A cleared field must be remembered as cleared, or the old query returns.
    next.w.dispatchEvent(new next.w.Event('pagehide'));
    check('sidebar nav: a cleared field is remembered as cleared', JSON.parse(next.w.sessionStorage.getItem(KEY)).q, '');
    const fresh = loadPage('uuid-generator', { session: { [KEY]: next.w.sessionStorage.getItem(KEY) } });
    check('sidebar nav: ...so the next page starts unfiltered', fresh.w.document.querySelector('#tool-nav-search').value, '');
    check('sidebar nav: ...and shows every tool', [...fresh.w.document.querySelectorAll('.tool-nav a')].filter((a) => !a.hidden).length, TOOL_COUNT);

    const result = next.finish();
    check('sidebar nav: no uncaught errors', result.thrown.length + result.errors.length, 0);
    fresh.dom.window.close();
    next.dom.window.close();
  }

  console.log('\n=== key and signature checking ===');
  {
    const { constants, createHmac, createSign, generateKeyPairSync } = require('crypto');

    // Two unrelated RSA pairs plus an EC one. Generated here rather than checked
    // in as a fixture, so the test has a real oracle and cannot pass by agreeing
    // with a mistake baked into a stored key.
    const a = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const b = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const ec = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const pem = (key, type) => key.export({ type, format: 'pem' });
    const publicA = pem(a.publicKey, 'spki');
    const privateA = pem(a.privateKey, 'pkcs8');
    const publicB = pem(b.publicKey, 'spki');
    const privateB = pem(b.privateKey, 'pkcs8');

    // --- RSA pair matching ---
    const rsa = loadPage('rsa-key-pair');
    const rdoc = rsa.w.document;
    const fill = (sel, value) => {
      const el = rdoc.querySelector(sel);
      el.value = value;
      el.dispatchEvent(new rsa.w.Event('input', { bubbles: true }));
    };
    const press = (sel) => rdoc.querySelector(sel).dispatchEvent(new rsa.w.MouseEvent('click', { bubbles: true, cancelable: true }));
    const rsaStatus = () => rdoc.querySelector('#rsa-check-status').textContent.trim();
    const until = async (test, tries = 60) => {
      for (let i = 0; i < tries; i += 1) {
        if (test()) return true;
        await sleep(50);
      }
      return false;
    };

    // The whole round trip: generate a pair, turn it into PEM, read the PEM back
    // and prove the two halves belong together.
    press('#rsa-generate');
    await until(() => rdoc.querySelector('#rsa-status').textContent.trim() !== 'Generating…');
    check('rsa: generating a pair succeeds', rdoc.querySelector('#rsa-status').textContent.trim(), 'Key pair ready');
    check('rsa: the output is PEM', rdoc.querySelector('#rsa-public').value.startsWith('-----BEGIN PUBLIC KEY-----'), true);
    press('#rsa-check-fill');
    press('#rsa-check');
    await sleep(200);
    check('rsa: the generated pair matches itself', rsaStatus().startsWith('Match'), true);

    fill('#rsa-check-public', publicA);
    fill('#rsa-check-private', privateA);
    press('#rsa-check');
    await sleep(150);
    check('rsa: a real pair matches', rsaStatus(), 'Match — both keys are 2048-bit and belong to the same pair');

    fill('#rsa-check-private', privateB);
    press('#rsa-check');
    await sleep(150);
    check('rsa: an unrelated private key does not match', rsaStatus().startsWith('No match'), true);
    check('rsa: ...and that is shown as an error', rdoc.querySelector('#rsa-check-status').classList.contains('err'), true);

    // PKCS#1 is what `openssl genrsa` prints, so it has to work, not just be
    // reported as unsupported.
    fill('#rsa-check-public', pem(a.publicKey, 'pkcs1'));
    fill('#rsa-check-private', pem(a.privateKey, 'pkcs1'));
    press('#rsa-check');
    await sleep(150);
    check('rsa: PKCS#1 keys are wrapped rather than refused', rsaStatus().startsWith('Match'), true);

    fill('#rsa-check-private', 'definitely not a key');
    press('#rsa-check');
    await sleep(50);
    check('rsa: junk gets a readable message', rsaStatus().includes('No PEM block found'), true);

    fill('#rsa-check-public', publicA);
    fill('#rsa-check-private', '');
    press('#rsa-check');
    await sleep(50);
    check('rsa: half a pair asks for the other half', rsaStatus(), 'Paste both keys');

    rdoc.querySelector('#rsa-public').value = '';
    press('#rsa-check-fill');
    check('rsa: "use the generated pair" reports a pair that is not there', rsaStatus(), 'Generate a pair first');

    const rsaResult = rsa.finish();
    check('rsa: no uncaught errors', rsaResult.thrown.length + rsaResult.errors.length, 0);
    rsa.dom.window.close();

    // --- JWT signatures ---
    const b64u = (value) => Buffer.from(value).toString('base64url');
    const makeToken = (header, claims, sign) => {
      const signed = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(claims))}`;
      return `${signed}.${b64u(sign(signed))}`;
    };

    const jwt = loadPage('jwt-parser');
    const jdoc = jwt.w.document;
    const put = (sel, value) => {
      const el = jdoc.querySelector(sel);
      el.value = value;
      el.dispatchEvent(new jwt.w.Event('input', { bubbles: true }));
    };
    const go = (sel) => jdoc.querySelector(sel).dispatchEvent(new jwt.w.MouseEvent('click', { bubbles: true, cancelable: true }));
    const verdict = async (token, key) => {
      put('#jwt-input', token);
      put('#jwt-key', key);
      go('#jwt-verify');
      await sleep(150);
      return jdoc.querySelector('#jwt-verify-status').textContent.trim();
    };

    const hs256 = makeToken({ alg: 'HS256', typ: 'JWT' }, { sub: '123' }, (input) => createHmac('sha256', 's3cret').update(input).digest());
    check('jwt: HS256 verifies with the right secret', (await verdict(hs256, 's3cret')).includes('is valid'), true);
    check('jwt: HS256 fails with the wrong secret', (await verdict(hs256, 'wrong')).includes('does not match'), true);

    // The whole point of the tool: an edited payload must not verify.
    const [head, , sig] = hs256.split('.');
    const tampered = `${head}.${b64u(JSON.stringify({ sub: 'admin' }))}.${sig}`;
    check('jwt: a tampered payload breaks the signature', (await verdict(tampered, 's3cret')).includes('does not match'), true);

    const rs256 = makeToken({ alg: 'RS256' }, { sub: '123' }, (input) => createSign('RSA-SHA256').update(input).sign(privateA));
    check('jwt: RS256 verifies with the matching public key', (await verdict(rs256, publicA)).includes('is valid'), true);
    check('jwt: RS256 fails with an unrelated public key', (await verdict(rs256, publicB)).includes('does not match'), true);

    const ps256 = makeToken({ alg: 'PS256' }, { sub: '123' }, (input) =>
      createSign('sha256').update(input).sign({ key: privateA, padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 }),
    );
    check('jwt: PS256 verifies (salt length taken from the hash)', (await verdict(ps256, publicA)).includes('is valid'), true);

    // JWS stores ECDSA as raw R||S, which is also what WebCrypto consumes. Node's
    // crypto module prints DER by default, so both shapes are exercised: the raw
    // one passes straight through, the DER one has to be normalised.
    const es256 = makeToken({ alg: 'ES256' }, { sub: '123' }, (input) =>
      createSign('sha256').update(input).sign({ key: pem(ec.privateKey, 'pkcs8'), dsaEncoding: 'ieee-p1363' }),
    );
    const ecPublic = pem(ec.publicKey, 'spki');
    check('jwt: ES256 verifies (raw R||S signature)', (await verdict(es256, ecPublic)).includes('is valid'), true);

    const es256der = makeToken({ alg: 'ES256' }, { sub: '123' }, (input) => createSign('sha256').update(input).sign(pem(ec.privateKey, 'pkcs8')));
    check('jwt: ES256 verifies (DER signature, normalised to raw)', (await verdict(es256der, ecPublic)).includes('is valid'), true);
    const shortSig = `${es256.split('.').slice(0, 2).join('.')}.${b64u(Buffer.alloc(32))}`;
    check('jwt: ES256 fails with a signature of the wrong length', (await verdict(shortSig, ecPublic)).includes('ECDSA signature'), true);
    check('jwt: ES256 is not accepted with an RSA key', (await verdict(es256, publicA)).includes('is valid'), false);

    const unsigned = `${b64u(JSON.stringify({ alg: 'none' }))}.${b64u(JSON.stringify({ sub: 'admin' }))}.`;
    check('jwt: alg "none" is refused', (await verdict(unsigned, 's3cret')).includes('unsigned'), true);
    const weird = `${b64u(JSON.stringify({ alg: 'toString' }))}.${b64u(JSON.stringify({ sub: '1' }))}.AAAA`;
    check('jwt: a nonsense alg does not fall through to the prototype', (await verdict(weird, 's3cret')).includes('cannot check'), true);
    check('jwt: a two-part token has nothing to check', (await verdict('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0', 's3cret')).includes('no signature'), true);
    check('jwt: an unreadable header is reported', (await verdict('not.a.token', 's3cret')).includes('not readable JSON'), true);

    put('#jwt-input', hs256);
    put('#jwt-key', '');
    go('#jwt-verify');
    await sleep(50);
    check('jwt: an empty key says which key is wanted', jdoc.querySelector('#jwt-verify-status').textContent.includes('Paste the secret to check HS256'), true);

    // A public key pasted where an HMAC secret belongs is the algorithm-confusion
    // attack, and there is no honest reason for that shape of input.
    const confused = makeToken({ alg: 'HS256' }, { sub: 'admin' }, (input) => createHmac('sha256', publicA).update(input).digest());
    check('jwt: algorithm confusion is refused', (await verdict(confused, publicA)).includes('algorithm-confusion'), true);
    check('jwt: ...and an RSA token is not checked with a secret', (await verdict(rs256, 's3cret')).includes('is valid'), false);

    const jwtResult = jwt.finish();
    check('jwt: no uncaught errors', jwtResult.thrown.length + jwtResult.errors.length, 0);
    jwt.dom.window.close();
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

  console.log('\n=== page wiring ===');
  {
    const html = fs.readFileSync(path.join(TOOLS, 'slugify', 'index.html'), 'utf8');
    const headEnd = html.indexOf('</head>');
    const bodyStart = html.indexOf('<body>');
    const head = html.slice(0, headEnd);
    const toolkitAt = head.indexOf('/js/toolkit.');
    const toolAt = head.indexOf('/js/tools/slugify.');

    check('wiring: toolkit module is declared inside <head>', toolkitAt > -1 && toolkitAt < headEnd, true);
    check('wiring: tool module is declared inside <head>', toolAt > -1 && toolAt < headEnd, true);
    check('wiring: modules are declared before the body starts', toolAt < bodyStart, true);
    check('wiring: toolkit loads before the tool script', toolkitAt < toolAt, true);

    const rules = html.match(/<script type=speculationrules>([\s\S]*?)<\/script>/);
    check('wiring: speculation rules present', Boolean(rules), true);
    let parsed = null;
    try {
      parsed = JSON.parse(rules[1].trim());
    } catch { /* left null */ }
    check('wiring: speculation rules survive minification as valid JSON', Boolean(parsed), true);
    check('wiring: prerender waits for a hover, not every link', parsed && parsed.prerender[0].eagerness, 'moderate');
    check('wiring: feeds are excluded from prerendering', JSON.stringify(parsed).includes('/*.xml'), true);

    // jsdom cannot run a view transition, so the only checkable part is that the
    // rules are there: the sidebar is named so it is held still rather than
    // faded out with the rest of the page.
    check('wiring: the sidebar is held still across a navigation', /\.tool-aside\{view-transition-name:tool-nav\}/.test(CSS), true);
    check('wiring: cross-document transitions are enabled', /@view-transition\{navigation:\s*auto/.test(CSS), true);
  }

  console.log('\n=== seo ===');
  {
    const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const ld = (html) => JSON.parse(html.match(/<script type=application\/ld\+json>([\s\S]*?)<\/script>/)[1]);
    const types = (html) => ld(html)['@graph'].map((n) => n['@type']);

    const qr = read('tools/qr-code-generator/index.html');
    const head = qr.slice(0, qr.indexOf('</head>'));
    check('seo: canonical is the page url', /<link rel=canonical href=https:\/\/ilham\.dev\/tools\/qr-code-generator\/>/.test(head), true);
    check('seo: robots asks for the full snippet', /name=robots content="index, follow, max-snippet:-1/.test(head), true);
    check('seo: nothing is noindex', /noindex/i.test(qr), false);
    check('seo: exactly one h1 on the page', (qr.match(/<h1[ >]/g) || []).length, 1);

    check('seo: a tool is declared as a SoftwareApplication', types(qr).includes('SoftwareApplication'), true);
    check('seo: a tool carries a breadcrumb trail', types(qr).includes('BreadcrumbList'), true);
    check('seo: a tool with written questions gets an FAQPage', types(qr).includes('FAQPage'), true);
    const app = ld(qr)['@graph'].find((n) => n['@type'] === 'SoftwareApplication');
    check('seo: the tool is declared free to use', app.offers.price, '0');
    check('seo: the breadcrumb points back at the catalog', ld(qr)['@graph'].find((n) => n['@type'] === 'BreadcrumbList').itemListElement[0].item, 'https://ilham.dev/tools/');

    const catalog = read('tools/index.html');
    check('seo: the catalog is a CollectionPage', types(catalog).includes('CollectionPage'), true);
    const slugs = [...catalog.matchAll(/class=tool-card href=\/tools\/([^/]+)\//g)].map((m) => m[1]);
    check('seo: the catalog links every tool', slugs.length, TOOL_COUNT);

    // Structured data has to describe what is actually on the page. Walk every
    // tool and check the schema agrees with the markup.
    const pages = slugs.map((slug) => read(`tools/${slug}/index.html`));
    // Every tool is written up, so this is TOOL_COUNT and not a number that has to be
    // remembered and updated — sync-tools.py already refuses to build a tool without
    // a guide, and this checks the guide actually reached the page.
    check('seo: every tool page has written content',
      pages.filter((h) => /class=tool-about/.test(h)).length, TOOL_COUNT);
    const withFaq = pages.filter((h) => types(h).includes('FAQPage'));
    check('seo: an FAQPage never appears without written questions', withFaq.filter((h) => !/class=tool-about/.test(h)).length, 0);
    check('seo: the FAQPage lists exactly the questions on the page',
      withFaq.filter((h) => ld(h)['@graph'].find((n) => n['@type'] === 'FAQPage').mainEntity.length !== (h.match(/<dt>/g) || []).length).length, 0);
    check('seo: every tool declares itself a SoftwareApplication',
      pages.filter((h) => !types(h).includes('SoftwareApplication')).length, 0);

    const sitemap = read('sitemap.xml');
    const dated = new Set([...sitemap.matchAll(/<loc>https:\/\/ilham\.dev\/tools\/([^/]+)\/<\/loc><lastmod>/g)].map((m) => m[1]));
    check('seo: every tool has a dated sitemap entry', slugs.filter((s) => !dated.has(s)), []);

    const robots = read('robots.txt');
    check('seo: robots.txt allows crawling', /^Allow: \/$/m.test(robots), true);
    check('seo: robots.txt advertises the sitemap', robots.includes('Sitemap: https://ilham.dev/sitemap.xml'), true);

    const prose = qr.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    check('seo: a tool page has real prose to read', prose.split(' ').length > 400, true);
  }


  console.log('\n=== qr rendering ===');

  // The renderer is checked against a real decoder, not against itself. The SVG the
  // page produced is rasterised here by a second, independent implementation — one
  // that paints shapes in document order and samples module cell centres, the way a
  // scanner reads — and handed to jsQR. Reusing the renderer's own geometry would
  // make this test agree with whatever bug it had.
  {
    const jsQR = require('jsqr');
    const QRCode = (await import('file:///opt/ilham-dev/assets/js/vendor/qrcode.js')).default;

    const covers = (node, x, y) => {
      const tag = node.tagName.toLowerCase();
      if (tag === 'image') {
        const x0 = Number(node.getAttribute('x'));
        const y0 = Number(node.getAttribute('y'));
        return x >= x0 && x <= x0 + Number(node.getAttribute('width')) && y >= y0 && y <= y0 + Number(node.getAttribute('height'));
      }
      if (tag === 'circle') {
        const dist = Math.hypot(x - Number(node.getAttribute('cx')), y - Number(node.getAttribute('cy')));
        const r = Number(node.getAttribute('r'));
        if (node.getAttribute('stroke')) return Math.abs(dist - r) <= Number(node.getAttribute('stroke-width')) / 2;
        return dist <= r;
      }
      const x0 = Number(node.getAttribute('x'));
      const y0 = Number(node.getAttribute('y'));
      const w = Number(node.getAttribute('width'));
      const hh = Number(node.getAttribute('height'));
      if (node.getAttribute('fill') === 'none' && node.getAttribute('stroke')) {
        const sw = Number(node.getAttribute('stroke-width')) / 2;
        const inside = x >= x0 - sw && x <= x0 + w + sw && y >= y0 - sw && y <= y0 + hh + sw;
        const hole = x > x0 + sw && x < x0 + w - sw && y > y0 + sw && y < y0 + hh - sw;
        return inside && !hole;
      }
      return x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + hh;
    };

    // Paint in document order so a later shape overwrites an earlier one — that is
    // how the white box behind a logo erases modules. A cell centre is the sample
    // a scanner reads, so each module becomes one k-by-k block of pixels.
    const raster = (svg, count, margin) => {
      const size = Number(svg.getAttribute('width'));
      const scale = size / (count + 2 * margin);
      const layers = [];
      const walk = (node) => {
        for (const child of node.children) {
          const tag = child.tagName.toLowerCase();
          if (tag === 'defs') continue;
          if (tag === 'rect' && Number(child.getAttribute('width')) === size && Number(child.getAttribute('height')) === size) {
            layers.push({ node: child, colour: 255 });
            continue;
          }
          if (tag === 'image') layers.push({ node: child, colour: 128 });
          else if (tag === 'rect' || tag === 'circle') layers.push({ node: child, colour: child.parentNode === svg ? 255 : 0 });
          walk(child);
        }
      };
      walk(svg);

      const k = 6;
      const dim = count * k;
      const data = new Uint8ClampedArray(dim * dim * 4).fill(255);
      for (let row = 0; row < count; row += 1) {
        for (let col = 0; col < count; col += 1) {
          const x = (col + margin + 0.5) * scale;
          const y = (row + margin + 0.5) * scale;
          let value = 255;
          for (const layer of layers) if (covers(layer.node, x, y)) value = layer.colour;
          if (value === 255) continue;
          for (let py = row * k; py < row * k + k; py += 1)
            for (let px = col * k; px < col * k + k; px += 1) {
              const at = (py * dim + px) * 4;
              data[at] = data[at + 1] = data[at + 2] = value;
            }
        }
      }
      return { data, dim };
    };

    const decode = (svg, text, ecc, margin = 2) => {
      const count = QRCode.create(text, { errorCorrectionLevel: ecc }).modules.size;
      const { data, dim } = raster(svg, count, margin);
      const found = jsQR(data, dim, dim);
      return found ? found.data : null;
    };

    const editor = loadPage('qr-editor');
    const svgOf = () => editor.w.document.querySelector('#qre-preview svg');
    const style = async (fields) => {
      for (const [sel, value] of Object.entries(fields)) set(editor.w, sel, value);
      await sleep(60);
      return svgOf();
    };

    // Every combination of module shape and corner style, because a round corner
    // ring is the one that silently produces a code nothing can read.
    const combinations = [];
    for (const shape of ['square', 'rounded', 'dot'])
      for (const finder of ['square', 'rounded', 'dot']) {
        const svg = await style({ '#qre-shape': shape, '#qre-finder': finder, '#qre-ecc': 'H' });
        if (decode(svg, 'https://ilham.dev', 'H') !== 'https://ilham.dev') combinations.push(`${shape}+${finder}`);
      }
    check('qr: every shape and corner style still decodes', combinations, []);

    const gradient = await style({ '#qre-gradient': true, '#qre-transparent': false });
    check('qr: a gradient still decodes', decode(gradient, 'https://ilham.dev', 'H'), 'https://ilham.dev');

    const clear = await style({ '#qre-gradient': false, '#qre-transparent': true });
    check('qr: a transparent background still decodes', decode(clear, 'https://ilham.dev', 'H'), 'https://ilham.dev');
    check('qr: a transparent background draws no backing rectangle',
      clear.querySelectorAll(':scope > rect').length, 0);

    // A logo at the measured limit for each level. The white box behind it is drawn
    // by the page only when a logo is set, so the test places both the way the
    // renderer would and then asks a decoder whether the result is still readable.
    const LIMITS = [['L', 12], ['M', 16], ['Q', 18], ['H', 24]];
    const TEXTS = ['hi', 'https://ilham.dev', 'https://ilham.dev/tools/qr-editor/?a=1&b=2&c=three&d=four&e=five'];
    const failedLogos = [];
    for (const [ecc, ratio] of LIMITS) {
      for (const text of TEXTS) {
        const svg = await style({ '#qre-text': text, '#qre-ecc': ecc, '#qre-logo-size': String(ratio) });
        const size = Number(svg.getAttribute('width'));
        const side = size * (ratio / 100);
        const box = side * 1.24;
        const at = (size - box) / 2;
        const white = editor.w.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        for (const [name, value] of Object.entries({ x: at, y: at, width: box, height: box, fill: '#ffffff' })) white.setAttribute(name, value);
        const img = editor.w.document.createElementNS('http://www.w3.org/2000/svg', 'image');
        for (const [name, value] of Object.entries({ x: (size - side) / 2, y: (size - side) / 2, width: side, height: side })) img.setAttribute(name, value);
        svg.append(white, img);
        if (decode(svg, text, ecc) !== text) failedLogos.push(`${ecc} at ${ratio}%, ${text.length} chars`);
      }
    }
    check('qr: a logo at the measured limit for each level still decodes', failedLogos, []);

    const generator = await run('qr-code-generator', { '#qr-text': 'https://ilham.dev', '#qr-ecc': 'H' });
    const gsvg = generator.w.document.querySelector('#qr-preview svg');
    check('qr: the generator decodes too', decode(gsvg, 'https://ilham.dev', 'H'), 'https://ilham.dev');
    check('qr: the generator draws a quiet zone', Number(gsvg.getAttribute('width')) > 0, true);

    const wifi = await run('wifi-qr-generator', { '#wqr-type': 'WPA', '#wqr-ssid': 'ilham-dev', '#wqr-pass': 'secret' });
    const wsvg = wifi.w.document.querySelector('#wqr-preview svg');
    check('qr: the wifi tool builds the standard payload',
      decode(wsvg, 'WIFI:T:WPA;S:ilham-dev;P:secret;;', 'M'), 'WIFI:T:WPA;S:ilham-dev;P:secret;;');

    // Structure, so a silent change in what gets emitted is caught even when the
    // code still happens to decode.
    const styled = await style({ '#qre-text': 'https://ilham.dev', '#qre-shape': 'dot', '#qre-finder': 'dot' });
    check('qr: dot modules are circles', styled.querySelectorAll('g > circle').length > 0, true);
    check('qr: no corner ring is drawn as a circle',
      [...styled.querySelectorAll('g > circle')].filter((c) => c.getAttribute('fill') === 'none').length, 0);
    check('qr: the corner ring is a stroked rect',
      [...styled.querySelectorAll('g > rect')].filter((r) => r.getAttribute('fill') === 'none' && r.getAttribute('stroke')).length, 3);

    const meta = editor.w.document.querySelector('#qre-meta').textContent;
    check('qr: the meta line reports the version and the module grid', /^Version \d+ · \d+ × \d+ modules$/.test(meta), true);
  }

  console.log('\n=== jwt editor ===');
  {
    // Node's crypto is the oracle: a token this page signed has to verify somewhere
    // that has never seen this page.
    const { generateKeyPairSync, createHmac, createVerify, createPublicKey } = require('crypto');
    const b64 = (input) => Buffer.from(input).toString('base64url');

    const rsa = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const ec = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const editor = loadPage('jwt-editor');
    check('jwt editor: starts with a header and a payload to edit',
      editor.w.document.querySelector('#jwe-header').value.includes('"alg"'), true);

    const produced = async (alg, key) => {
      set(editor.w, '#jwe-alg', alg);
      set(editor.w, '#jwe-key', key);
      set(editor.w, '#jwe-header', JSON.stringify({ alg, typ: 'JWT' }));
      click(editor.w, '#jwe-sign');
      await sleep(80);
      return editor.w.document.querySelector('#jwe-output').value;
    };

    // HMAC: recompute the signature with Node's own HMAC.
    for (const alg of ['HS256', 'HS384', 'HS512']) {
      const token = await produced(alg, 'a-long-enough-secret-for-testing');
      const [head, body, sig] = token.split('.');
      const digest = { HS256: 'sha256', HS384: 'sha384', HS512: 'sha512' }[alg];
      check(`jwt editor: ${alg} matches Node's HMAC`, sig, createHmac(digest, 'a-long-enough-secret-for-testing').update(`${head}.${body}`).digest('base64url'));
      check(`jwt editor: ${alg} rewrites the header algorithm`, JSON.parse(Buffer.from(head, 'base64url')).alg, alg);
    }

    // RSA and PSS: verify with the matching public key.
    for (const [alg, options] of [['RS256', {}], ['PS256', { padding: require('crypto').constants.RSA_PKCS1_PSS_PADDING, saltLength: 32 }]]) {
      const token = await produced(alg, rsa.privateKey);
      const [head, body, sig] = token.split('.');
      const verifier = createVerify('sha256');
      verifier.update(`${head}.${body}`);
      verifier.end();
      check(`jwt editor: ${alg} verifies with Node's public key`,
        verifier.verify({ key: rsa.publicKey, ...options }, Buffer.from(sig, 'base64url')), true);
    }

    // ECDSA: Node wants P1363 (raw r||s) rather than the DER that openssl emits.
    {
      const token = await produced('ES256', ec.privateKey);
      const [head, body, sig] = token.split('.');
      const raw = Buffer.from(sig, 'base64url');
      check('jwt editor: ES256 signs a 64-byte raw signature, not DER', raw.length, 64);
      const verifier = createVerify('sha256');
      verifier.update(`${head}.${body}`);
      verifier.end();
      check('jwt editor: ES256 verifies with Node\'s public key',
        verifier.verify({ key: ec.publicKey, dsaEncoding: 'ieee-p1363' }, raw), true);
    }

    // alg none is written honestly and reported as what it is.
    {
      const token = await produced('none', '');
      check('jwt editor: alg none leaves an empty signature', token.split('.').length, 3);
      check('jwt editor: alg none writes an empty third part', token.endsWith('.'), true);
      check('jwt editor: alg none is flagged as a problem',
        editor.w.document.querySelector('#jwe-status').classList.contains('err'), true);
      check('jwt editor: alg none says so in the note',
        editor.w.document.querySelector('#jwe-note').textContent, 'unsigned');
    }

    // The algorithm select has to win over a stale header, on change as well as on
    // sign — otherwise "signed with HS256, labelled RS256" tokens get made.
    set(editor.w, '#jwe-header', JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    set(editor.w, '#jwe-alg', 'HS256');
    await sleep(50);
    check('jwt editor: changing the algorithm rewrites the header',
      JSON.parse(editor.w.document.querySelector('#jwe-header').value).alg, 'HS256');

    // Failures that must not silently produce a token.
    const failures = [
      ['#jwe-payload', 'not json', 'payload'],
      ['#jwe-payload', '[1,2,3]', 'object'],
      ['#jwe-header', '"a string"', 'object'],
    ];
    const missed = [];
    for (const [sel, value, word] of failures) {
      set(editor.w, '#jwe-alg', 'HS256');
      set(editor.w, '#jwe-key', 'a-long-enough-secret-for-testing');
      set(editor.w, sel, value);
      click(editor.w, '#jwe-sign');
      await sleep(60);
      if (!editor.w.document.querySelector('#jwe-status').textContent.toLowerCase().includes(word)) missed.push(`${sel} = ${value}`);
      if (editor.w.document.querySelector('#jwe-output').value !== '') missed.push(`${sel} = ${value} still wrote a token`);
    }
    check('jwt editor: refuses to sign a header or payload that is not an object', missed, []);

    // A SEC1 EC key cannot be read by WebCrypto, so it has to be refused with a way out.
    set(editor.w, '#jwe-payload', '{"sub":"user_42"}');
    set(editor.w, '#jwe-header', '{"alg":"ES256"}');
    set(editor.w, '#jwe-alg', 'ES256');
    set(editor.w, '#jwe-key', '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIB1n\n-----END EC PRIVATE KEY-----');
    click(editor.w, '#jwe-sign');
    await sleep(80);
    check('jwt editor: a SEC1 EC key is refused with the conversion command',
      editor.w.document.querySelector('#jwe-status').textContent.includes('openssl pkcs8'), true);

    // The secret-is-base64 switch has to change the bytes that get signed.
    set(editor.w, '#jwe-header', '{"alg":"HS256"}');
    set(editor.w, '#jwe-payload', '{"sub":"user_42"}');
    set(editor.w, '#jwe-key', b64('binary-secret'));
    set(editor.w, '#jwe-alg', 'HS256');
    set(editor.w, '#jwe-secret-b64', true);
    click(editor.w, '#jwe-sign');
    await sleep(80);
    {
      const [head, body, sig] = editor.w.document.querySelector('#jwe-output').value.split('.');
      check('jwt editor: a base64 secret is decoded before it is used',
        sig, createHmac('sha256', Buffer.from('binary-secret')).update(`${head}.${body}`).digest('base64url'));
    }
  }

  /* ---------------------------------------------------------------- ssh keys */

  console.log('\n=== ssh key generator ===');
  {
    // ssh-keygen is the oracle, and it is the program these files exist for. It is
    // strict about the container: a wrong length prefix, a missing pad byte, or a
    // wrong RSA CRT coefficient all make it refuse the key or fail to sign with it.
    // Nothing here is checked against this page's own code.
    const cp = require('child_process');
    const os = require('os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ilham-ssh-'));
    const sh = (cmd) => cp.execSync(cmd, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    const attempt = (cmd) => {
      try {
        return { out: sh(cmd), failed: false };
      } catch (error) {
        return { out: `${error.stdout || ''}${error.stderr || ''}`, failed: true };
      }
    };
    const haveSshKeygen = !attempt('command -v ssh-keygen').failed;

    if (!haveSshKeygen) {
      // Not a pass and not a failure: this assertion genuinely did not run, and
      // printing nothing would make the suite look stronger than it is.
      console.log('SKIP  ssh: ssh-keygen is not installed, so no key can be verified against it');
    } else {
      // Every code path: ed25519 keeps its secret as a plain string, ECDSA as a
      // curve point plus an mpint, RSA as six mpints. P-521 and 4096 are included
      // because they are the sizes where an off-by-one in a length prefix shows up.
      const types = [
        ['ed25519', 'ssh-ed25519'],
        ['ecdsa-p256', 'ecdsa-sha2-nistp256'],
        ['ecdsa-p521', 'ecdsa-sha2-nistp521'],
        ['rsa-2048', 'ssh-rsa'],
        ['rsa-4096', 'ssh-rsa'],
      ];

      for (const [type, sshName] of types) {
        const page = loadPage('ssh-key-generator');
        set(page.w, '#ssh-type', type);
        set(page.w, '#ssh-comment', 'probe@test');
        click(page.w, '#ssh-generate');
        for (let i = 0; i < 60 && !/ready/.test(read(page.w, '#ssh-status')); i += 1) await sleep(250);
        check(`ssh ${type}: the page finished generating`, /ready/.test(read(page.w, '#ssh-status')), true);

        const pub = read(page.w, '#ssh-public').trim();
        const priv = read(page.w, '#ssh-private');
        const pkcs8 = read(page.w, '#ssh-pkcs8');
        check(`ssh ${type}: the public line names the algorithm ssh-keygen knows`, pub.split(' ')[0], sshName);
        check(`ssh ${type}: the comment is carried into the public line`, pub.split(' ')[2], 'probe@test');
        check(`ssh ${type}: the private key is in OpenSSH's own container, not PKCS#8`,
          priv.split('\n')[0], '-----BEGIN OPENSSH PRIVATE KEY-----');
        check(`ssh ${type}: the PKCS#8 copy is a separate field, not the same text`,
          pkcs8.split('\n')[0], '-----BEGIN PRIVATE KEY-----');
        const body = priv.split('\n').slice(1, -2);
        check(`ssh ${type}: the OpenSSH body is wrapped at 70 columns, the way ssh-keygen writes it`,
          body.slice(0, -1).every((line) => line.length === 70), true);
        check(`ssh ${type}: no line of the container is over 70 columns`, body.every((line) => line.length <= 70), true);

        // A directory per type: ssh-keygen will not overwrite an existing signature,
        // so a leftover msg.txt.sig would be verified against the next key and the
        // check would fail for a reason that has nothing to do with the key.
        const here = path.join(dir, type);
        fs.mkdirSync(here);
        const base = path.join(here, 'key');
        fs.writeFileSync(`${base}.pub`, `${pub}\n`, { mode: 0o644 });
        // 0600, because ssh-keygen refuses to read a private key anyone else can open.
        fs.writeFileSync(base, priv, { mode: 0o600 });
        fs.writeFileSync(`${base}.pkcs8`, pkcs8, { mode: 0o600 });

        check(`ssh ${type}: ssh-keygen reads the private key and derives the same public key`,
          attempt(`ssh-keygen -y -f ${base}`).out.trim(), pub);
        check(`ssh ${type}: the page's SHA256 fingerprint is the one ssh-keygen prints`,
          attempt(`ssh-keygen -lf ${base}.pub`).out.split(/\s+/)[1], read(page.w, '#ssh-fingerprint'));
        check(`ssh ${type}: the page's MD5 fingerprint is the one ssh-keygen prints`,
          attempt(`ssh-keygen -E md5 -lf ${base}.pub`).out.split(/\s+/)[1], read(page.w, '#ssh-md5'));

        // A real signature round trip. Loading the key only exercises the parser;
        // signing with it exercises the private half, including RSA's CRT
        // coefficient — which is the field a key can load with and still fail to use.
        const message = path.join(here, 'msg.txt');
        fs.writeFileSync(message, 'a message the key signs\n');
        fs.writeFileSync(path.join(here, 'allowed'), `probe@test ${pub}\n`);
        check(`ssh ${type}: ssh-keygen signs with the key`,
          attempt(`ssh-keygen -Y sign -f ${base} -n file ${message}`).failed, false);
        check(`ssh ${type}: the signature verifies against the public key the page printed`,
          attempt(`ssh-keygen -Y verify -f ${path.join(here, 'allowed')} -I probe@test -n file -s ${message}.sig < ${message}`).out.includes('Good "file" signature'), true);

        check(`ssh ${type}: openssl agrees the PKCS#8 copy is a valid key`,
          /Key is valid/.test(attempt(`openssl pkey -in ${base}.pkcs8 -check -noout 2>&1`).out), true);

        // The page makes a specific claim about what OpenSSH will and will not read.
        // A claim in the interface is a thing to check, not a thing to trust.
        const pkcs8Read = !attempt(`ssh-keygen -y -f ${base}.pkcs8`).failed;
        if (type === 'ed25519') {
          check('ssh ed25519: OpenSSH really does refuse the PKCS#8 copy, which is what the page says',
            pkcs8Read, false);
        }
        if (type === 'rsa-2048') {
          check('ssh rsa: OpenSSH really does read the PKCS#8 copy, which is what the page says',
            attempt(`ssh-keygen -y -f ${base}.pkcs8`).out.trim().split(' ').slice(0, 2).join(' '), pub.split(' ').slice(0, 2).join(' '));
        }
      }
    }
  }

  /* ------------------------------------------------------------ file hashes */

  console.log('\n=== file hashes ===');
  {
    const crypto = require('crypto');
    // Bytes that are not valid UTF-8 and contain a NUL, so a tool that hashes text
    // instead of bytes cannot pass by accident.
    const bytes = new Uint8Array([0, 1, 2, 250, 255, 128, 65, 10, 13, 0, 66]);
    const oracle = (algorithm) => crypto.createHash(algorithm).update(Buffer.from(bytes)).digest('hex');
    const digests = (page) => [...page.w.document.querySelectorAll('#fhc-results textarea')].map((el) => el.value);

    const page = loadPage('file-hash-checker');
    const file = new page.w.File([bytes], 'sample.bin', { type: 'application/octet-stream' });
    const input = page.w.document.querySelector('#fhc-file');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new page.w.Event('change', { bubbles: true }));
    await sleep(700);

    check('hashes: the three algorithms asked for are on by default',
      ['#fhc-md5', '#fhc-sha1', '#fhc-sha256', '#fhc-sha512'].map((id) => page.w.document.querySelector(id).checked),
      [true, true, true, false]);
    check('hashes: MD5 matches node', digests(page)[0], oracle('md5'));
    check('hashes: SHA-1 matches node', digests(page)[1], oracle('sha1'));
    check('hashes: SHA-256 matches node', digests(page)[2], oracle('sha256'));
    check('hashes: the file is named and sized in the summary', read(page.w, '#fhc-name'), 'sample.bin · 11 bytes');

    // The expected-hash field has to find a digest inside whatever a publisher
    // printed, and it must not care about case.
    set(page.w, '#fhc-expected', `SHA256 (sample.bin) = ${oracle('sha256').toUpperCase()}`);
    await sleep(300);
    check('hashes: a sha256sum line is understood', read(page.w, '#fhc-verdict'), "Match. The file's SHA-256 is the one you pasted.");
    check('hashes: a match is marked as a match', page.w.document.querySelector('#fhc-verdict').classList.contains('ok'), true);

    // A digest for an algorithm that is switched off cannot be compared, and saying
    // "no match" would be a false accusation against the file. The tool says which
    // of the two it is and tells you how to fix it.
    set(page.w, '#fhc-expected', oracle('sha512'));
    await sleep(300);
    check('hashes: a digest nobody computed is reported as not comparable, not as a mismatch',
      read(page.w, '#fhc-verdict'),
      'No match — but the hash you pasted is a different length from every one computed here, so the two are not comparable. Tick the matching algorithm above.');

    set(page.w, '#fhc-expected', 'deadbeef');
    await sleep(300);
    check('hashes: something that is not a digest is refused rather than reported as a mismatch',
      read(page.w, '#fhc-verdict'), 'That does not look like a hash — a digest is a run of 32 or more hex characters.');
    check('hashes: ...and is not marked as a match', page.w.document.querySelector('#fhc-verdict').classList.contains('ok'), false);

    set(page.w, '#fhc-expected', '0'.repeat(32));
    await sleep(300);
    check('hashes: a real digest of the right length that does not match is called a mismatch',
      read(page.w, '#fhc-verdict'),
      "No match. MD5 came out different, so this file is not the one that hash was published for.");
    check('hashes: a mismatch is marked as a problem',
      page.w.document.querySelector('#fhc-verdict').classList.contains('err'), true);

    // A digest buried in a publisher's line is still found, and being surrounded by
    // words does not turn a match into a mismatch.
    set(page.w, '#fhc-expected', `SHA256 (sample.bin) = ${oracle('sha256')}`);
    await sleep(300);
    check('hashes: the digest is found inside the line, and the words around it are ignored',
      read(page.w, '#fhc-verdict'), "Match. The file's SHA-256 is the one you pasted.");

    set(page.w, '#fhc-sha512', true);
    set(page.w, '#fhc-upper', true);
    await sleep(700);
    check('hashes: switching on SHA-512 adds a row without re-reading the file', digests(page).length, 4);
    check('hashes: SHA-512 matches node', digests(page)[3].toLowerCase(), oracle('sha512'));
    check('hashes: uppercase really is uppercase', digests(page)[3], oracle('sha512').toUpperCase());
  }

  /* -------------------------------------------------------- image metadata */

  console.log('\n=== image metadata ===');
  {
    // A hand-built EXIF block, because the parser's job is to follow offsets and
    // the inline-versus-out-of-line rule — and a fixture that avoids those rules
    // would pass while the real thing failed. Big-endian on purpose: the little-
    // endian path is the one everybody writes, so it is the one that gets tested.
    const T = { BYTE: 1, ASCII: 2, SHORT: 3, LONG: 4, RATIONAL: 5 };
    const UNIT = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 };
    const join = (...parts) => {
      const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
      let at = 0;
      for (const part of parts) {
        out.set(part, at);
        at += part.length;
      }
      return out;
    };
    const raw = (type, values) => {
      if (type === T.ASCII) return join(new TextEncoder().encode(values.join('')), new Uint8Array([0]));
      const out = new Uint8Array(values.length * UNIT[type]);
      const view = new DataView(out.buffer);
      values.forEach((value, i) => {
        if (type === T.SHORT) view.setUint16(i * 2, value);
        else if (type === T.LONG) view.setUint32(i * 4, value);
        else if (type === T.RATIONAL) {
          view.setUint32(i * 8, value[0]);
          view.setUint32(i * 8 + 4, value[1]);
        } else out[i] = value;
      });
      return out;
    };
    const buildTiff = (ifds) => {
      const size = (ifd) => 2 + ifd.entries.length * 12 + 4;
      const tail = (ifd) => ifd.entries.reduce((sum, e) => sum + (raw(e.type, e.values).length > 4 ? raw(e.type, e.values).length : 0), 0);
      let at = 8;
      for (const ifd of ifds) {
        ifd.start = at;
        at += size(ifd) + tail(ifd);
      }
      for (const ifd of ifds) for (const e of ifd.entries) if (e.ref) e.values[0] = e.ref.start;
      const out = new Uint8Array(at);
      const view = new DataView(out.buffer);
      out[0] = 0x4d;
      out[1] = 0x4d;
      view.setUint16(2, 0x2a);
      view.setUint32(4, ifds[0].start);
      for (const ifd of ifds) {
        view.setUint16(ifd.start, ifd.entries.length);
        let valueAt = ifd.start + size(ifd);
        ifd.entries.forEach((e, i) => {
          const bytes = raw(e.type, e.values);
          const o = ifd.start + 2 + i * 12;
          view.setUint16(o, e.tag);
          view.setUint16(o + 2, e.type);
          view.setUint32(o + 4, e.type === T.ASCII ? bytes.length : e.values.length);
          if (bytes.length <= 4) out.set(bytes, o + 8);
          else {
            view.setUint32(o + 8, valueAt);
            out.set(bytes, valueAt);
            valueAt += bytes.length;
          }
        });
      }
      return out;
    };

    const exif = { entries: [] };
    const gps = { entries: [] };
    const ifd0 = {
      entries: [
        { tag: 0x010f, type: T.ASCII, values: ['Example Camera Co'] },
        { tag: 0x0110, type: T.ASCII, values: ['Model X'] },
        { tag: 0x0112, type: T.SHORT, values: [6] },
        { tag: 0x011a, type: T.RATIONAL, values: [[72, 1]] },
        { tag: 0x8769, type: T.LONG, values: [0], ref: exif },
        { tag: 0x8825, type: T.LONG, values: [0], ref: gps },
      ],
    };
    exif.entries = [
      { tag: 0x829a, type: T.RATIONAL, values: [[1, 250]] },
      { tag: 0x829d, type: T.RATIONAL, values: [[28, 10]] },
      { tag: 0x9003, type: T.ASCII, values: ['2024:05:06 07:08:09'] },
      { tag: 0x920a, type: T.RATIONAL, values: [[35, 1]] },
      { tag: 0x9286, type: T.BYTE, values: [0x41, 0x53, 0x43, 0x49, 0x49, 0, 0, 0, ...new TextEncoder().encode('a private note')] },
    ];
    gps.entries = [
      { tag: 0x0001, type: T.ASCII, values: ['S'] },
      { tag: 0x0002, type: T.RATIONAL, values: [[51, 1], [30, 1], [0, 1]] },
      { tag: 0x0003, type: T.ASCII, values: ['E'] },
      { tag: 0x0004, type: T.RATIONAL, values: [[0, 1], [7, 1], [3000, 100]] },
    ];
    const tiff = buildTiff([ifd0, exif, gps]);
    const app1 = join(
      new Uint8Array([0xff, 0xe1]),
      new Uint8Array([((tiff.length + 8) >> 8) & 255, (tiff.length + 8) & 255]),
      new TextEncoder().encode('Exif\0\0'),
      tiff,
    );
    const jpeg = join(new Uint8Array([0xff, 0xd8]), app1, new Uint8Array([0xff, 0xda]));

    const page = loadPage('image-metadata');
    const load = async (data, name, type) => {
      const file = new page.w.File([data], name, { type });
      const field = page.w.document.querySelector('#img-file');
      Object.defineProperty(field, 'files', { value: [file], configurable: true });
      field.dispatchEvent(new page.w.Event('change', { bubbles: true }));
      await sleep(400);
    };

    await load(jpeg, 'photo.jpg', 'image/jpeg');
    const report = read(page.w, '#img-results');
    const dump = JSON.parse(read(page.w, '#img-json'));
    check('image: the block count is reported', read(page.w, '#img-summary'), 'JPEG · 3 blocks of metadata');
    check('image: the camera make is read from the IFD0 ASCII tag', dump.Image['Camera make'], 'Example Camera Co');
    check('image: a SHORT that fits in four bytes is read from the entry itself', dump.Image.Orientation, 'Rotated 90° clockwise');
    check('image: a RATIONAL that does not fit is read from the offset it points at', dump['Exposure and camera']['Exposure time'], '1/250 s');
    check('image: the user comment is decoded past its 8-byte encoding header', dump['Exposure and camera']['User comment'], 'a private note');
    check('image: the GPS sub-IFD is followed', dump.Location.Latitude, '51° 30′ 0″');

    // The coordinates are spread over six tags across two IFDs, and the sign lives
    // in a separate ref tag. This is where a NaN used to reach the map link.
    const warning = page.w.document.querySelector('.img-warning');
    check('image: a photo with a location says so', Boolean(warning), true);
    const link = warning.querySelector('a');
    check('image: the south and east refs decide the signs', link.textContent, '-51.50000, 0.12500');
    check('image: the map link carries numbers, not NaN',
      link.getAttribute('href'), 'https://www.openstreetmap.org/?mlat=-51.5&mlon=0.125#map=15/-51.5/0.125');

    // A PNG has no EXIF, so this is the other reader and the other block layout.
    const chunk = (type, body) => join(new Uint8Array([(body.length >>> 24) & 255, (body.length >>> 16) & 255, (body.length >>> 8) & 255, body.length & 255]), new TextEncoder().encode(type), body, new Uint8Array([0, 0, 0, 0]));
    const be32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
    const png = join(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', join(be32(800), be32(600), new Uint8Array([8, 2, 0, 0, 0]))),
      chunk('pHYs', join(be32(2835), be32(2835), new Uint8Array([1]))),
      chunk('tEXt', new TextEncoder().encode('Title\0A test picture')),
      chunk('IEND', new Uint8Array(0)),
    );
    await load(png, 'shot.png', 'image/png');
    const pngDump = JSON.parse(read(page.w, '#img-json'));
    check('image: a PNG header is read', [pngDump['PNG image'].Width, pngDump['PNG image'].Height], ['800 px', '600 px']);
    check('image: the pixel density is converted from pixels per metre', pngDump['PNG image']['Pixel size'], '72 × 72 dots per inch');
    check('image: a tEXt chunk is split into its keyword and value', pngDump['Text chunks'].Title, 'A test picture');
    check('image: a file with no location shows no location warning', page.w.document.querySelectorAll('.img-warning').length, 0);

    await load(new Uint8Array([1, 2, 3, 4]), 'notes.txt', 'text/plain');
    check('image: a file that is not an image is refused by name',
      read(page.w, '#img-status'), 'This does not look like a JPEG, PNG, GIF or WebP. Those are the four this page can read.');
    check('image: ...and nothing from the previous file is left on screen', read(page.w, '#img-results'), '');
  }

  /* --------------------------------------------------------- websocket tester */

  console.log('\n=== websocket tester ===');
  {
    const page = loadPage('websocket-tester');
    set(page.w, '#ws-url', 'api.example.com/socket');
    click(page.w, '#ws-connect');
    await sleep(60);
    const socket = page.sockets()[0];
    check('websocket: a bare host is given a scheme and the guess is stated',
      read(page.w, '#ws-status'), 'Opening wss://api.example.com/socket… (no scheme given, so wss:// was assumed)');
    check('websocket: ...and the guess stays in the log after the status line moves on',
      read(page.w, '#ws-log').includes('no scheme given, so wss:// was assumed'), true);
    check('websocket: the page opened the address the user typed', socket.url, 'wss://api.example.com/socket');
    check('websocket: send is disabled while the socket is still connecting', page.w.document.querySelector('#ws-send').disabled, true);

    socket.serverOpen('chat');
    await sleep(40);
    check('websocket: opening enables send', page.w.document.querySelector('#ws-send').disabled, false);
    check('websocket: the open line reports the negotiated subprotocol', read(page.w, '#ws-log').includes('protocol: chat'), true);
    check('websocket: the state is shown as a word, not just a colour', page.w.document.querySelector('#ws-note').dataset.state, 'Open');

    set(page.w, '#ws-message', '{"hello":"world"}');
    click(page.w, '#ws-send');
    check('websocket: what was typed is what was sent, byte for byte', socket.sent, ['{"hello":"world"}']);
    check('websocket: the input is cleared after sending', read(page.w, '#ws-message'), '');

    socket.serverMessage('{"a":1,"b":[2,3]}');
    await sleep(40);
    check('websocket: JSON from the server is indented so it can be read', read(page.w, '#ws-log').includes('"a": 1'), true);
    socket.serverMessage('not json at all');
    await sleep(40);
    check('websocket: something that is not JSON is shown as it arrived', read(page.w, '#ws-log').includes('not json at all'), true);

    set(page.w, '#ws-binary', true);
    set(page.w, '#ws-message', '48 69');
    click(page.w, '#ws-send');
    const binary = socket.sent[1];
    check('websocket: hex is turned into real bytes', [binary instanceof Uint8Array, [...(binary || [])]], [true, [0x48, 0x69]]);
    set(page.w, '#ws-message', 'zz');
    click(page.w, '#ws-send');
    check('websocket: bad hex is refused rather than sending something else', socket.sent.length, 2);
    check('websocket: ...and the reason names the format', read(page.w, '#ws-status').includes('pairs of hex digits'), true);
    set(page.w, '#ws-binary', false);

    socket.serverClose(1006, '');
    await sleep(40);
    check('websocket: an unclean close is explained instead of just numbered',
      read(page.w, '#ws-log').includes('1006 means the connection was closed without a close frame'), true);
    check('websocket: the status carries the close code', read(page.w, '#ws-status'), 'Closed with code 1006.');
    check('websocket: the buttons go back to their resting state',
      [page.w.document.querySelector('#ws-send').disabled, page.w.document.querySelector('#ws-connect').disabled], [true, false]);

    click(page.w, '#ws-clear');
    check('websocket: clear empties the log', read(page.w, '#ws-log'), '');

    // The rule that surprises people: this is the browser, not a bug in the page.
    const mixed = loadPage('websocket-tester');
    set(mixed.w, '#ws-url', 'ws://plain.example.com/socket');
    click(mixed.w, '#ws-connect');
    await sleep(60);
    check('websocket: a plain ws:// socket on an https page is never opened', mixed.sockets().length, 0);
    check('websocket: ...and the reason is named as a browser rule',
      read(mixed.w, '#ws-status'), 'Blocked by the browser: this page is https and the socket is ws.');

    const local = loadPage('websocket-tester');
    set(local.w, '#ws-url', 'ws://localhost:8080/socket');
    click(local.w, '#ws-connect');
    await sleep(60);
    check('websocket: localhost is still allowed to be plain, which is how people test', local.sockets().length, 1);

    const protos = loadPage('websocket-tester');
    set(protos.w, '#ws-url', 'wss://chat.example.com/');
    set(protos.w, '#ws-protocol', 'chat, superchat');
    click(protos.w, '#ws-connect');
    await sleep(60);
    check('websocket: a subprotocol list is split on commas', protos.sockets()[0].protocols, ['chat', 'superchat']);

    const bad = loadPage('websocket-tester');
    set(bad.w, '#ws-url', 'ftp://files.example.com');
    click(bad.w, '#ws-connect');
    await sleep(60);
    check('websocket: an address that is not a socket is handed to the browser rather than guessed at',
      bad.sockets()[0].url, 'ftp://files.example.com');

    const empty = loadPage('websocket-tester');
    click(empty.w, '#ws-connect');
    await sleep(40);
    check('websocket: an empty address is refused before anything is opened', empty.sockets().length, 0);
    check('websocket: ...with a message that says what to type', read(empty.w, '#ws-status'), 'Enter a ws:// or wss:// address first.');
  }

  /* ------------------------------------------------------------ nginx config */

  console.log('\n=== nginx config ===');
  {
    // nginx is not installed here, so this is a structural check rather than a real
    // `nginx -t`: every server_name has to be a bare name, every brace has to close,
    // and the two halves of a redirect have to agree. A config that would not load
    // is caught by the generator itself and written into the output as a comment.
    const NAME = /^(\*\.)?[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*$/;
    const names = (out) => [...out.matchAll(/^\s*server_name (.+);$/gm)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean);

    const page = loadPage('nginx-config-generator');
    set(page.w, '#ngx-names', 'example.com, www.example.com');
    set(page.w, '#ngx-mode', 'proxy');
    set(page.w, '#ngx-proxy', 'http://127.0.0.1:3000');
    set(page.w, '#ngx-www', 'to-apex');
    set(page.w, '#ngx-tls', true);
    set(page.w, '#ngx-cache', true);
    await sleep(300);
    const out = read(page.w, '#ngx-out');

    check('nginx: a comma-separated name list does not leave a comma in server_name',
      names(out).filter((name) => !NAME.test(name)), []);
    check('nginx: the www host gets its own server that redirects to the apex',
      out.includes('server_name www.example.com;') && out.includes('return 301 $scheme://example.com$request_uri;'), true);
    check('nginx: the apex server does not also claim the www host',
      out.includes('server_name example.com;') && !out.includes('server_name example.com www.example.com;'), true);
    check('nginx: braces balance', (out.match(/\{/g) || []).length, (out.match(/\}/g) || []).length);
    check('nginx: nothing is left at column 0 inside a block',
      out.split('\n').filter((line) => /^\s*(location|proxy_pass|add_header|ssl_)/.test(line) && !/^\s{4}/.test(line)), []);
    check('nginx: a plain http upstream gets a named upstream block with keepalive',
      out.includes('upstream example-com-app {') && out.includes('keepalive 32;') && out.includes('proxy_pass http://example-com-app;'), true);
    check('nginx: the upgrade map is written exactly once',
      (out.match(/map \$http_upgrade \$connection_upgrade/g) || []).length, 1);
    check('nginx: the security headers are repeated inside the asset-cache block, because nginx will not inherit them',
      (out.match(/X-Content-Type-Options/g) || []).length, 2);
    check('nginx: the certificate paths are used for the apex, not the www host',
      out.includes('/etc/letsencrypt/live/example.com/fullchain.pem'), true);
    check('nginx: the ACME challenge is answered on port 80 before the redirect',
      out.includes('location /.well-known/acme-challenge/ { root /var/www/html; }'), true);
    check('nginx: the notes say which nginx version http2 on needs',
      read(page.w, '#ngx-notes').includes('1.25.1'), true);
    check('nginx: the notes say why the headers are duplicated',
      read(page.w, '#ngx-notes').includes('does not merge add_header'), true);

    set(page.w, '#ngx-hsts', false);
    await sleep(200);
    check('nginx: HSTS is left out when it is switched off', read(page.w, '#ngx-out').includes('Strict-Transport-Security'), false);
    set(page.w, '#ngx-hsts', true);

    // An https target cannot keep a connection pool, so it must not be given one.
    const remote = loadPage('nginx-config-generator');
    set(remote.w, '#ngx-mode', 'proxy');
    set(remote.w, '#ngx-proxy', 'https://backend.example.com');
    set(remote.w, '#ngx-www', 'off');
    await sleep(200);
    const rout = read(remote.w, '#ngx-out');
    check('nginx: an https upstream gets no upstream block, because keepalive cannot work over it',
      [rout.includes('upstream '), rout.includes('proxy_pass https://backend.example.com;')], [false, true]);

    const bad = loadPage('nginx-config-generator');
    set(bad.w, '#ngx-names', 'not a name!');
    await sleep(200);
    check('nginx: a name that is not a host is reported',
      errorStatuses(bad.w).some((text) => text.toLowerCase().includes('not a valid server name')), true);
    check('nginx: ...and the warning is written into the file, not only into the status line',
      read(bad.w, '#ngx-out').includes('# !!'), true);
    check('nginx: the bad name never reaches a server_name line',
      read(bad.w, '#ngx-out').includes('server_name name!;'), false);

    const spa = loadPage('nginx-config-generator');
    set(spa.w, '#ngx-mode', 'spa');
    set(spa.w, '#ngx-root', '/var/www/site/dist');
    await sleep(200);
    const sout = read(spa.w, '#ngx-out');
    check('nginx: a single-page app falls back to its shell instead of 404ing',
      sout.includes('try_files $uri $uri/ /index.html;'), true);
    check('nginx: an app mode gets no upstream block', sout.includes('upstream '), false);
  }

  /* --------------------------------------------------- remembering what was typed */

  console.log('\n=== remembering what was typed ===');
  {
    const CONSENT = 'ilham:memory-consent';
    const MEM = 'ilham:memory:json-formatter';
    const store = (slug) => `ilham:memory:${slug}`;
    const load = (slug, seed) => loadFile(path.join(TOOLS, slug, 'index.html'), `https://ilham.dev/tools/${slug}/`, { store: seed });

    // 1. Nothing at all is written before the question is answered.
    const first = load('json-formatter');
    check('memory: the question is asked on a first visit',
      [first.w.document.querySelector('#tool-memory-ask').hidden, first.w.document.querySelector('#tool-memory-on').hidden],
      [false, true]);
    set(first.w, '#jf-input', '{"typed":"before consent"}');
    await sleep(600);
    check('memory: typing writes nothing before the question is answered', first.w.localStorage.getItem(MEM), null);

    // 2. Yes stores the fields, and says where they are.
    click(first.w, '#tool-memory-yes');
    await sleep(60);
    check('memory: yes records the answer itself', first.w.localStorage.getItem(CONSENT), 'yes');
    check("memory: yes stores the tool's own fields",
      JSON.parse(first.w.localStorage.getItem(MEM))['jf-input'], '{"typed":"before consent"}');
    check('memory: the bar says where the data is kept',
      first.w.document.querySelector('#tool-memory-note').textContent, 'Saved. It will be here when you come back to this device.');

    // 3. A reload restores the fields and the tool redraws from them.
    const second = load('json-formatter', {
      [MEM]: first.w.localStorage.getItem(MEM),
      [CONSENT]: 'yes',
    });
    check('memory: a reload puts the text back', read(second.w, '#jf-input'), '{"typed":"before consent"}');
    check('memory: ...and the tool re-rendered from what was restored, rather than leaving stale output',
      read(second.w, '#jf-output'), '{\n  "typed": "before consent"\n}');
    check('memory: the bar says how many fields came back',
      second.w.document.querySelector('#tool-memory-note').textContent,
      'Restored 2 saved fields from this device.');

    // 4. No writes nothing, ever.
    const third = load('json-formatter');
    set(third.w, '#jf-input', '{"nope":1}');
    click(third.w, '#tool-memory-no');
    await sleep(600);
    check('memory: no stores nothing, even after typing', third.w.localStorage.getItem(MEM), null);
    check('memory: no is remembered as an answer', third.w.localStorage.getItem(CONSENT), 'no');
    check('memory: the off state offers a way back on', third.w.document.querySelector('#tool-memory-off').hidden, false);

    // 5. A tool page can hold a password, so a password field is never written down.
    const aes = load('aes-encryption', { [CONSENT]: 'yes' });
    set(aes.w, '#aes-pass', 'hunter2');
    set(aes.w, '#aes-input', 'a secret message');
    await sleep(600);
    const aesSaved = JSON.parse(aes.w.localStorage.getItem(store('aes-encryption')) || '{}');
    check('memory: a password field is never written to storage', 'aes-pass' in aesSaved, false);
    check('memory: an ordinary field beside it still is', aesSaved['aes-input'], 'a secret message');

    // 6. A private key is the worst thing to leave lying around, so it is marked.
    const ssh = load('ssh-key-generator', { [CONSENT]: 'yes' });
    set(ssh.w, '#ssh-comment', 'me@laptop');
    await sleep(600);
    const sshSaved = JSON.parse(ssh.w.localStorage.getItem(store('ssh-key-generator')) || '{}');
    check('memory: the comment is saved', sshSaved['ssh-comment'], 'me@laptop');
    check('memory: a field marked data-no-memory is not, even though it is not a password',
      '#ssh-private' in sshSaved, false);

    // 7. The regression that made a select hold the literal string "undefined".
    const list = load('list-converter', { [CONSENT]: 'yes' });
    set(list.w, '#list-format', 'sql');
    set(list.w, '#list-input', 'a\nb');
    await sleep(600);
    click(list.w, '#tool-memory-forget');
    await sleep(100);
    check("memory: forget clears this tool's store", list.w.localStorage.getItem(store('list-converter')), null);
    check('memory: forget puts a select back on a real option, not on "undefined"',
      list.w.document.querySelector('#list-format').value, 'json');
    check('memory: ...and the tool still works afterwards', read(list.w, '#list-output'), '[]');
    check('memory: ...with no error from a lookup that no longer exists', errorStatuses(list.w), []);

    // 8. Forget-everything is a different promise from forget-this-tool.
    const all = load('json-formatter', {
      [CONSENT]: 'yes',
      'ilham:memory:other-tool': '{"x":1}',
      'ilham:history:other-tool': '[{"at":1,"data":{"x":1}}]',
    });
    click(all.w, '#tool-memory-forget-all');
    await sleep(100);
    check('memory: forget-all removes every tool store, every history and the answer itself',
      [all.w.localStorage.getItem('ilham:memory:other-tool'),
        all.w.localStorage.getItem('ilham:history:other-tool'),
        all.w.localStorage.getItem(CONSENT)], [null, null, null]);
  }

  /* -------------------------------------------------------- previous entries */

  console.log('\n=== previous entries ===');
  {
    const CONSENT = 'ilham:memory-consent';
    const HIST = 'ilham:history:json-formatter';
    const load = (slug, seed) => loadFile(path.join(TOOLS, slug, 'index.html'), `https://ilham.dev/tools/${slug}/`, { store: seed });
    const entries = (page) => JSON.parse(page.w.localStorage.getItem(HIST) || '[]');
    const rows = (page) => [...page.w.document.querySelectorAll('.tool-history-item')];
    // The row buttons have no id of their own, so they are reached through the row.
    const press = (row, label) => [...row.querySelectorAll('button')].find((b) => b.textContent === label).click();

    // 1. No consent, no history — and nothing is even offered.
    const off = load('json-formatter');
    set(off.w, '#jf-input', '{"a":1}');
    await sleep(2400);
    check('history: nothing is recorded before the question is answered', off.w.localStorage.getItem(HIST), null);
    check('history: the panel stays hidden while there is nothing in it',
      off.w.document.querySelector('#tool-history').hidden, true);

    // 2. Consent on: an entry appears after a pause, and the panel opens itself.
    const page = load('json-formatter', { [CONSENT]: 'yes' });
    check('history: the panel stays hidden after consent while there is nothing in it',
      page.w.document.querySelector('#tool-history').hidden, true);
    set(page.w, '#jf-input', '{"first":true}');
    await sleep(2400);
    check('history: a pause records one entry', entries(page).length, 1);
    check('history: the entry holds what was typed', entries(page)[0].data['jf-input'], '{"first":true}');
    check('history: the panel is visible once there is something in it',
      page.w.document.querySelector('#tool-history').hidden, false);
    check('history: one row is rendered', rows(page).length, 1);
    check('history: the row is labelled with the value it would restore',
      read(page.w, '.tool-history-preview'), '{"first":true}');
    check('history: a setting is not part of the label', read(page.w, '.tool-history-preview').includes('2'), false);
    check('history: the row says when it was recorded', read(page.w, '.tool-history-when'), 'just now');

    // 3. The same thing twice is not two entries — otherwise a pause mid-edit
    //    would push a real entry off the end of the list.
    set(page.w, '#jf-input', '{"first":true} ');
    await sleep(2400);
    set(page.w, '#jf-input', '{"first":true}');
    await sleep(2400);
    check('history: recording the same value again does not add a row', entries(page).length, 1);

    // 4. A different value is a new entry, and the newest is first.
    set(page.w, '#jf-input', '{"second":true}');
    await sleep(2400);
    check('history: a different value is a new entry', entries(page).length, 2);
    check('history: the newest entry is first', entries(page)[0].data['jf-input'], '{"second":true}');
    check('history: ...and the first row is the one showing it',
      read(page.w, '.tool-history-preview'), '{"second":true}');

    // 5. Restore puts an older entry back, and the tool redraws from it.
    press(rows(page)[1], 'Restore');
    await sleep(150);
    check('history: restore puts the older value back in the field', read(page.w, '#jf-input'), '{"first":true}');
    check('history: ...and the tool redrew from it rather than keeping stale output',
      read(page.w, '#jf-output'), '{\n  "first": true\n}');
    check('history: ...and the bar says what happened',
      page.w.document.querySelector('#tool-memory-note').textContent,
      'Put 2 fields from that entry back into the form.');

    // 6. Remove drops one row without touching the other.
    press(rows(page)[1], 'Remove');
    await sleep(100);
    check('history: remove drops that entry', entries(page).length, 1);
    check('history: ...and the remaining entry is the other one', entries(page)[0].data['jf-input'], '{"second":true}');
    check('history: ...and the row went with it', rows(page).length, 1);

    // 7. Clearing the history is not the same promise as deleting the tool's data:
    //    the current entry stays, so a refresh still comes back to where you were.
    click(page.w, '#tool-history-clear');
    await sleep(100);
    check('history: clear history empties the list', entries(page).length, 0);
    check('history: ...and hides the panel again', page.w.document.querySelector('#tool-history').hidden, true);
    check('history: ...but leaves the current entry alone, which is a different promise',
      JSON.parse(page.w.localStorage.getItem('ilham:memory:json-formatter'))['jf-input'], '{"first":true}');

    // 8. Deleting this tool's saved data does take the history with it — the label
    //    says "saved data", so the history has to be part of that.
    const wiped = load('json-formatter', {
      [CONSENT]: 'yes',
      [HIST]: '[{"at":1,"data":{"jf-input":"old"}}]',
      'ilham:memory:json-formatter': '{"jf-input":"old"}',
    });
    click(wiped.w, '#tool-memory-forget');
    await sleep(100);
    check("history: deleting this tool's saved data takes the history too",
      [wiped.w.localStorage.getItem(HIST), wiped.w.localStorage.getItem('ilham:memory:json-formatter')], [null, null]);

    // 9. One pasted blob must not evict everything else. localStorage is about 5MB
    //    for the whole origin, so an entry over the cap is skipped rather than kept.
    const big = load('json-formatter', { [CONSENT]: 'yes' });
    set(big.w, '#jf-input', `{"big":"${'x'.repeat(9000)}"}`);
    await sleep(2400);
    check('history: an entry over the size cap is not recorded', big.w.localStorage.getItem(HIST), null);
    check('history: ...but the current entry is still saved, because losing it is the worse failure',
      JSON.parse(big.w.localStorage.getItem('ilham:memory:json-formatter'))['jf-input'].length > 9000, true);

    // 10. The list is capped, and the oldest entry is the one that goes.
    const many = load('json-formatter', { [CONSENT]: 'yes' });
    for (let i = 0; i < 14; i += 1) {
      set(many.w, '#jf-input', `{"n":${i}}`);
      await sleep(2100);
    }
    const kept = entries(many);
    check('history: the list is capped at twelve', kept.length, 12);
    check('history: ...and the newest is at the top', kept[0].data['jf-input'], '{"n":13}');
    check('history: ...and the oldest fell off', kept.some((entry) => entry.data['jf-input'] === '{"n":0}'), false);
    check('history: ...and the rows match the store', rows(many).length, 12);

    // 11. Junk under our key is ignored rather than rendered.
    const junk = load('json-formatter', { [CONSENT]: 'yes', [HIST]: '{"not":"an array"}' });
    check('history: a store that is not an array is ignored',
      junk.w.document.querySelector('#tool-history').hidden, true);
    check('history: ...and the page is still usable', errorStatuses(junk.w), []);
  }

  /* ------------------------------------------------------ http request tester */

  console.log('\n=== http request tester ===');
  {
    const page = loadPage('http-request-tester');

    // A real send, with fetch replaced. The reply is built by hand so the parsing
    // of it is what is being checked, not the network.
    const realFetch = globalThis.fetch;
    let seen = null;
    globalThis.fetch = async (url, options) => {
      seen = { url, options };
      return {
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: { forEach: (fn) => fn('application/json', 'content-type') },
        text: async () => '{"created":true,"id":7}',
      };
    };
    try {
      set(page.w, '#hrt-url', 'https://api.example.com/v1/items');
      set(page.w, '#hrt-method', 'POST');
      set(page.w, '#hrt-body-type', 'json');
      set(page.w, '#hrt-body', '{"name":"one"}');
      click(page.w, '#hrt-send');
      await sleep(200);
      check('http: the request that is sent carries the chosen method', seen.options.method, 'POST');
      check('http: ...and the body', seen.options.body, '{"name":"one"}');
      check('http: ...and the JSON content type the body type implies',
        seen.options.headers.some(([name, value]) => name.toLowerCase() === 'content-type' && value === 'application/json'), true);
      check('http: the status line reports what came back', read(page.w, '#hrt-status'), 'Done');
      check('http: the response headers are listed', read(page.w, '#hrt-res-headers'), 'content-type: application/json');
      check('http: a JSON reply is indented for reading', read(page.w, '#hrt-res-body'), '{\n  "created": true,\n  "id": 7\n}');
      // The size is the UTF-8 length of the body that actually came back, so the
      // number is derived here rather than copied out of the page.
      check('http: the timing and size are reported',
        read(page.w, '#hrt-meta'),
        `201 Created · ${read(page.w, '#hrt-meta').split(' · ')[1]} · ${Buffer.byteLength('{"created":true,"id":7}')} bytes`);

      // A failure has to say the browser rule out loud, because a missing
      // Access-Control-Allow-Origin looks exactly like a dead server.
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch');
      };
      click(page.w, '#hrt-send');
      await sleep(200);
      check('http: a reply the browser would not hand over is explained as a CORS rule',
        read(page.w, '#hrt-status').includes('did not send Access-Control-Allow-Origin'), true);
    } finally {
      globalThis.fetch = realFetch;
    }
  }

  /* ----------------------------------------------------------- curl tester */

  console.log('\n=== curl tester ===');
  {
    const page = loadPage('curl-tester');
    set(page.w, '#curl-in', "curl -X POST 'https://api.example.com/v1/items?a=1' -H 'X-Token: abc' -d 'name=one&tag=two'");
    await sleep(80);
    const out = read(page.w, '#curl-out');
    check('curl: the method and URL survive a paste', out.includes('--request POST') && out.includes('https://api.example.com/v1/items?a=1'), true);
    check('curl: the header survives a paste', out.includes("--header 'X-Token: abc'"), true);
    check('curl: the body becomes --data-raw', out.includes('--data-raw name=one&tag=two'), true);

    set(page.w, '#curl-in', out);
    await sleep(80);
    check('curl: parsing the rebuilt command gives the same command back', read(page.w, '#curl-out'), out);

    set(page.w, '#curl-in', 'curl -d \'{"a": 1, "b": 2}\' https://x.test/');
    await sleep(80);
    check('curl: a JSON body is compacted', read(page.w, '#curl-out').includes("--data-raw '{\"a\":1,\"b\":2}'"), true);

    set(page.w, '#curl-in', 'curl -k https://x.test/f');
    await sleep(80);
    check('curl: an unsupported flag is noted instead of dropped', read(page.w, '#curl-summary').includes('-k'), true);
    check('curl: ...and the status is not dressed up as an error', page.w.document.querySelector('#curl-status').classList.contains('err'), false);
  }

  /* ----------------------------------------------------- interest calculator */

  console.log('\n=== interest calculator ===');
  {
    const page = loadPage('interest-calculator');
    const cell = (key) => {
      const rows = [...page.w.document.querySelectorAll('#int-summary .tool-result-row')];
      const hit = rows.find((r) => r.querySelector('dt').textContent === key);
      return hit ? hit.querySelector('dd').textContent : null;
    };

    // Deposit shortcut: 8%/year, one month, 20% tax, Actual/365.
    check('interest: the deposit shortcut sets the 20% deposit tax', read(page.w, '#int-tax'), '20');
    check('interest: the gross interest for one month is the Actual/365 figure', cell('Bunga bruto'), 'Rp 65.753');
    check('interest: the tax is 20% of the gross', cell('Pajak 20%'), '− Rp 13.151');
    check('interest: the net is the gross minus tax', cell('Bunga net'), 'Rp 52.603');
    check('interest: a full year of net interest is 8% × 80% of the principal', cell('Net per tahun'), 'Rp 640.000');

    // Bond shortcut: 10% tax.
    set(page.w, '#int-product', 'bond');
    await sleep(60);
    check('interest: the bond shortcut sets the 10% bond tax', read(page.w, '#int-tax'), '10');

    // 30/360 makes a month exactly a twelfth.
    set(page.w, '#int-product', 'deposit');
    set(page.w, '#int-basis', '30/360');
    await sleep(60);
    check('interest: a 30/360 month is exactly 8% ÷ 12', cell('Bunga bruto'), 'Rp 66.667');

    // Compound: tax is withheld each period, so the net EAY is below the gross.
    set(page.w, '#int-basis', 'actual365');
    set(page.w, '#int-method', 'compound');
    set(page.w, '#int-tenor', '1');
    set(page.w, '#int-unit', 'years');
    set(page.w, '#int-freq', '12');
    await sleep(60);
    check('interest: monthly compounding lifts the gross EAY above the nominal rate', cell('EAY bruto'), '8.30%');
    check('interest: ...and withholding tax each period leaves a lower net EAY', cell('EAY net'), '6.59%');

    // Annuity: the amortisation formula for 10 million over 12 months at 8%.
    set(page.w, '#int-method', 'annuity');
    set(page.w, '#int-unit', 'months');
    set(page.w, '#int-tenor', '12');
    await sleep(60);
    check('interest: the annuity payment matches the amortisation formula', cell('Angsuran per bulan'), 'Rp 869.884');
    check('interest: the total interest is the sum of the schedule', cell('Total bunga'), 'Rp 438.611');
    check('interest: an annuity shows an instalment table', page.w.document.querySelectorAll('#int-schedule-out tbody tr').length, 12);
  }

  /* -------------------------------------------------------- time zone converter */

  console.log('\n=== time zone converter ===');
  {
    const page = loadPage('time-zone-converter');
    const value = (label) => {
      const rows = [...page.w.document.querySelectorAll('#tz-result .tool-result-row')];
      const hit = rows.find((r) => r.querySelector('dt').textContent === label);
      return hit ? hit.querySelector('dd').textContent : null;
    };
    set(page.w, '#tz-input', 'Sep 26, 2026 @ 00:24:20.437');
    set(page.w, '#tz-zone', 'UTC');
    await sleep(60);
    check('timezone: the default source is UTC', read(page.w, '#tz-zone'), 'UTC');
    check('timezone: the UTC instant matches the input', value('UTC'), '2026-09-26 00:24:20 · Sat · UTC+00:00');
    check('timezone: Jakarta is seven hours ahead', value('Jakarta · WIB'), '2026-09-26 07:24:20 · Sat · UTC+07:00');
    check('timezone: New York is behind UTC', String(value('New York')).startsWith('2026-09-25 20:24:20'), true);

    // A value with its own offset is an absolute instant; the source is ignored.
    set(page.w, '#tz-zone', 'Asia/Jakarta');
    set(page.w, '#tz-input', '2026-09-26T00:24:20+07:00');
    await sleep(60);
    check('timezone: an explicit offset is taken as the instant, not the source zone', value('UTC'), '2026-09-25 17:24:20 · Fri · UTC+00:00');
  }

  /* ----------------------------------------------------------- docker logs grep */

  console.log('\n=== docker logs grep ===');
  {
    const page = loadPage('docker-logs-grep');
    const log = [
      'api  | line 1', 'api  | line 2', 'api  | line 3', 'api  | error boom',
      'api  | line 5', 'api  | line 6', 'api  | line 7', 'api  | error again', 'api  | line 9',
    ].join('\n');
    set(page.w, '#dlg-input', log);
    set(page.w, '#dlg-pattern', 'error');
    set(page.w, '#dlg-before', '1');
    set(page.w, '#dlg-after', '1');
    await sleep(60);
    const out = read(page.w, '#dlg-output');
    check('docker logs: matches use a colon and context a dash, like grep -n -C', out.includes('4:api  | error boom') && out.includes('3-api  | line 3'), true);
    check('docker logs: context groups are separated with --', out.includes('\n--\n'), true);
    check('docker logs: the requested context is kept around each match', out.split('\n').filter((line) => !line.startsWith('--')).length, 6);

    set(page.w, '#dlg-mode', 'invert');
    await sleep(60);
    check('docker logs: invert mode drops the matching lines', read(page.w, '#dlg-output').includes('error'), false);

    set(page.w, '#dlg-mode', 'count');
    await sleep(60);
    check('docker logs: count mode reports the number of matches', read(page.w, '#dlg-output').startsWith('2 matching lines'), true);

    set(page.w, '#dlg-mode', 'unique');
    await sleep(60);
    check('docker logs: unique mode lists each matching line once', read(page.w, '#dlg-output').split('\n').length, 2);
  }

  /* ------------------------------------------------------ typing speed test */

  console.log('\n=== typing speed test ===');
  {
    const page = loadPage('typing-speed-test');
    await sleep(30);
    const doc = page.w.document;
    const wordCount = () => doc.querySelectorAll('#ty-words .ty-word').length;
    check('typing: a timed test fills a long word pool', wordCount() > 100, true);
    check('typing: the first word shows a caret', doc.querySelectorAll('#ty-words .ty-word:first-child .ty-caret').length, 1);
    check('typing: accuracy starts at 100%', read(page.w, '#ty-acc'), '100%');

    const first = doc.querySelector('#ty-words .ty-word:first-child').textContent;
    set(page.w, '#ty-input', `${first} `);
    await sleep(30);
    check('typing: a correctly typed word is marked done', doc.querySelectorAll('#ty-words .ty-word.is-done').length, 1);
    check('typing: the caret moves to the next word', doc.querySelectorAll('#ty-words .ty-word:nth-child(2) .ty-caret').length, 1);

    set(page.w, '#ty-input', `${first} 000`);
    await sleep(30);
    check('typing: wrong characters are marked bad', doc.querySelectorAll('#ty-words .ty-word:nth-child(2) .ty-char.is-bad').length > 0, true);

    set(page.w, '#ty-mode', 'words:25');
    await sleep(30);
    check('typing: a word goal builds exactly that many words', wordCount(), 25);
    check('typing: a new test clears the input', read(page.w, '#ty-input'), '');
    check('typing: a new test resets the result panel', doc.querySelectorAll('#ty-result .tool-result-row').length, 0);
  }

  /* ------------------------------------------------------ dockerfile builder */

  console.log('\n=== dockerfile builder ===');
  {
    const page = loadPage('dockerfile-builder');
    set(page.w, '#df-preset', 'node');
    await sleep(40);
    const node = read(page.w, '#df-output');
    check('dockerfile: the node preset starts with a syntax line', node.startsWith('# syntax=docker/dockerfile:1'), true);
    check('dockerfile: the node preset is multi-stage', node.includes('FROM node:20-alpine AS build'), true);
    check('dockerfile: artifacts are copied from the build stage', node.includes('COPY --from=build /app/dist ./dist'), true);
    check('dockerfile: the base field is filled by the preset', read(page.w, '#df-base'), 'node:20-alpine');

    set(page.w, '#df-run-join', true);
    await sleep(40);
    check('dockerfile: joining runs uses &&', read(page.w, '#df-output').includes('&& npm run build'), true);
  }

  /* ------------------------------------------------------ log parser */

  console.log('\n=== log parser ===');
  {
    const page = loadPage('log-parser');
    set(page.w, '#lp-input', [
      '{"time":"2026-09-26T00:24:18Z","level":"info","msg":"listening on :3000"}',
      '{"time":"2026-09-26T00:24:20Z","level":"error","msg":"db timeout"}',
      '{"time":"2026-09-26T00:24:21Z","level":"warn","msg":"slow request"}',
    ].join('\n'));
    await sleep(40);
    check('log parser: JSON Lines is detected', read(page.w, '#lp-summary').includes('json'), true);
    check('log parser: all entries are listed', read(page.w, '#lp-meta').startsWith('3 of 3 entries'), true);

    set(page.w, '#lp-level', 'error');
    await sleep(40);
    check('log parser: the level filter narrows the table', read(page.w, '#lp-meta').startsWith('1 of 3 entries'), true);
  }

  /* ------------------------------------------------------ date calculator */

  console.log('\n=== date calculator ===');
  {
    const page = loadPage('date-calculator');
    set(page.w, '#dc-start', '2026-01-31');
    set(page.w, '#dc-end', '2026-03-01');
    await sleep(40);
    check('date: a calendar difference keeps whole months', read(page.w, '#dc-result').includes('1 month, 1 day'), true);
    check('date: total days are counted', read(page.w, '#dc-result').includes('29'), true);

    set(page.w, '#dc-mode', 'add');
    set(page.w, '#dc-base', '2026-01-31');
    set(page.w, '#dc-amount', '1');
    set(page.w, '#dc-unit', 'months');
    await sleep(40);
    check('date: adding a month clamps to the last day', read(page.w, '#dc-result').includes('2026-02-28'), true);
  }

  /* ------------------------------------------------ nginx reverse proxy wizard */

  console.log('\n=== nginx reverse proxy wizard ===');
  {
    const page = loadPage('nginx-reverse-proxy-wizard');
    set(page.w, '#nrp-names', 'app.example.com');
    set(page.w, '#nrp-target', 'http://127.0.0.1:3000');
    await sleep(40);
    const out = read(page.w, '#nrp-out');
    check('nrp: the server name is emitted', out.includes('server_name app.example.com;'), true);
    check('nrp: the upstream pool is emitted', out.includes('upstream'), true);
    check('nrp: proxy_pass points at the upstream', out.includes('proxy_pass http://'), true);

    set(page.w, '#nrp-tls', false);
    await sleep(40);
    check('nrp: turning TLS off drops the redirect block', read(page.w, '#nrp-out').includes('return 301'), false);
  }

  /* ------------------------------------------------------ json schema validator */

  console.log('\n=== json schema validator ===');
  {
    const page = loadPage('json-schema-validator');
    const schema = { type: 'object', required: ['id'], properties: { id: { type: 'integer' }, email: { type: 'string', format: 'email' } } };
    set(page.w, '#jsv-schema', JSON.stringify(schema));
    set(page.w, '#jsv-doc', JSON.stringify({ id: 3, email: 'ada@example.com' }));
    await sleep(40);
    check('json schema: a matching document is valid', read(page.w, '#jsv-status'), 'Valid');

    set(page.w, '#jsv-doc', JSON.stringify({ id: 'x', email: 'nope' }));
    await sleep(40);
    check('json schema: a bad document reports errors', read(page.w, '#jsv-summary').startsWith('2 problem'), true);
    check('json schema: the error path is a JSON Pointer', read(page.w, '#jsv-errors').includes('#/id'), true);
  }

  /* ---------------------------------------------------------------- games */

  console.log('\n=== games ===');
  {
    const g2048 = loadPage('game-2048');
    check('2048: the board has 16 tiles', g2048.w.document.querySelectorAll('#g2048-board .g2048-cell').length, 16);
    check(
      '2048: a new game starts two tiles',
      [...g2048.w.document.querySelectorAll('#g2048-board .g2048-cell')].filter((cell) => cell.textContent).length,
      2,
    );

    const mm = loadPage('memory-match');
    check('memory: easy deals 16 cards', mm.w.document.querySelectorAll('#mm-board .mm-card').length, 16);
    mm.w.document.querySelectorAll('#mm-board .mm-card')[0].click();
    mm.w.document.querySelectorAll('#mm-board .mm-card')[1].click();
    check('memory: two flips count as one move', read(mm.w, '#mm-moves'), '1');

    const ms = loadPage('minesweeper');
    check('minesweeper: easy is a 9 by 9 grid', ms.w.document.querySelectorAll('#ms-board .ms-cell').length, 81);
    ms.w.document.querySelector('#ms-board .ms-cell').click();
    check('minesweeper: the first click is safe', ms.w.document.querySelectorAll('#ms-board .ms-cell.is-revealed').length > 0, true);

    const snake = loadPage('snake');
    check('snake: the board has 400 cells', snake.w.document.querySelectorAll('#snake-board .snake-cell').length, 400);
    check('snake: the snake starts at length three', snake.w.document.querySelectorAll('#snake-board .snake-cell.is-snake').length, 3);

    const tetris = loadPage('tetris');
    check('tetris: the board has 200 cells', tetris.w.document.querySelectorAll('#tetris-board .tetris-cell').length, 200);
    check('tetris: a piece is on the board', tetris.w.document.querySelectorAll('#tetris-board .tetris-cell.is-filled').length >= 4, true);
    check('tetris: the next queue is shown', tetris.w.document.querySelector('#tetris-next').children.length > 0, true);
  }

  /* -------------------------------------------------- fuel economy converter */

  console.log('\n=== fuel economy converter ===');
  {
    const page = loadPage('fuel-economy-converter');
    const cell = (i) => page.w.document.querySelectorAll('#fec-out tr')[i].querySelector('td').textContent;
    set(page.w, '#fec-unit', 'kmpl');
    set(page.w, '#fec-value', '100');
    await sleep(30);
    check('fuel: 100 km/L is 1 L/100 km', cell(1), '1');
    set(page.w, '#fec-unit', 'l100');
    set(page.w, '#fec-value', '235.214583');
    await sleep(30);
    check('fuel: 235.214583 L/100 km is 1 MPG (US)', cell(2), '1');
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
