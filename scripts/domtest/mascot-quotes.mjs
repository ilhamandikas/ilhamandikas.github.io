import assert from 'node:assert/strict';
import { createQuoteDeck } from '../../assets/js/mascot-quotes.js';

const memory = new Map();
const storage = { getItem: (key) => memory.get(key) || null, setItem: (key, value) => memory.set(key, value) };
const items = [{ quote: 'Take one small step.', author: 'Example Author' },
  { quote: 'Keep learning.', author: 'Another Author' }, { quote: 'x'.repeat(161), author: 'Too long' },
  { quote: null, author: 'Invalid' }];
let calls = 0;
const fetcher = async (url, options) => {
  calls++;
  assert.equal(url, 'https://dummyjson.com/quotes?limit=100');
  assert.equal(options.credentials, 'omit');
  assert.equal(options.referrerPolicy, 'no-referrer');
  assert.ok(options.signal);
  return { ok: true, json: async () => ({ quotes: items }) };
};
let deck = createQuoteDeck({ storage, fetcher });
const loaded = await deck.load();
assert.equal(loaded.length, 2, 'invalid and oversized quotes are excluded');
assert.equal(calls, 1);
await deck.load();
assert.equal(calls, 1, 'one fetch, not one per quote');
const first = deck.next();
assert.notEqual(deck.next().quote, first.quote, 'no immediate repeats');
const last = deck.next().quote;
deck = createQuoteDeck({ storage, fetcher });
await deck.load();
assert.equal(calls, 1, 'fresh cache survives navigation/reload');
assert.notEqual(deck.next().quote, last, 'last quote survives reload');
const key = [...memory.keys()][0];
const stale = JSON.parse(memory.get(key));
stale.savedAt = Date.now() - 25 * 60 * 60 * 1000;
memory.set(key, JSON.stringify(stale));
deck = createQuoteDeck({ storage, fetcher: async () => { throw Error('offline'); } });
assert.equal((await deck.load()).length, 2, 'stale cache remains useful offline');
assert.ok(deck.next());
deck = createQuoteDeck({ fetcher: async () => ({ ok: false }) });
assert.deepEqual(await deck.load(), []);
assert.equal(deck.next(), null, 'failure without cache falls back to the search prompt');
deck = createQuoteDeck({ storage: { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } }, fetcher });
assert.equal((await deck.load()).length, 2, 'blocked storage does not break quotes');
deck = createQuoteDeck({ storage: { getItem: () => '{bad json' }, fetcher: async () => ({ ok: true, json: async () => ({ quotes: [] }) }) });
assert.deepEqual(await deck.load(), []);
console.log('Mascot quotes: validation, request privacy, cache, no repeats, offline, blocked storage and invalid responses passed.');
