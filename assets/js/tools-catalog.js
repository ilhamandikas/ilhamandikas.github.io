// Client-side filter for the /tools/ catalog. No dependencies.
const input = document.querySelector('#tools-search');
const groups = Array.from(document.querySelectorAll('[data-tools-group]'));
const cards = Array.from(document.querySelectorAll('[data-tool-card]'));
const empty = document.querySelector('#tools-empty');

if (input) {
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = card.getAttribute('data-search') || '';
      const match = q === '' || haystack.includes(q);
      card.hidden = !match;
      if (match) visible += 1;
    });

    groups.forEach((group) => {
      const any = group.querySelector('[data-tool-card]:not([hidden])');
      group.hidden = !any;
    });

    if (empty) empty.hidden = visible !== 0;
  };

  // The hint has to name the key people actually have on their keyboard.
  const kbd = document.querySelector('#tools-search-kbd');
  if (kbd) {
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
    kbd.textContent = /mac|iphone|ipad|ipod/i.test(platform) ? '⌘K' : 'Ctrl K';
  }

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input.focus();
      input.select();
      return;
    }
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
