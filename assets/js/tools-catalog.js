// Client-side search for the /tools/ catalog, backed by tools-search.js.
import { bindFocusShortcut, buildIndex, search, shortcutLabel } from './tools-search.js';
import { createDomOrder } from './dom-order.js';

const input = document.querySelector('#tools-search');
const catalog = document.querySelector('#tools-catalog');
const groups = Array.from(document.querySelectorAll('[data-tools-group]'));
const cards = Array.from(document.querySelectorAll('[data-tool-card]'));
const empty = document.querySelector('#tools-empty');
const fuzzyNote = document.querySelector('#tools-fuzzy');

if (input && catalog) {
  const groupCards = new Map(groups.map((group) => [group, Array.from(group.querySelectorAll('[data-tool-card]'))]));
  let cardOrder;
  let groupOrder;
  const index = buildIndex(cards.map((card) => ({
    card,
    name: card.querySelector('.tool-card-name').textContent,
    desc: card.querySelector('.tool-card-desc').textContent,
    keywords: card.dataset.keywords || '',
  })));

  const reset = () => {
    cards.forEach((card) => { card.hidden = false; });
    groups.forEach((group) => { group.hidden = false; });
    cardOrder?.restore();
    groupOrder?.restore();
    if (empty) empty.hidden = true;
    if (fuzzyNote) fuzzyNote.hidden = true;
  };
  const apply = () => {
    if (input.value.trim() === '') { reset(); return; }
    cardOrder ??= createDomOrder(cards);
    groupOrder ??= createDomOrder(groups);
    const results = search(input.value, index);
    const scores = new Map(results.map((result) => [result.item.card, result.score]));
    cards.forEach((card) => { card.hidden = !scores.has(card); });
    cardOrder.set(results.map((result) => result.item.card));
    const groupScores = new Map();
    groups.forEach((group) => {
      const shown = groupCards.get(group).filter((card) => scores.has(card));
      group.hidden = shown.length === 0;
      if (shown.length) groupScores.set(group, Math.max(...shown.map((card) => scores.get(card))));
    });
    groupOrder.set(groups.filter((group) => !group.hidden).sort((a, b) => groupScores.get(b) - groupScores.get(a)));
    if (empty) empty.hidden = results.length !== 0;
    if (fuzzyNote) fuzzyNote.hidden = !(results.length > 0 && results[0].fuzzy);
  };

  const kbd = document.querySelector('#tools-search-kbd');
  if (kbd) kbd.textContent = shortcutLabel();
  bindFocusShortcut(input);
  if (location.hash === '#search') input.focus();
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.activeElement === input) {
      if (input.value === '') input.blur();
      else { input.value = ''; apply(); }
    }
  });
  input.addEventListener('input', apply);
  apply();
}
