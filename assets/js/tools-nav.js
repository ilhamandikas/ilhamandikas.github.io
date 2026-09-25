// Search and keyboard navigation for the tool sidebar, so Cmd+K can jump to
// another tool from anywhere instead of only working on the catalog page.
import { bindFocusShortcut, buildIndex, search, shortcutLabel } from './tools-search.js';

const input = document.querySelector('#tool-nav-search');
const nav = document.querySelector('.tool-nav');

if (input && nav) {
  // The sidebar holds nothing but tool links, so the classes and the anchor tag
  // are the whole selection — no per-link data attributes needed.
  const groups = Array.from(nav.querySelectorAll('.tool-nav-group'));
  const links = Array.from(nav.querySelectorAll('.tool-nav-group a'));
  const rows = new Map(links.map((link) => [link, link.parentElement]));
  const empty = document.querySelector('#tool-nav-empty');
  const kbd = document.querySelector('#tool-nav-kbd');
  const aside = document.querySelector('.tool-aside');

  // Every navigation replaces this whole document, so a query that only lives in
  // this script would vanish and the list would snap back to its full length.
  // Carrying both across in sessionStorage is what lets you keep narrowing a
  // search from one tool to the next instead of retyping it each time.
  const REMEMBER = 'tk:tool-nav';
  const memory = { q: '', top: 0 };
  try {
    const saved = JSON.parse(sessionStorage.getItem(REMEMBER) || 'null');
    if (saved && typeof saved.q === 'string') memory.q = saved.q;
    if (saved && Number.isFinite(saved.top)) memory.top = saved.top;
  } catch {
    /* private mode, or somebody else's junk under our key */
  }

  // The names are already in the page, so the index only costs the keywords —
  // which are the part you cannot read off the link text.
  const index = buildIndex(
    links.map((link) => ({
      link,
      name: link.textContent,
      keywords: link.dataset.keywords || '',
    })),
  );

  let selected = -1;

  // Visual order, not DOM order: rows are ranked with CSS `order`, so the arrow
  // keys have to follow the ranking. With no query every order is 0 and the
  // sort is stable, which leaves the list exactly as written.
  const visible = () =>
    links
      .filter((link) => !link.hidden)
      .sort((a, b) => Number(rows.get(a).style.order) - Number(rows.get(b).style.order));

  const paint = () => {
    const shown = visible();
    links.forEach((link) => link.classList.remove('selected'));
    if (selected < 0 || selected >= shown.length) {
      selected = -1;
      return;
    }
    const link = shown[selected];
    link.classList.add('selected');
    // Instant, not smooth: with smooth scrolling a held arrow key looks like it
    // is lagging behind the selection.
    link.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  };

  const reset = () => {
    nav.removeAttribute('data-searching');
    links.forEach((link) => {
      link.hidden = false;
      rows.get(link).style.order = '';
    });
    groups.forEach((group) => {
      group.hidden = false;
      group.style.order = '';
    });
    if (empty) empty.hidden = true;
    selected = -1;
    paint();
  };

  const apply = () => {
    if (input.value.trim() === '') {
      reset();
      return;
    }

    const results = search(input.value, index);
    const scores = new Map(results.map((result) => [result.item.link, result.score]));

    // The categories are dropped while searching (see the CSS), so the sidebar
    // reads as one flat ranked list. Ranking also makes Enter safe, because the
    // preselected row is then the best match rather than whichever tool happens
    // to come first in the menu.
    nav.setAttribute('data-searching', '');
    links.forEach((link) => {
      const score = scores.get(link);
      link.hidden = score === undefined;
      rows.get(link).style.order = score === undefined ? '' : String(-score);
    });
    groups.forEach((group) => {
      const shown = links.filter((link) => !link.hidden && group.contains(link));
      group.hidden = shown.length === 0;
      group.style.order =
        shown.length === 0 ? '' : String(-Math.max(...shown.map((link) => scores.get(link))));
    });
    if (empty) empty.hidden = results.length !== 0;

    selected = results.length > 0 ? 0 : -1;
    paint();
  };

  input.addEventListener('input', apply);

  input.addEventListener('keydown', (event) => {
    const shown = visible();

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (shown.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      selected = selected < 0 ? 0 : (selected + step + shown.length) % shown.length;
      paint();
      return;
    }

    if (event.key === 'Enter') {
      const link = shown[selected];
      if (!link) return;
      event.preventDefault();
      link.click();
      return;
    }

    if (event.key === 'Escape') {
      if (input.value === '') {
        input.blur();
      } else {
        input.value = '';
        apply();
      }
    }
  });

  if (kbd) kbd.textContent = shortcutLabel();
  bindFocusShortcut(input);

  // Restored before the first paint, so a cross-document view transition
  // snapshots the sidebar as it was left rather than empty and unscrolled.
  if (memory.q !== '') input.value = memory.q;
  apply();
  if (aside && memory.top > 0) aside.scrollTop = memory.top;

  // pagehide, not beforeunload: it fires for the back/forward cache too, where
  // beforeunload never runs.
  window.addEventListener('pagehide', () => {
    memory.q = input.value;
    memory.top = aside ? aside.scrollTop : 0;
    try {
      sessionStorage.setItem(REMEMBER, JSON.stringify(memory));
    } catch {
      /* ignore */
    }
  });
}
