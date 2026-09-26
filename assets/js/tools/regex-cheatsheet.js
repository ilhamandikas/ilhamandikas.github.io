// Regular expression reference with a live filter.
const { tk } = window;

const GROUPS = [
  {
    title: 'Character classes',
    items: [
      { cmd: '.', desc: 'Any character except a line break' },
      { cmd: '\\d', desc: 'Digit — equivalent to [0-9]' },
      { cmd: '\\w', desc: 'Word character — [A-Za-z0-9_]' },
      { cmd: '\\s', desc: 'Whitespace — spaces, tabs, newlines' },
      { cmd: '[abc]', desc: 'Any one of a, b or c' },
      { cmd: '[^abc]', desc: 'Any character except a, b or c' },
      { cmd: '[a-z]', desc: 'A character in the range a–z' },
    ],
  },
  {
    title: 'Anchors & boundaries',
    items: [
      { cmd: '^', desc: 'Start of string (or line with the m flag)' },
      { cmd: '$', desc: 'End of string (or line with the m flag)' },
      { cmd: '\\b', desc: 'Word boundary' },
      { cmd: '\\B', desc: 'Not a word boundary' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { cmd: '*', desc: 'Zero or more' },
      { cmd: '+', desc: 'One or more' },
      { cmd: '?', desc: 'Zero or one' },
      { cmd: '{3}', desc: 'Exactly three' },
      { cmd: '{2,5}', desc: 'Between two and five' },
      { cmd: '{2,}', desc: 'Two or more' },
      { cmd: '*?', desc: 'Lazy — match as little as possible' },
    ],
  },
  {
    title: 'Groups & references',
    items: [
      { cmd: '(abc)', desc: 'Capturing group' },
      { cmd: '(?:abc)', desc: 'Non-capturing group' },
      { cmd: '(?<name>abc)', desc: 'Named capturing group' },
      { cmd: '\\1', desc: 'Backreference to group 1' },
      { cmd: 'a|b', desc: 'Alternation — a or b' },
    ],
  },
  {
    title: 'Lookaround',
    items: [
      { cmd: '(?=abc)', desc: 'Positive lookahead' },
      { cmd: '(?!abc)', desc: 'Negative lookahead' },
      { cmd: '(?<=abc)', desc: 'Positive lookbehind' },
      { cmd: '(?<!abc)', desc: 'Negative lookbehind' },
    ],
  },
  {
    title: 'Flags',
    items: [
      { cmd: 'g', desc: 'Global — find every match' },
      { cmd: 'i', desc: 'Case-insensitive' },
      { cmd: 'm', desc: 'Multiline — ^ and $ match line breaks' },
      { cmd: 's', desc: 'Dotall — . matches newlines too' },
      { cmd: 'u', desc: 'Unicode mode' },
      { cmd: 'y', desc: 'Sticky — match from lastIndex only' },
    ],
  },
  {
    title: 'Everyday patterns',
    items: [
      { cmd: '^\\S+@\\S+\\.\\S+$', desc: 'Rough email check' },
      { cmd: '^https?://', desc: 'HTTP or HTTPS URL' },
      { cmd: '\\b\\d{4}-\\d{2}-\\d{2}\\b', desc: 'ISO date (YYYY-MM-DD)' },
      { cmd: '^(?=.*[A-Z])(?=.*\\d).{8,}$', desc: 'Password with an uppercase letter and a digit' },
    ],
  },
];

const search = document.querySelector('#re-search');
const list = document.querySelector('#re-list');
const status = document.querySelector('#re-status');

const escapeHtml = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function render() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  const sections = GROUPS.map((group) => {
    const items = group.items.filter((item) => `${item.cmd} ${item.desc}`.toLowerCase().includes(query));
    count += items.length;
    if (items.length === 0) return null;
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    section.appendChild(heading);
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'tool-cheat-item';
      row.innerHTML = `<code>${escapeHtml(item.cmd)}</code><span>${escapeHtml(item.desc)}</span>`;
      section.appendChild(row);
    });
    return section;
  }).filter(Boolean);

  list.replaceChildren(...sections);
  tk.setStatus(status, `${count} token${count === 1 ? '' : 's'}`);
}

tk.live(search, render);
