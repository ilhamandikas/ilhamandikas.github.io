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

  input.addEventListener('input', apply);
  apply();
}
