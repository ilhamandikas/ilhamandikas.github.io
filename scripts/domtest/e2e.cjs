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
    check('search: "time" ranks the timestamp tool first', top('time'), 'Timestamp Converter');
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

    // Nonsense has to keep finding nothing, or fuzzy is just a random generator.
    for (const nonsense of ['asdfgh', 'xyz', 'qqq', 'nonsense', 'kubernetes']) {
      check(`search: "${nonsense}" finds nothing`, rank(nonsense).length, 0);
    }
    check('search: the empty state is shown when nothing matches', empty.hidden, false);

    // The UI has to admit when the match was not something the user typed.
    rank('json formater');
    check('search: a fuzzy match says so', fuzzy.hidden, false);
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
    check('sidebar: every tool is listed', links.length, 90);
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
    check('sidebar: Escape restores every tool', shown().length, 90);
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
    check('sidebar nav: an empty query brings every tool back', visibleLinks(), 90);
    check('sidebar nav: ...and the categories with them', next.w.document.querySelector('.tool-nav').hasAttribute('data-searching'), false);

    // A cleared field must be remembered as cleared, or the old query returns.
    next.w.dispatchEvent(new next.w.Event('pagehide'));
    check('sidebar nav: a cleared field is remembered as cleared', JSON.parse(next.w.sessionStorage.getItem(KEY)).q, '');
    const fresh = loadPage('uuid-generator', { session: { [KEY]: next.w.sessionStorage.getItem(KEY) } });
    check('sidebar nav: ...so the next page starts unfiltered', fresh.w.document.querySelector('#tool-nav-search').value, '');
    check('sidebar nav: ...and shows every tool', [...fresh.w.document.querySelectorAll('.tool-nav a')].filter((a) => !a.hidden).length, 90);

    const result = next.finish();
    check('sidebar nav: no uncaught errors', result.thrown.length + result.errors.length, 0);
    fresh.dom.window.close();
    next.dom.window.close();
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
    check('seo: the catalog links every tool', slugs.length, 90);

    // Structured data has to describe what is actually on the page. Walk every
    // tool and check the schema agrees with the markup.
    const pages = slugs.map((slug) => read(`tools/${slug}/index.html`));
    check('seo: every tool page has written content', pages.filter((h) => /class=tool-about/.test(h)).length, 90);
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
