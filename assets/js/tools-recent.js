// "Recently used" for the sidebar.
//
// Only the tool's slug and the time it was opened are kept, never what was typed
// into it. A tool page can hold a private key, a password or a signed token, and
// copying that into storage the user never asked for would be a real leak — so
// this module stores nothing but a name it already has in the page.
//
// localStorage rather than a cookie: there is no server to send it to, and a
// cookie would ride along on every request for no reason.
const KEY = 'ilham:recent-tools';
const MOST = 8;

// Storage throws in private mode on some browsers and holds junk under our key on
// others, so every read is defended.
function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry) => entry && typeof entry.slug === 'string' && Number.isFinite(entry.at));
  } catch {
    return [];
  }
}

function write(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

// Move to the front rather than append, so revisiting a tool keeps the list
// ordered by what was used last instead of filling up with the first eight.
export function record(slug) {
  if (!slug) return;
  const entries = read().filter((entry) => entry.slug !== slug);
  entries.unshift({ slug, at: Date.now() });
  write(entries.slice(0, MOST));
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// "3 minutes ago" beats a timestamp here: the question the list answers is "what
// was I just doing", not "when exactly".
function ago(at) {
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (seconds < 90) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/**
 * Fill in the sidebar's recent block.
 *
 * `names` maps slug to the label the sidebar already uses, so a renamed tool
 * never shows a stale title, and `current` is left out — a list that includes the
 * page you are looking at is noise.
 *
 * Returns the redraw function, so the sidebar can ask for the block again after a
 * search is cleared.
 */
export function mount(container, { names, current }) {
  const list = container.querySelector('.tool-recent-list');
  const button = container.querySelector('.tool-recent-clear');
  if (!list || !button) return;

  const draw = () => {
    const entries = read().filter((entry) => names.has(entry.slug) && entry.slug !== current);
    container.hidden = entries.length === 0;
    if (entries.length === 0) return;

    const items = entries.map((entry) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `/tools/${entry.slug}/`;
      link.textContent = names.get(entry.slug);
      const when = document.createElement('span');
      when.className = 'tool-recent-when';
      when.textContent = ago(entry.at);
      item.append(link, when);
      return item;
    });
    list.replaceChildren(...items);
  };

  button.addEventListener('click', () => {
    clear();
    draw();
  });

  draw();
  return draw;
}
