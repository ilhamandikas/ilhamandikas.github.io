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
import { shortcutLabel } from './tools-search.js';

const SEQUENCE_TIMEOUT = 1600;
const NAV_KEYS = { Home: 'h', Posts: 'p', Tools: 't', 'Dev Ops': 'd', Games: 'g', Playground: 'j', About: 'a', Contact: 'c' };

const nav = document.querySelector('#site-nav');
const toolsLink = nav && [...nav.querySelectorAll('a')].find((link) => link.textContent.trim() === 'Tools');
const feed = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
const localSearch = document.querySelector('#tools-search') || document.querySelector('#tool-nav-search');
const searchHref = toolsLink ? `${toolsLink.getAttribute('href')}#search` : null;

const entries = [{ keys: ['?'], label: 'Open or close this list', toggle: true }];

if (searchHref || localSearch) {
  entries.push({ keys: ['/'], label: 'Search the tools', href: searchHref, search: true });
}

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
    <p class="kbd-help-note"><kbd class="kbd-help-mod"></kbd> focuses the search box too. Shortcuts are ignored while you are typing.</p>
  </div>`;

help.querySelector('.kbd-help-mod').textContent = shortcutLabel();

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

// `/`, the header button and a click on the row all land here. Without a field
// on this page the row is followed instead, which carries `#search` to the
// catalog and lets it focus the box on arrival.
function openSearch() {
  if (focusSearch()) return;
  const row = entries.find((entry) => entry.search);
  if (row && row.node) row.node.click();
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
    if (!event.altKey && event.key.toLowerCase() === 'k' && !localSearch) {
      event.preventDefault();
      openSearch();
    }
    return;
  }
  if (event.altKey) return;

  if (event.key === 'Escape') {
    disarm();
    if (!help.hidden) {
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
  if (!help.hidden || isTyping(document.activeElement)) return;

  if (event.key === '/') {
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
