// Site-wide keyboard shortcuts.
//
// Two shapes live here: single keys that stand alone (`?` for this list, `/` for
// the search box) and `g` sequences that mirror the header. Both are driven by
// the one table below, which is also what the help overlay renders, so the list
// cannot drift from what the keys do and a shortcut that is not in the table
// cannot exist.
//
// Every destination is read back out of the page's own markup — the header
// links and the feed link — rather than typed in here, so a shortcut can never
// point somewhere the site does not.
//
// The keys stay quiet while a field or an editor has focus, while a menu
// modifier is held, and on auto-repeat.
import { buildIndex, search as runSearch, shortcutLabel } from './tools-search.js';
import { initSearchMascot } from './search-mascot.js';

const SEQUENCE_TIMEOUT = 1600;
const NAV_KEYS = { Home: 'h', Posts: 'p', Guides: 'u', Tools: 't', 'Dev Ops': 'd', Games: 'g', Playground: 'j', About: 'a', Contact: 'c' };

const nav = document.querySelector('#site-nav');
const toolsLink = nav && [...nav.querySelectorAll('a')].find((link) => link.textContent.trim() === 'Tools');
const feed = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
const localSearch = document.querySelector('#tools-search') || document.querySelector('#tool-nav-search');
const currentPath = location.pathname.replace(/\/+$/, '') || '/';
const pagePathOwnsSearchShortcut = currentPath === '/tools/linux-ops' || currentPath === '/linux-ops';
const pageOwnsSearchShortcut = () => pagePathOwnsSearchShortcut || document.querySelector('[data-shortcuts-own-search], .lo-app');
const hasLocalSearchShortcut = () => Boolean(localSearch || pageOwnsSearchShortcut());
const globalSearchAvailable = () => !hasLocalSearchShortcut();
const searchHref = !pageOwnsSearchShortcut() && toolsLink ? `${toolsLink.getAttribute('href')}#search` : null;

const entries = [{ keys: ['?'], label: 'Open or close this list', toggle: true }];

if (globalSearchAvailable()) {
  entries.push({ keys: [shortcutLabel()], label: 'Search tools, guides, and posts', globalSearch: true });
} else if (!pageOwnsSearchShortcut() && (searchHref || localSearch)) {
  entries.push({ keys: ['/'], label: 'Search the tools', href: searchHref, search: true });
}

const searchEntry = entries.find((entry) => entry.search);

if (nav) {
  for (const link of nav.querySelectorAll('a')) {
    const label = link.textContent.trim();
    const key = NAV_KEYS[label];
    if (key) entries.push({ keys: ['g', key], label, href: link.getAttribute('href') });
  }
}

if (feed) {
  entries.push({ keys: ['g', 'r'], label: 'RSS feed', href: feed.getAttribute('href') });
}

// The previous and next post are only in the markup on a post page, so the two
// keys only appear in the list where they can do something.
for (const [key, selector, verb] of [['[', '.post-nav a:not(.next)', 'Previous'], [']', '.post-nav a.next', 'Next']]) {
  const link = document.querySelector(selector);
  if (!link) continue;
  const title = link.textContent.trim().replace(/\s*[←→]\s*$/, '');
  entries.push({ keys: [key], label: `${verb} post: ${title}`, href: link.getAttribute('href') });
}

/* ---------------------------------------------------------------- the overlay */

const help = document.createElement('div');
help.id = 'kbd-help';
help.className = 'kbd-help';
help.hidden = true;
help.innerHTML = `
  <div class="kbd-help-backdrop" data-kbd-close></div>
  <div class="kbd-help-panel" role="dialog" aria-modal="true" aria-labelledby="kbd-help-title" tabindex="-1">
    <div class="kbd-help-head">
      <h2 class="kbd-help-title" id="kbd-help-title">Keyboard shortcuts</h2>
      <button type="button" class="kbd-help-close" data-kbd-close>Close</button>
    </div>
    <div class="kbd-help-list"></div>
    <p class="kbd-help-note"><span class="kbd-help-search-note"><kbd class="kbd-help-mod"></kbd> focuses the search box too. </span>Shortcuts are ignored while you are typing.</p>
  </div>`;

