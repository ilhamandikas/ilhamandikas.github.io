const CACHE_KEY = 'ilham-companion-quotes-v1';
const MAX_AGE = 24 * 60 * 60 * 1000;
const ENDPOINT = 'https://dummyjson.com/quotes?limit=100';

function cleanQuotes(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 100).filter((item) => item && typeof item.quote === 'string'
    && typeof item.author === 'string' && item.quote.trim().length > 0
    && item.quote.length <= 160 && item.author.trim().length > 0 && item.author.length <= 60)
    .map(({ quote, author }) => ({ quote: quote.trim(), author: author.trim() }));
}

// Fixed public endpoint: no search terms, page URL, cookies, or credentials.
export function createQuoteDeck({ storage, fetcher } = {}) {
  let quotes = [];
  let savedAt = 0;
  let lastQuote = '';
  let loading = null;
  let controller = null;
  try {
    const cache = JSON.parse(storage?.getItem(CACHE_KEY));
    if (cache) {
      quotes = cleanQuotes(cache.quotes);
      savedAt = Number.isFinite(cache.savedAt) ? cache.savedAt : 0;
      lastQuote = typeof cache.lastQuote === 'string' ? cache.lastQuote : '';
    }
  } catch { /* An unavailable or corrupt cache is not a search error. */ }
  function save() {
    try { storage?.setItem(CACHE_KEY, JSON.stringify({ quotes, savedAt, lastQuote })); } catch { /* Optional cache. */ }
  }
  async function load() {
    if (quotes.length && Date.now() - savedAt >= 0 && Date.now() - savedAt < MAX_AGE) return quotes;
    if (!fetcher) return quotes;
    if (!loading) loading = (async () => {
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 4000);
      try {
        const response = await fetcher(ENDPOINT, {
          credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal,
        });
        if (!response.ok) return quotes;
        const data = await response.json();
        const next = cleanQuotes(data.quotes);
        if (next.length) {
          quotes = next;
          savedAt = Date.now();
          save();
        }
      } catch { /* Use stale quotes, or the normal search prompt, when offline. */ }
      finally { clearTimeout(timeout); }
      return quotes;
    })();
    return loading;
  }
  function next() {
    const options = quotes.filter((item) => item.quote !== lastQuote);
    const pool = options.length ? options : quotes;
    if (!pool.length) return null;
    const item = pool[Math.floor(Math.random() * pool.length)];
    lastQuote = item.quote;
    save();
    return item;
  }
  return { load, next, stop: () => controller?.abort() };
}
