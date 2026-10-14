const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const handlers = new Map();
const timers = new Map();
let nextTimer = 0;
const context = vm.createContext({
  self: {
    location: new URL('https://example.com/tools/playground-input-sw.js'),
    addEventListener: (type, handler) => handlers.set(type, handler),
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  },
  URL, Response, TextEncoder,
  setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
  clearTimeout: (id) => timers.delete(id),
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../../static/tools/playground-input-sw.js'), 'utf8'), context);
const token = '00000000-0000-4000-8000-000000000001';
function message(data, owner = 'tab-1') {
  const replies = [];
  handlers.get('message')({ data, source: { id: owner }, ports: [{ postMessage: (data) => replies.push(data) }] });
  return replies;
}
function read(id, customURL = null) {
  let result;
  handlers.get('fetch')({
    request: { url: customURL || `https://example.com/tools/__playground_input__/${token}/${id}`, method: 'GET' },
    respondWith: (response) => { result = Promise.resolve(response); },
  });
  return result;
}
(async () => {
  assert.equal(read(1, 'https://example.com/tools/python-playground/'), undefined, 'ordinary pages are not intercepted');
  assert.equal(read(1, 'https://cdn.example.com/tools/__playground_input__/anything'), undefined);
  assert.equal((await read(1)).status, 409);
  assert.equal(message({ type: 'open', token })[0].ok, true);
  assert.equal(message({ type: 'open', token }, 'tab-2')[0].ok, false);
  const pending = read(1);
  let settled = false;
  pending.then(() => { settled = true; });
  message({ type: 'input', token, id: 1, value: 'wrong tab' }, 'tab-2');
  await Promise.resolve();
  assert.equal(settled, false, 'another tab cannot answer');
  message({ type: 'close', token }, 'tab-2');
  message({ type: 'input', token, id: 1, value: 'Ilham café 😀 <img src=x>' });
  assert.deepEqual(await (await pending).json(), { value: 'Ilham café 😀 <img src=x>' });
  assert.equal((await read(1)).status, 409, 'old input cannot be replayed');
  message({ type: 'input', token, id: 2, value: '' });
  assert.deepEqual(await (await read(2)).json(), { value: '' }, 'empty line is not EOF');
  const eof = read(3);
  message({ type: 'input', token, id: 3, value: null });
  assert.deepEqual(await (await eof).json(), { value: null });
  const stopped = read(4);
  message({ type: 'close', token });
  assert.equal((await stopped).status, 410, 'Stop releases the pending local request');
  assert.equal((await read(5)).status, 409);
  assert.equal(timers.size, 0, 'closing removes all session timers');
  message({ type: 'open', token });
  const timeout = read(1);
  const waitingTimer = [...timers.values()].find((timer) => timer.delay === 120000);
  waitingTimer.fn();
  assert.equal((await timeout).status, 410);
  assert.equal((await read(2)).status, 409);
  assert.equal((await read(1, 'https://example.com/tools/__playground_input__/invalid')).status, 400);
  assert.equal((await read(1, `https://example.com/tools/__playground_input__/${token}/1?input=should-not-be-used`)).status, 400);
  console.log('PASS local stdin bridge: owner isolation, Unicode, empty line/EOF, early replies, Stop, timeout, no input replay, and no interception of ordinary requests');
})().catch((error) => { console.error(error); process.exitCode = 1; });
