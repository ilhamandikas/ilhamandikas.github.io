import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { categories, redactLog } from '../../assets/js/tools/log-redactor-model.js';

const all = Object.fromEntries(Object.keys(categories).map((key) => [key, true]));
const none = Object.fromEntries(Object.keys(categories).map((key) => [key, false]));
const redact = (text, options = all, custom = '') => redactLog(text, options, custom);
const input = 'Authorization: Bearer example-only\nDB_PASSWORD=example-password\nContact user@example.com from 192.0.2.10\nHost internal.example.com returned status=502';
assert.equal(redact(input, all, 'internal.example.com').text, 'Authorization: [REDACTED]\nDB_PASSWORD=[REDACTED]\nContact [REDACTED] from [REDACTED]\nHost [REDACTED] returned status=502');
for (const key of ['password', 'DB_PASSWORD', 'accessToken', 'clientSecret', 'AWS_SECRET_ACCESS_KEY', 'X-API-Key', 'request.headers.authorization', 'Cookie', 'Set-Cookie', 'DATABASE_URL']) {
  const result = redact(`prefix ${key}=example-secret after=visible`);
  assert.equal(result.text, `prefix ${key}=[REDACTED]`);
  assert.equal(result.counts.fields, 1);
}
assert.equal(redact('{"password": "example-only", "status": 500}').text, '{"password": [REDACTED]');
for (const tail of ['', '"unfinished', "'unfinished", '{', '[']) {
  const result = redact(`token=${tail}\ncontinued-secret\nnormal later line`);
  assert.equal(result.text, 'token=[REDACTED]');
  assert.equal(result.conservativeTail, true);
}
assert.equal(redact('token="closed"\nkeep this').text, 'token=[REDACTED]\nkeep this');
assert.equal(redact('token="escaped \\" inner"\nkeep this').conservativeTail, false);
for (const kind of ['PRIVATE KEY', 'RSA PRIVATE KEY', 'EC PRIVATE KEY', 'OPENSSH PRIVATE KEY', 'ENCRYPTED PRIVATE KEY']) {
  const block = `-----BEGIN ${kind}-----\nfake-example-only\n-----END ${kind}-----`;
  assert.equal(redact(`before\n${block}\nafter`).text, 'before\n[REDACTED]\nafter');
  assert.equal(redact(`before\n${block.slice(0, -25)}`).text, 'before\n[REDACTED]');
}
assert.equal(redact('postgres://user:pass@example.com/db', { ...none, credentials: true }).text, 'postgres://[REDACTED]@example.com/db');
assert.equal(redact('https://example.com/path', { ...none, credentials: true }).text, 'https://example.com/path');
assert.equal(redact('user@example.com, name+tag@example.org.').text, '[REDACTED], [REDACTED].');
assert.equal(redact('999.1.1.1 version=1.2.3 address=192.0.2.10').text, '999.1.1.1 version=1.2.3 address=[REDACTED]');
for (const address of ['::', '::1', '2001:db8::1', '2001:db8:0:0:0:0:0:1', '::ffff:192.0.2.10', 'fe80::1%eth0']) {
  assert.equal(redact(`[${address}]:443`, { ...none, ipv6: true }).text, '[[REDACTED]]:443');
}
for (const value of ['12:30:00', 'aa:bb:cc:dd:ee:ff', '2001::db8::1', 'gggg::1', '1:2:3:4:5:6:7:8:9']) {
  assert.equal(redact(value, { ...none, ipv6: true }).text, value);
}
const jwt = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJleGFtcGxlIn0.example-signature';
assert.equal(redact(`jwt ${jwt} end`).text, 'jwt [REDACTED] end');
assert.equal(redact('eyJhbGciOiJub25lIn0.eyJzdWIiOiJleGFtcGxlIn0.').text, '[REDACTED]');
assert.equal(redact('normal.three.words').text, 'normal.three.words');
assert.equal(redact('aaaaa a.*b AAAAA', none, 'aaa\na.*b').text, '[REDACTED] [REDACTED] AAAAA');
assert.equal(redact(input, none).text, input);
assert.equal(redact('no selected patterns', none).regions, 0);
assert.equal(redact('alpha\r\nsecret=hidden\r\nomega').text, 'alpha\r\nsecret=[REDACTED]\r\nomega');
assert.throws(() => redact('x'.repeat(500001)), /500,000/);
assert.throws(() => redact('log', none, 'ab'), /at least 3/);
assert.throws(() => redact('log', none, 'x'.repeat(10001)), /10,000/);
assert.throws(() => redact('log', none, Array.from({ length: 101 }, (_, i) => `item-${i}`).join('\n')), /100 distinct/);
assert.throws(() => redact('aaa '.repeat(20001), none, 'aaa'), /20,000/);
assert.equal(redact('a'.repeat(500000)).text.length, 500000);
assert.equal(redact('a-'.repeat(250000)).text.length, 500000);
const overlap = redact('http://user:password@example.com', all);
assert.equal(overlap.counts.credentials, 1);
assert.equal(overlap.counts.email, 1);
assert.equal(overlap.regions, 1);

const html = readFileSync(new URL('../../layouts/partials/tools/body/log-redactor.html', import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: 'https://ilham.dev/tools/log-redactor/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
window.tk = { setStatus(el, text) { el.textContent = text; } };
await import('../../assets/js/tools/log-redactor.js');
const $ = (name) => document.getElementById(`lr-${name}`);
$('run').click();
assert.equal($('copy').disabled, true);
$('example').click();
assert.ok($('output').value.includes('[REDACTED]'));
assert.ok(!$('output').value.includes('example-password'));
assert.ok($('input').value.includes('example-password'));
assert.equal($('copy').disabled, false);
const original = $('input').value;
$('example').click();
assert.equal($('input').value, original);
assert.match($('status').textContent, /Clear the current/);
$('email').checked = false;
$('email').dispatchEvent(new window.Event('change'));
assert.equal($('output').value, '');
assert.equal($('copy').disabled, true);
assert.equal($('download').disabled, true);
$('input').value = '<img src=x onerror=alert(1)> token=example-secret';
$('run').click();
assert.equal(document.querySelectorAll('img').length, 0);
assert.match($('output').value, /<img/);
assert.ok(!$('output').value.includes('example-secret'));
$('custom').value = 'ab';
$('run').click();
assert.match($('status').textContent, /at least 3/);
assert.equal($('copy').disabled, true);
assert.ok($('input').value.includes('example-secret'));
$('clear').click();
assert.equal($('input').value + $('custom').value + $('output').value, '');
assert.equal($('email').checked, false);
assert.equal(document.querySelectorAll('input:not([data-no-memory]), textarea:not([data-no-memory])').length, 0);
dom.window.close();
console.log('log-redactor: patterns, overlaps, limits, long inputs, stale results, and DOM tests passed');
