import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { compilePattern } from '../../assets/js/tools/posix-text-pattern.js';
import { simulateSed, simulateGrep } from '../../assets/js/tools/sed-grep-simulator.js';

const env = { ...process.env, LC_ALL: 'C' };
let crossChecks = 0;
function native(tool, argv, input) {
  const result = spawnSync(tool, argv, { input, encoding: 'utf8', env, timeout: 3000 });
  assert.ok(!result.error, result.error?.message);
  assert.ok(result.status === 0 || (tool === 'grep' && result.status === 1), `${tool} ${argv.join(' ')}: ${result.stderr}`);
  crossChecks += 1;
  return result.stdout;
}
const sedDefault = { mode: 'sub', pattern: 'cat', replacement: '<&>', extended: true, global: true, quiet: false, ignore: false, text: '' };
const grepDefault = { pattern: 'cat', style: 'E', numbers: false, ignore: false, context: '', word: false, invert: false, only: false, count: false, text: '' };
function checkSed(patch) {
  const s = { ...sedDefault, ...patch };
  const flags = `${s.global ? 'g' : ''}${s.ignore ? 'I' : ''}${s.quiet ? 'p' : ''}`;
  const expression = s.mode === 'sub' ? `s#${s.pattern}#${s.replacement}#${flags}` : `/${s.pattern}/${s.ignore ? 'I' : ''}${s.mode === 'delete' ? 'd' : 'p'}`;
  const argv = [...(s.extended ? ['-E'] : []), ...((s.mode === 'print' || (s.mode === 'sub' && s.quiet)) ? ['-n'] : []), '-e', expression];
  assert.equal(simulateSed(s).output, native('sed', argv, s.text), `sed ${JSON.stringify(s)}`);
}
function checkGrep(patch) {
  const s = { ...grepDefault, ...patch };
  const argv = [s.style === 'G' ? '-G' : `-${s.style}`];
  for (const [name, flag] of [['numbers', '-n'], ['ignore', '-i'], ['word', '-w'], ['invert', '-v'], ['only', '-o'], ['count', '-c']]) if (s[name]) argv.push(flag);
  if (Number(s.context) > 0) argv.push('-C', String(s.context));
  argv.push('-e', s.pattern);
  assert.equal(simulateGrep(s).output, native('grep', argv, s.text), `grep ${JSON.stringify(s)}`);
}
const text = 'ab a aa cat cat\nCat and dog\n\nERROR 123\nWARN retry\nno match\nabbb\nend\r\nlast cat';
const patterns = ['cat', 'a|ab', '(a*)*', 'a*', 'a?', '^', '$', '^$', '^cat', 'cat$', '(ab|a)b*', 'a(b)?', '[[:digit:]]+', '[a-z]{1,3}', '[^a-z]+', '[[:blank:]]', '[[:punct:]]', '[]+?]', '[[]', 'a{0}', '(ab){1,2}', '[[:alnum:]_]+'];
for (const pattern of patterns) {
  for (const global of [false, true]) checkSed({ pattern, text, global });
  checkSed({ pattern, text, mode: 'delete', ignore: true });
  checkSed({ pattern, text, mode: 'print' });
  checkGrep({ pattern, text });
  checkGrep({ pattern, text, only: true, numbers: true });
  checkGrep({ pattern, text, word: true, only: true, ignore: true });
}
for (const pattern of ['a\\|ab', '\\(ab\\)\\+', '[[:digit:]]\\{1,2\\}', 'a+', '[()+?]', '[]+?]']) {
  checkSed({ pattern, text, extended: false });
  checkGrep({ pattern, text, style: 'G', only: true });
}
for (const pattern of ['cat', 'a.b', '[error]', 'a+b']) {
  checkGrep({ pattern, text: 'cat cat\nCat\na.b\n[error]\na+b cat!', style: 'F', only: true, ignore: true, numbers: true });
}
for (const invert of [false, true]) for (const count of [false, true]) for (const only of [false, true]) {
  checkGrep({ pattern: 'cat|ERROR', text, invert, count, only, numbers: true, context: '1' });
}
for (const context of ['0', '1']) checkGrep({ text: 'hit\n1\n2\n3\n4\nhit\n6\n7\n8\n9\nhit', pattern: 'hit', numbers: true, context });
for (const sample of ['', '\n', 'a', 'a\n', '\n\n', 'bbaaa\n', 'aaaa', '<img src=x>cat']) {
  for (const pattern of ['a*', '^', '$', '.', 'a|aa']) {
    checkSed({ text: sample, pattern, quiet: true });
    checkGrep({ text: sample, pattern, only: true });
  }
}
for (const pattern of ['a*(ab)?', '(a|aa)*b?', '(a?)*', '(a|ab)?b*', '[^[:digit:]]*']) {
  for (const sample of ['aab', 'baaab aab', '\n', 'ab123\n', 'aaa\nbb']) {
    checkSed({ pattern, text: sample });
    checkGrep({ pattern, text: sample, only: true });
  }
}
for (const sample of ['\nx\nx\nx\na\n', 'a\nx\nx\nx\n\nx\nx\nx\na\n']) {
  checkGrep({ pattern: '^$|a', text: sample, only: true, context: '1', numbers: true });
  checkGrep({ pattern: '^$|a', text: sample, only: true, context: '1', numbers: true, invert: true });
}
for (const replacement of ['', '&', '\\&', '\\\\', '[&]', 'before\\nafter', '\\t&', '\\/']) checkSed({ text, replacement });
assert.deepEqual(compilePattern('a|ab')('ab'), { start: 0, end: 2 });
for (const pattern of ['(a)\\1', '\\d+', '(?=a)', 'a+?', 'a{51}', 'a|', '()', '[', '[[=a=]]', '[\\d]', 'a^b']) assert.throws(() => compilePattern(pattern));
assert.throws(() => simulateSed({ ...sedDefault, text, replacement: '\\1' }), /backreferences/);
assert.throws(() => simulateSed({ ...sedDefault, text, replacement: '\\U&' }), /case-conversion/);
assert.throws(() => simulateGrep({ ...grepDefault, text, style: 'P' }), /Perl/);
assert.throws(() => simulateGrep({ ...grepDefault, text: 'Unicode é' }), /ASCII/);
assert.throws(() => simulateGrep({ ...grepDefault, text: 'a\0b' }), /NUL/);
assert.throws(() => simulateGrep({ ...grepDefault, text: 'a'.repeat(50001) }), /50,000/);
assert.throws(() => simulateGrep({ ...grepDefault, text: 'a'.repeat(5001) }), /5,000/);
assert.throws(() => simulateGrep({ ...grepDefault, text, context: '51' }), /context limit/);
assert.throws(() => simulateGrep({ ...grepDefault, pattern: '(a|b|c|d|e){50}z', text: ('a'.repeat(1000) + '\n').repeat(10) }), /work limit/);
assert.throws(() => simulateSed({ ...sedDefault, pattern: '.', replacement: 'x'.repeat(1000), text: 'a'.repeat(1000) }), /output limit/);

