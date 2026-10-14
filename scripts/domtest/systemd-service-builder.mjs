import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { buildService } from '../../assets/js/tools/systemd-service-model.js';

const defaults = { name: 'example-app', description: 'Example application', executable: '/usr/bin/true', directory: '/tmp', user: 'app', group: '', args: 'one\nspace inside\n$HOME\n%h\nquote " here\nback\\slash\n\n', envFile: '', envOptional: false, restart: 'on-failure', restartSec: '5', stopSec: '30', network: false, harden: false };
const build = (patch = {}) => buildService({ ...defaults, ...patch });
const result = build();
assert.equal(result.filename, 'example-app.service');
assert.match(result.unit, /ExecStart="\/usr\/bin\/true" "one" "space inside" "\$\$HOME" "%%h" "quote \\" here" "back\\\\slash"/);
assert.match(result.unit, /WorkingDirectory=\/tmp\n/);
assert.ok(!result.unit.includes('EnvironmentFile=') && !result.unit.includes('Group='));
assert.match(result.commands, /systemd-analyze verify/);
assert.match(result.commands, /enable --now example-app.service/);
const full = build({ group: 'app', description: 'Example 100% service', envFile: '/tmp/example env.conf', envOptional: true, directory: '/tmp/example app', harden: true, network: true });
assert.match(full.unit, /Description=Example 100%% service/);
assert.match(full.unit, /EnvironmentFile=-\/tmp\/example env.conf/);
assert.match(full.unit, /WorkingDirectory=\/tmp\/example app/);
assert.match(full.unit, /NoNewPrivileges=true\nPrivateTmp=true/);
assert.match(full.unit, /Wants=network-online.target\nAfter=network-online.target/);
assert.match(full.unit, /Group=app/);
assert.ok(!build({ restart: 'no' }).unit.includes('RestartSec='));
assert.match(build({ args: ' leading and trailing ' }).unit, /" leading and trailing "/);
for (const patch of [
  { name: '../bad' }, { name: 'bad.service' }, { name: 'Bad' }, { name: 'a'.repeat(65) },
  { description: 'injected\n[Service]' }, { description: 'ending\\' }, { executable: 'node' },
  { executable: '/usr/bin/$APP' }, { directory: '/opt/../app' }, { directory: '/tmp/escape\\' },
  { user: 'root' }, { user: '' }, { user: 'app;evil' }, { group: 'group\nExecStart=evil' },
  { envFile: './config.env' }, { envFile: '/etc/*.env' }, { restart: 'arbitrary' },
  { restartSec: '0' }, { stopSec: '3601' }, { stopSec: '2.5' }, { args: '\targument' },
  { args: ';' }, { args: 'x'.repeat(32001) }, { args: Array(101).fill('arg').join('\n') },
]) assert.throws(() => build(patch));
const dir = mkdtempSync(join(tmpdir(), 'ilham-systemd-test-'));
try {
  for (const [i, unit] of [result.unit, full.unit, build({ restart: 'always' }).unit, build({ restart: 'no', args: '100%\n$VALUE\n%\n$' }).unit].entries()) {
    const filename = join(dir, `example-${i}.service`);
    writeFileSync(filename, unit);
    execFileSync('systemd-analyze', ['verify', filename], { stdio: 'pipe' });
  }
} finally { rmSync(dir, { recursive: true, force: true }); }

const html = readFileSync(new URL('../../layouts/partials/tools/body/systemd-service-builder.html', import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: 'https://ilham.dev/tools/systemd-service-builder/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
window.tk = {
  setStatus(el, text) { el.textContent = text; },
  live(controls, fn) { for (const el of controls) { el.addEventListener('input', fn); el.addEventListener('change', fn); } fn(); },
};
window.confirm = () => true;
await import('../../assets/js/tools/systemd-service-builder.js');
const $ = (name) => document.getElementById(`sd-${name}`);
assert.match($('output').value, /Type=simple/);
$('name').value = 'worker';
$('name').dispatchEvent(new window.Event('input'));
assert.equal($('download').dataset.filename, 'worker.service');
assert.match($('commands').value, /worker.service/);
$('user').value = 'root';
$('user').dispatchEvent(new window.Event('input'));
assert.equal($('output').value + $('commands').value, '');
assert.match($('status').textContent, /non-root/);
assert.equal($('download').disabled, true);
window.confirm = () => false;
$('reset').click();
assert.equal($('user').value, 'root');
window.confirm = () => true;
$('reset').click();
assert.equal($('user').value, 'app');
assert.equal($('name').value, 'example-app');
assert.equal($('download').disabled, false);
assert.equal(document.querySelectorAll('input:not([data-no-memory]), textarea:not([data-no-memory]), select:not([data-no-memory])').length, 0);
dom.window.close();
console.log('systemd-service-builder: unit validation, injection checks, systemd-analyze verification, and DOM tests passed');