help.querySelector('.kbd-help-mod').textContent = shortcutLabel();
if (!searchEntry) help.querySelector('.kbd-help-search-note').hidden = true;

// A row is a link when there is somewhere to go and a plain row when there is
// not (`?` only toggles). Both the list and the key handler go through the same
// node, so clicking a row and pressing its keys do exactly the same thing.
const list = help.querySelector('.kbd-help-list');
for (const entry of entries) {
  const row = document.createElement(entry.href ? 'a' : 'div');
  row.className = 'kbd-help-row';
  if (entry.href) {
    row.href = entry.href;
    row.setAttribute('aria-keyshortcuts', entry.keys.join(' '));
  }

  const keys = document.createElement('span');
  keys.className = 'kbd-help-keys';
  for (const key of entry.keys) {
    const kbd = document.createElement('kbd');
    kbd.textContent = key;
    keys.append(kbd);
  }

  const label = document.createElement('span');
  label.className = 'kbd-help-label';
  label.textContent = entry.label;
  row.append(keys, label);

  if (entry.search && localSearch) {
    row.addEventListener('click', (event) => {
      event.preventDefault();
      closeHelp();
      focusSearch();
    });
  }

  if (entry.globalSearch) {
    row.addEventListener('click', () => openGlobalSearch());
  }

  entry.node = row;
  list.append(row);
}

const chip = document.createElement('div');
chip.id = 'kbd-chip';
chip.className = 'kbd-chip';
chip.hidden = true;
chip.setAttribute('aria-hidden', 'true');
chip.innerHTML = '<kbd>g</kbd><span>then a key</span>';

document.body.append(help, chip);

/* ------------------------------------------------------------- global search */

const toolsURL = toolsLink ? new URL(toolsLink.getAttribute('href'), location.href) : new URL('/tools/', location.href);
const siteRoot = new URL('../', toolsURL);
const globalSearch = document.createElement('div');
globalSearch.id = 'global-search';
globalSearch.className = 'global-search';
globalSearch.hidden = true;
globalSearch.innerHTML = `
  <div class="global-search-backdrop" data-global-search-close></div>
  <div class="global-search-panel" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
    <label class="global-search-field">
      <span class="global-search-icon" aria-hidden="true">⌕</span>
      <input type="search" autocomplete="off" id="global-search-input" aria-labelledby="global-search-title" placeholder="Search tools, guides, and posts…">
      <kbd class="global-search-kbd" aria-hidden="true"></kbd>
    </label>
    <h2 class="global-search-title" id="global-search-title">Search ilham.dev</h2>
    <div class="global-search-status" id="global-search-status">Type to search tools, guides, and posts.</div>
    <div class="global-search-results" id="global-search-results"></div>
  </div>`;
globalSearch.querySelector('.global-search-kbd').textContent = shortcutLabel();
// Always in the DOM so the companion works everywhere, even where the
// page owns the keyboard shortcut. The hint is dropped there so it does not
// advertise a key that belongs to the app.
if (!globalSearchAvailable()) globalSearch.querySelector('.global-search-kbd').hidden = true;
document.body.append(globalSearch);

const globalInput = globalSearch.querySelector('#global-search-input');
const globalResults = globalSearch.querySelector('#global-search-results');
const globalStatus = globalSearch.querySelector('#global-search-status');
let globalLastFocus = null;
let globalIndex = null;
let globalLoad = null;

const endpoint = (path) => new URL(path, siteRoot).href;
const flatten = (value) => (Array.isArray(value) ? value.flat(Infinity).join(' ') : value || '');

