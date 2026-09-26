// HTTP status code reference.
const { tk } = window;

const GROUPS = [
  {
    title: '1xx — Informational',
    items: [
      ['100', 'Continue'], ['101', 'Switching Protocols'], ['102', 'Processing'], ['103', 'Early Hints'],
    ],
  },
  {
    title: '2xx — Success',
    items: [
      ['200', 'OK'], ['201', 'Created'], ['202', 'Accepted'], ['203', 'Non-Authoritative Information'],
      ['204', 'No Content'], ['205', 'Reset Content'], ['206', 'Partial Content'], ['207', 'Multi-Status'],
      ['208', 'Already Reported'], ['226', 'IM Used'],
    ],
  },
  {
    title: '3xx — Redirection',
    items: [
      ['300', 'Multiple Choices'], ['301', 'Moved Permanently'], ['302', 'Found'], ['303', 'See Other'],
      ['304', 'Not Modified'], ['305', 'Use Proxy'], ['307', 'Temporary Redirect'], ['308', 'Permanent Redirect'],
    ],
  },
  {
    title: '4xx — Client error',
    items: [
      ['400', 'Bad Request'], ['401', 'Unauthorized'], ['402', 'Payment Required'], ['403', 'Forbidden'],
      ['404', 'Not Found'], ['405', 'Method Not Allowed'], ['406', 'Not Acceptable'],
      ['407', 'Proxy Authentication Required'], ['408', 'Request Timeout'], ['409', 'Conflict'],
      ['410', 'Gone'], ['411', 'Length Required'], ['412', 'Precondition Failed'], ['413', 'Payload Too Large'],
      ['414', 'URI Too Long'], ['415', 'Unsupported Media Type'], ['416', 'Range Not Satisfiable'],
      ['417', 'Expectation Failed'], ['418', "I'm a teapot"], ['421', 'Misdirected Request'],
      ['422', 'Unprocessable Entity'], ['423', 'Locked'], ['424', 'Failed Dependency'], ['425', 'Too Early'],
      ['426', 'Upgrade Required'], ['428', 'Precondition Required'], ['429', 'Too Many Requests'],
      ['431', 'Request Header Fields Too Large'], ['451', 'Unavailable For Legal Reasons'],
    ],
  },
  {
    title: '5xx — Server error',
    items: [
      ['500', 'Internal Server Error'], ['501', 'Not Implemented'], ['502', 'Bad Gateway'],
      ['503', 'Service Unavailable'], ['504', 'Gateway Timeout'], ['505', 'HTTP Version Not Supported'],
      ['506', 'Variant Also Negotiates'], ['507', 'Insufficient Storage'], ['508', 'Loop Detected'],
      ['510', 'Not Extended'], ['511', 'Network Authentication Required'],
    ],
  },
];

const search = document.querySelector('#http-search');
const list = document.querySelector('#http-list');
const status = document.querySelector('#http-status');

const escapeHtml = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function render() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  const sections = GROUPS.map((group) => {
    const items = group.items.filter(([code, name]) => `${code} ${name}`.toLowerCase().includes(query));
    count += items.length;
    if (items.length === 0) return null;
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    section.appendChild(heading);
    items.forEach(([code, name]) => {
      const row = document.createElement('div');
      row.className = 'tool-cheat-item';
      row.innerHTML = `<code>${escapeHtml(code)}</code><span>${escapeHtml(name)}</span>`;
      section.appendChild(row);
    });
    return section;
  }).filter(Boolean);

  list.replaceChildren(...sections);
  tk.setStatus(status, `${count} code${count === 1 ? '' : 's'}`);
}

tk.live(search, render);
