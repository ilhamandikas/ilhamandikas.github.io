// Client-side search for the /tools/ catalog, backed by tools-search.js.
import { bindFocusShortcut, buildIndex, search, shortcutLabel } from './tools-search.js';

const input = document.querySelector('#tools-search');
const catalog = document.querySelector('#tools-catalog');
const groups = Array.from(document.querySelectorAll('[data-tools-group]'));
const cards = Array.from(document.querySelectorAll('[data-tool-card]'));
const empty = document.querySelector('#tools-empty');
const fuzzyNote = document.querySelector('#tools-fuzzy');

if (input && catalog) {
  const groupCards = new Map(
    groups.map((group) => [group, Array.from(group.querySelectorAll('[data-tool-card]'))]),
  );

  // The name and description are read back out of the markup instead of being
  // duplicated into data attributes.
  const index = buildIndex(
    cards.map((card) => ({
      card,
      name: card.querySelector('.tool-card-name').textContent,
      desc: card.querySelector('.tool-card-desc').textContent,
      keywords: card.dataset.keywords || '',
    })),
  );

  const reset = () => {
    cards.forEach((card) => {
      card.hidden = false;
      card.style.order = '';
    });
    groups.forEach((group) => {
      group.hidden = false;
      group.style.order = '';
    });
    if (empty) empty.hidden = true;
    if (fuzzyNote) fuzzyNote.hidden = true;
  };

  const apply = () => {
    if (input.value.trim() === '') {
      reset();
      return;
    }

    const results = search(input.value, index);
    const scores = new Map(results.map((result) => [result.item.card, result.score]));

    // Rank rather than only filter, otherwise a fuzzy search returns more
    // results in an arbitrary order. This uses CSS `order` instead of moving
    // nodes so the DOM stays stable.
    cards.forEach((card) => {
      const score = scores.get(card);
      card.hidden = score === undefined;
      card.style.order = score === undefined ? '' : String(-score);
    });

    groups.forEach((group) => {
      const shown = groupCards.get(group).filter((card) => scores.has(card));
      group.hidden = shown.length === 0;
      group.style.order = shown.length === 0 ? '' : String(-Math.max(...shown.map((card) => scores.get(card))));
    });

    if (empty) empty.hidden = results.length !== 0;
    if (fuzzyNote) fuzzyNote.hidden = !(results.length > 0 && results[0].fuzzy);
  };

  const kbd = document.querySelector('#tools-search-kbd');
  if (kbd) kbd.textContent = shortcutLabel();
  bindFocusShortcut(input);

  // The site-wide `/` and `g s` shortcuts arrive with `#search`, which is the
  // only way to land on this page with the box already focused.
  if (location.hash === '#search') input.focus();

  document.addEventListener('keydown', (event) => {
    // Escape clears the query first, then hands focus back to the page.
    if (event.key === 'Escape' && document.activeElement === input) {
      if (input.value === '') {
        input.blur();
      } else {
        input.value = '';
        apply();
      }
    }
  });

  input.addEventListener('input', apply);
  apply();
}
