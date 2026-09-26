// Common MIME types by file extension.
const { tk } = window;

const TYPES = [
  ['txt', 'text/plain'], ['html', 'text/html'], ['htm', 'text/html'], ['css', 'text/css'],
  ['csv', 'text/csv'], ['xml', 'text/xml'], ['md', 'text/markdown'], ['ics', 'text/calendar'],
  ['js', 'text/javascript'], ['mjs', 'text/javascript'], ['json', 'application/json'],
  ['jsonld', 'application/ld+json'], ['pdf', 'application/pdf'], ['zip', 'application/zip'],
  ['gz', 'application/gzip'], ['tar', 'application/x-tar'], ['7z', 'application/x-7z-compressed'],
  ['rar', 'application/vnd.rar'], ['doc', 'application/msword'],
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['xls', 'application/vnd.ms-excel'],
  ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['ppt', 'application/vnd.ms-powerpoint'],
  ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ['odt', 'application/vnd.oasis.opendocument.text'], ['rtf', 'application/rtf'],
  ['wasm', 'application/wasm'], ['bin', 'application/octet-stream'],
  ['epub', 'application/epub+zip'], ['apk', 'application/vnd.android.package-archive'],
  ['png', 'image/png'], ['jpg', 'image/jpeg'], ['jpeg', 'image/jpeg'], ['gif', 'image/gif'],
  ['webp', 'image/webp'], ['avif', 'image/avif'], ['svg', 'image/svg+xml'], ['ico', 'image/x-icon'],
  ['bmp', 'image/bmp'], ['tiff', 'image/tiff'], ['heic', 'image/heic'],
  ['mp3', 'audio/mpeg'], ['wav', 'audio/wav'], ['ogg', 'audio/ogg'], ['oga', 'audio/ogg'],
  ['m4a', 'audio/mp4'], ['aac', 'audio/aac'], ['flac', 'audio/flac'], ['opus', 'audio/opus'],
  ['mp4', 'video/mp4'], ['m4v', 'video/mp4'], ['webm', 'video/webm'], ['ogv', 'video/ogg'],
  ['avi', 'video/x-msvideo'], ['mov', 'video/quicktime'], ['mkv', 'video/x-matroska'],
  ['ts', 'video/mp2t'], ['woff', 'font/woff'], ['woff2', 'font/woff2'], ['ttf', 'font/ttf'],
  ['otf', 'font/otf'], ['eot', 'application/vnd.ms-fontobject'],
];

const search = document.querySelector('#mime-search');
const list = document.querySelector('#mime-list');
const status = document.querySelector('#mime-status');

const escapeHtml = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function render() {
  const query = search.value.trim().toLowerCase();
  const items = TYPES.filter(([ext, type]) => `${ext} ${type}`.toLowerCase().includes(query));
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = 'Extension → MIME type';
  section.appendChild(heading);
  items.forEach(([ext, type]) => {
    const row = document.createElement('div');
    row.className = 'tool-cheat-item';
    row.innerHTML = `<code>.${escapeHtml(ext)}</code><span>${escapeHtml(type)}</span>`;
    section.appendChild(row);
  });
  list.replaceChildren(section);
  tk.setStatus(status, `${items.length} type${items.length === 1 ? '' : 's'}`);
}

tk.live(search, render);
