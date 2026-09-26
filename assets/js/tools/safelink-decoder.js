// Unwrap redirect / safelink URLs by pulling the destination out of the query.
const { tk } = window;

const input = document.querySelector('#safe-input');
const KEYS = ['url', 'q', 'u', 'redirect', 'target', 'link', 'dest', 'destination'];

function extract(raw) {
  const value = raw.trim();
  if (value === '') return '';

  const tryParams = (text) => {
    try {
      const url = new URL(text);
      for (const key of KEYS) {
        const found = url.searchParams.get(key);
        if (found) return found;
      }
    } catch {
      /* not an absolute URL */
    }
    const match = text.match(/[?&](?:url|q|u|redirect|target|link|dest|destination)=([^&]+)/i);
    if (match) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
    return null;
  };

  let current = value;
  for (let i = 0; i < 5; i += 1) {
    const next = tryParams(current);
    if (next === null || next === current) break;
    current = next;
  }
  return current;
}

tk.transform({
  watch: input,
  output: document.querySelector('#safe-output'),
  status: document.querySelector('#safe-status'),
  ok: 'Destination found',
  fn: () => extract(input.value),
});
