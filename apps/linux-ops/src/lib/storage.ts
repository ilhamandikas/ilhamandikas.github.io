// Favorites and recent commands, kept in localStorage only. Nothing here ever
// leaves the browser, and a failed read (private mode, disabled storage) simply
// degrades to an empty list.

const FAVORITES_KEY = 'linuxops:favorites';
const RECENT_KEY = 'linuxops:recent';
const MAX_RECENT = 8;

function read(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage is unavailable; the app still works, it just forgets */
  }
}

export function loadFavorites(): string[] {
  return read(FAVORITES_KEY);
}

export function toggleFavorite(id: string): string[] {
  const current = loadFavorites();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
  write(FAVORITES_KEY, next);
  return next;
}

export function loadRecent(): string[] {
  return read(RECENT_KEY).slice(0, MAX_RECENT);
}

export function pushRecent(id: string): string[] {
  const next = [id, ...loadRecent().filter((item) => item !== id)].slice(0, MAX_RECENT);
  write(RECENT_KEY, next);
  return next;
}
