// Case converter — one input, many renderings. Rows are built from the same
// word list, so adding a new case is a single entry in `cases`.
const { tk } = window;

const input = document.querySelector('#case-input');
const results = document.querySelector('#case-results');

const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

function words(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-./]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const cases = {
  camelCase: (w) => w.map((word, i) => (i === 0 ? word.toLowerCase() : cap(word))).join(''),
  PascalCase: (w) => w.map(cap).join(''),
  snake_case: (w) => w.map((x) => x.toLowerCase()).join('_'),
  'kebab-case': (w) => w.map((x) => x.toLowerCase()).join('-'),
  CONSTANT_CASE: (w) => w.map((x) => x.toUpperCase()).join('_'),
  'dot.case': (w) => w.map((x) => x.toLowerCase()).join('.'),
  'Title Case': (w) => w.map(cap).join(' '),
  'Sentence case': (w) => (w.length ? cap(w[0]) + ' ' + w.slice(1).map((x) => x.toLowerCase()).join(' ') : ''),
  lowercase: (w) => w.join(' ').toLowerCase(),
  UPPERCASE: (w) => w.join(' ').toUpperCase(),
};

function render() {
  const w = words(input.value);
  results.replaceChildren(
    ...Object.entries(cases).map(([name, fn], index) => {
      const value = w.length ? fn(w) : '';
      const row = document.createElement('div');
      row.className = 'tool-row tool-result-row';
      const label = document.createElement('label');
      label.className = 'tool-label';
      label.textContent = name;
      const field = document.createElement('input');
      field.className = 'tool-input';
      field.id = `case-out-${index}`;
      field.readOnly = true;
      field.value = value;
      label.htmlFor = field.id;
      const button = document.createElement('button');
      button.className = 'btn';
      button.type = 'button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', `Copy ${name}`);
      button.addEventListener('click', () => tk.copy(field.value));
      row.append(label, field, button);
      return row;
    }),
  );
}

tk.live(input, render);
