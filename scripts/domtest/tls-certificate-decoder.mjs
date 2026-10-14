import assert from 'node:assert/strict';
import { X509Certificate } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { decodeCertificates, parseCertificate } from '../../assets/js/tools/tls-certificate-parser.js';
import example from '../../assets/js/data/tls-certificate-example.js';

const [cert] = await decodeCertificates(example);
const native = new X509Certificate(example);
assert.equal(cert.fingerprint, native.fingerprint256);
assert.equal(cert.notBefore, new Date(native.validFrom).toISOString());
assert.equal(cert.notAfter, new Date(native.validTo).toISOString());
assert.equal(cert.serial.replaceAll(':', ''), native.serialNumber);
assert.match(cert.publicKey, /RSA.*2048 bits/);
assert.deepEqual(cert.subjectAltNames, ['DNS: example.com', 'DNS: *.example.com', 'IP: 192.0.2.10', 'IP: 2001:db8:0:0:0:0:0:1']);
assert.match(cert.subject, /CN="example.com"/);
assert.equal((await decodeCertificates(example + '\n' + example)).length, 2);
assert.equal((await decodeCertificates(example.replace(/\n/g, '\r\n')))[0].fingerprint, cert.fingerprint);
for (const invalid of ['', 'not PEM', example + '\nprivate data', example.replace('MIIDp', '!!!!p'), example.replaceAll('CERTIFICATE', 'PRIVATE KEY'), example.slice(0, -30), example.repeat(21), 'x'.repeat(1000001)]) {
  await assert.rejects(decodeCertificates(invalid));
}
for (const bytes of [new Uint8Array(), new Uint8Array([48, 128]), new Uint8Array([48, 255]), new Uint8Array([48, 3, 2, 1]), new Uint8Array([48, 0]), new Uint8Array([48, 129, 0]), new Uint8Array([48, 0, 0])]) {
  assert.throws(() => parseCertificate(bytes));
}
for (let i = 0; i < native.raw.length; i += 19) {
  assert.throws(() => parseCertificate(new Uint8Array(native.raw.subarray(0, i))));
}
// RFC 5280 uses 1950 for YY=50 and 2049 for YY=49. No signature check is attempted.
const dates = Buffer.from(native.raw);
const from = Buffer.from('261014153427Z');
const to = Buffer.from('361011153427Z');
assert.ok(dates.indexOf(from) > 0 && dates.indexOf(to) > 0);
Buffer.from('500101000000Z').copy(dates, dates.indexOf(from));
Buffer.from('491231235959Z').copy(dates, dates.indexOf(to));
const boundary = parseCertificate(new Uint8Array(dates));
assert.equal(boundary.notBefore, '1950-01-01T00:00:00.000Z');
assert.equal(boundary.notAfter, '2049-12-31T23:59:59.000Z');

const dir = mkdtempSync(join(tmpdir(), 'ilham-tls-test-'));
try {
  for (const [kind, keyArgs, match] of [
    ['ec', ['-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:P-256'], /EC.*P-256/],
    ['ed25519', ['-newkey', 'ed25519'], /Ed25519/],
  ]) {
    const path = join(dir, `${kind}.pem`);
    execFileSync('openssl', ['req', '-x509', ...keyArgs, '-nodes', '-keyout', join(dir, 'key.pem'), '-out', path, '-days', '10000', '-subj', '/CN=example.com/O=Example', '-addext', 'subjectAltName=DNS:example.com,email:user@example.com,URI:https://example.com/'], { stdio: 'ignore' });
    const pem = readFileSync(path, 'utf8');
    const [parsed] = await decodeCertificates(pem);
    const x = new X509Certificate(pem);
    assert.equal(parsed.fingerprint, x.fingerprint256);
    assert.equal(parsed.notAfter, new Date(x.validTo).toISOString());
    assert.ok(Number(parsed.notAfter.slice(0, 4)) >= 2050);
    assert.match(parsed.publicKey, match);
    assert.deepEqual(parsed.subjectAltNames, ['DNS: example.com', 'Email: user@example.com', 'URI: https://example.com/']);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const html = readFileSync(new URL('../../layouts/partials/tools/body/tls-certificate-decoder.html', import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: 'https://ilham.dev/tools/tls-certificate-decoder/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
window.tk = { setStatus(el, text) { el.textContent = text; } };
window.confirm = () => true;
const { dateStatus } = await import('../../assets/js/tools/tls-certificate-decoder.js');
assert.match(dateStatus(cert, Date.parse(cert.notBefore) - 1), /Not yet/);
assert.match(dateStatus(cert, Date.parse(cert.notAfter) + 1), /Expired/);
assert.match(dateStatus(cert, Date.parse(cert.notAfter)), /0 full days/);
assert.match(dateStatus(cert, Date.parse(cert.notBefore)), /Within validity dates/);
const $ = (name) => document.getElementById(`tls-${name}`);
const wait = () => new Promise((resolve) => setTimeout(resolve, 30));
$('example').click();
await wait();
assert.ok($('output').value.includes(cert.fingerprint));
assert.ok($('output').value.includes('Trust') || $('output').value.includes('trust'));
assert.equal($('copy').disabled, false);
$('input').dispatchEvent(new window.Event('input'));
assert.equal($('output').value, '');
assert.equal($('copy').disabled, true);
$('input').value = 'invalid';
$('decode').click();
await wait();
assert.match($('status').textContent, /complete BEGIN CERTIFICATE/);
assert.equal($('input').value, 'invalid');
assert.equal($('decode').disabled, false);
$('input').value = example;
$('decode').click();
$('clear').click();
await wait();
assert.equal($('input').value + $('output').value, '');
assert.equal($('copy').disabled, true);
assert.equal($('status').textContent, 'Input and report cleared.');
assert.equal(document.querySelectorAll('input:not([data-no-memory]), textarea:not([data-no-memory])').length, 0);
dom.window.close();
console.log('tls-certificate-decoder: OpenSSL/native cross-checks, malformed input, date boundaries, and DOM tests passed');