function normalizeGlobalItem(item, kind) {
  if (kind === 'tool') {
    return {
      kind,
      name: item.name,
      desc: [item.description, item.category_name, flatten(item.features), flatten(item.use_cases), flatten(item.examples)].join(' '),
      keywords: item.keywords,
      url: item.url,
    };
  }
  return {
    kind,
    name: item.title,
    desc: [item.description, item.summary].join(' '),
    keywords: item.tags,
    url: item.url,
  };
}

async function loadGlobalIndex() {
  if (globalIndex) return globalIndex;
  if (!globalLoad) {
    globalLoad = Promise.all([
      fetch(endpoint('tools/search-index.json')).then((response) => response.json()),
      fetch(endpoint('guides/search-index.json')).then((response) => response.json()),
      fetch(endpoint('posts/search-index.json')).then((response) => response.json()),
    ]).then(([tools, guides, posts]) => {
      const items = [
        ...tools.map((item) => normalizeGlobalItem(item, 'tool')),
        ...guides.map((item) => normalizeGlobalItem(item, 'guide')),
        ...posts.map((item) => normalizeGlobalItem(item, 'post')),
      ];
      globalIndex = buildIndex(items);
      return globalIndex;
    });
  }
  return globalLoad;
}

function globalKindLabel(kind) {
  return kind === 'tool' ? 'Tool' : kind === 'guide' ? 'Guide' : 'Post';
}

function paintGlobalSearch(results, query) {
  globalResults.replaceChildren();
  if (!query.trim()) {
    globalStatus.textContent = 'Type to search tools, guides, and posts.';
    return;
  }
  if (results.length === 0) {
    globalStatus.textContent = `No result for “${query}”.`;
    return;
  }
  globalStatus.textContent = `${results.length} result${results.length === 1 ? '' : 's'}.`;
  for (const result of results.slice(0, 12)) {
    const item = result.item;
    const link = document.createElement('a');
    link.className = 'global-search-result';
    link.href = item.url;
    link.innerHTML = `<span class="global-search-kind"></span><strong></strong><span></span>`;
    link.querySelector('.global-search-kind').textContent = globalKindLabel(item.kind);
    link.querySelector('strong').textContent = item.name;
    link.querySelector('span:last-child').textContent = item.desc || '';
    globalResults.append(link);
  }
}

async function updateGlobalSearch() {
  const query = globalInput.value;
  if (!query.trim()) {
    paintGlobalSearch([], query);
    return;
  }
  globalStatus.textContent = 'Searching…';
  try {
    const index = await loadGlobalIndex();
    paintGlobalSearch(runSearch(query, index), query);
  } catch {
    globalStatus.textContent = 'Search index could not be loaded.';
  }
}

function openGlobalSearch() {
  disarm();
  closeHelp();
  globalLastFocus = document.activeElement;
  globalSearch.hidden = false;
  globalInput.focus();
  globalInput.select();
  updateGlobalSearch();
  return true;
}

function closeGlobalSearch() {
  if (globalSearch.hidden) return;
  globalSearch.hidden = true;
  if (globalLastFocus && globalLastFocus.isConnected) globalLastFocus.focus();
}

globalInput.addEventListener('input', updateGlobalSearch);
globalInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeGlobalSearch();
    return;
  }
  if (event.key === 'Enter') {
    const first = globalResults.querySelector('a');
    if (first) {
      event.preventDefault();
      first.click();
    }
  }
});
globalSearch.addEventListener('click', (event) => {
  if (event.target.closest && event.target.closest('[data-global-search-close]')) closeGlobalSearch();
});

let lastFocus = null;

function openHelp() {
  if (!help.hidden) return;
  disarm();
  lastFocus = document.activeElement;
  help.hidden = false;
  help.querySelector('.kbd-help-panel').focus();
}

function closeHelp() {
  if (help.hidden) return;
  help.hidden = true;
  if (lastFocus && lastFocus.isConnected) lastFocus.focus();
}