const html = ['sed-simulator', 'grep-simulator'].map((slug) => readFileSync(new URL(`../../layouts/partials/tools/body/${slug}.html`, import.meta.url), 'utf8')).join('\n');
const dom = new JSDOM(html, { url: 'https://ilham.dev/tools/sed-simulator/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
await import('../../assets/js/toolkit.js');
await import('../../assets/js/tools/sed-simulator.js');
await import('../../assets/js/tools/grep-simulator.js');
const $ = (id) => document.getElementById(id);
$('sed-sim-run').click();
assert.match($('sed-sim-output').value, /dog dog/);
assert.ok($('sed-sim-input').value.includes('cat cat'));
assert.equal($('grp-sim-output').value, '');
$('grp-sim-run').click();
assert.equal($('grp-sim-output').value, '2:WARN retry scheduled\n3:ERROR database timeout\n');
$('sed-pattern').value = '(a)\\1';
$('sed-pattern').dispatchEvent(new window.Event('input'));
assert.equal($('sed-sim-output').value, '');
assert.equal($('sed-sim-copy').disabled, true);
$('sed-sim-run').click();
assert.match($('sed-sim-status').textContent, /backreferences/);
assert.equal($('sed-pattern').value, '(a)\\1');
$('sed-mode').value = 'delete';
$('sed-mode').dispatchEvent(new window.Event('change'));
assert.equal($('sed-replacement-field').hidden, true);
$('grp-pattern').value = '<img';
$('grp-sim-input').value = '<img src=x onerror=alert(1)>\n';
$('grp-sim-run').click();
assert.equal(document.querySelectorAll('img').length, 0);
assert.ok($('grp-sim-output').value.includes('<img'));
$('grp-sim-clear').click();
assert.equal($('grp-sim-input').value + $('grp-sim-output').value, '');
assert.equal($('grp-pattern').value, '<img');
assert.equal(document.querySelectorAll('input:not([data-no-memory]), select:not([data-no-memory]), textarea:not([data-no-memory])').length, 0);
dom.window.close();
console.log(`Separate sed/grep simulators: ${crossChecks} GNU/C-locale cross-checks, limits, unsupported syntax, and DOM tests passed`);