help.addEventListener('click', (event) => {
  if (event.target.closest && event.target.closest('[data-kbd-close]')) closeHelp();
});

// The button is markup so it can sit in the header, but it only appears once
// there is something behind it.
const helpButton = document.querySelector('#nav-help');
if (helpButton) {
  helpButton.hidden = false;
  helpButton.setAttribute('aria-keyshortcuts', '?');
  helpButton.addEventListener('click', () => (help.hidden ? openHelp() : closeHelp()));
}

// The companion always opens site-wide search, including on tool pages.
initSearchMascot(() => {
  const navToggle = document.querySelector('#nav-toggle');
  if (navToggle) navToggle.checked = false;
  openGlobalSearch();
});

/* ---------------------------------------------------------------- the keys */

let armed = false;
let armTimer = 0;

function disarm() {
  armed = false;
  clearTimeout(armTimer);
  chip.hidden = true;
}

function arm() {
  armed = true;
  chip.hidden = false;
  clearTimeout(armTimer);
  armTimer = setTimeout(disarm, SEQUENCE_TIMEOUT);
}

function focusSearch() {
  if (!localSearch) return false;
  localSearch.focus();
  localSearch.select();
  return true;
}

// `/` and a click on the shortcut row land here. The global
// search opens on its own pages; elsewhere the local field takes focus, and
// without one the row is followed instead, carrying `#search` to the catalog.
function openSearch() {
  if (focusSearch()) return;
  if (openGlobalSearch()) return;
  if (searchEntry && searchEntry.node) searchEntry.node.click();
}

// Duck-typed rather than `instanceof Element`: a page keeps its own realm, and
// only one realm's Element is reachable at a time.
const isTyping = (node) =>
  Boolean(node) && (node.isContentEditable === true || /^(input|textarea|select)$/i.test(node.tagName || ''));

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.repeat) return;

  if (event.metaKey || event.ctrlKey) {
    // Pages with their own search field bind this themselves, so only take it
    // where there is nothing to focus.
    if (!event.altKey && event.key.toLowerCase() === 'k') {
      if (globalSearchAvailable()) {
        event.preventDefault();
        openGlobalSearch();
      } else if (!localSearch && searchEntry) {
        event.preventDefault();
        openSearch();
      }
    }
    return;
  }
  if (event.altKey) return;

  if (event.key === 'Escape') {
    disarm();
    if (!globalSearch.hidden) {
      closeGlobalSearch();
      event.preventDefault();
    } else if (!help.hidden) {
      closeHelp();
      event.preventDefault();
    }
    return;
  }

  if (event.key === '?') {
    if (!help.hidden) {
      closeHelp();
    } else if (isTyping(document.activeElement)) {
      return; // a literal question mark in a field
    } else {
      openHelp();
    }
    event.preventDefault();
    return;
  }

  // The open list owns the keyboard, and a focused field owns its letters.
  if (!help.hidden || !globalSearch.hidden || isTyping(document.activeElement)) return;

  if (event.key === '/' && (searchEntry || globalSearchAvailable())) {
    event.preventDefault();
    openSearch();
    return;
  }

  if (armed) {
    const key = event.key.toLowerCase();
    disarm();
    const next = entries.find((entry) => entry.keys.length === 2 && entry.keys[0] === 'g' && entry.keys[1] === key);
    if (next) {
      event.preventDefault();
      next.node.click();
    }
    return;
  }

  if (event.key.toLowerCase() === 'g') {
    arm();
    return;
  }

  const direct = entries.find((entry) => entry.keys.length === 1 && entry.keys[0] === event.key);
  if (direct) {
    event.preventDefault();
    direct.node.click();
  }
});

// Leaving the page with the list open would restore it that way on the way back.
window.addEventListener('pagehide', () => {
  disarm();
  help.hidden = true;
});
