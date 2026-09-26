// Open Graph debugger: pull the social tags out of a pasted page and preview them.
const { tk } = window;

const els = {
  input: document.querySelector('#ogd-input'),
  preview: document.querySelector('#ogd-preview'),
  out: document.querySelector('#ogd-out'),
  status: document.querySelector('#ogd-status'),
};

function render() {
  const html = els.input.value;
  els.preview.replaceChildren();
  els.out.replaceChildren();
  if (!html.trim()) {
    tk.setStatus(els.status, '');
    return;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tags = [];
  doc.querySelectorAll('meta').forEach((meta) => {
    const key = meta.getAttribute('property') || meta.getAttribute('name') || meta.getAttribute('itemprop');
    const content = meta.getAttribute('content');
    if (key && content) tags.push([key, content]);
  });
  const map = new Map(tags);
  const get = (...keys) => {
    for (const key of keys) if (map.has(key)) return map.get(key);
    return '';
  };
  const titleEl = doc.querySelector('title');
  const canonical = doc.querySelector('link[rel="canonical"]');

  const title = get('og:title', 'twitter:title') || (titleEl ? titleEl.textContent.trim() : '');
  const description = get('og:description', 'twitter:description') || get('description');
  const image = get('og:image', 'og:image:url', 'twitter:image', 'twitter:image:src');
  const site = get('og:site_name');
  const url = get('og:url') || (canonical ? canonical.getAttribute('href') : '');

  if (!title && !description && !image) {
    tk.setStatus(els.status, 'No Open Graph or Twitter Card tags found in that HTML.', 'err');
    return;
  }

  const card = document.createElement('div');
  card.className = 'ogd-card';
  if (image) {
    const img = document.createElement('div');
    img.className = 'ogd-card-image';
    img.textContent = image;
    card.appendChild(img);
  }
  const body = document.createElement('div');
  body.className = 'ogd-card-body';
  const host = document.createElement('span');
  host.className = 'ogd-card-host';
  host.textContent = site || (url ? url.replace(/^https?:\/\//, '').split('/')[0] : '');
  const h = document.createElement('strong');
  h.textContent = title || '(no title)';
  const p = document.createElement('p');
  p.textContent = description || '(no description)';
  body.append(host, h, p);
  card.appendChild(body);
  els.preview.appendChild(card);

  const table = document.createElement('table');
  table.className = 'tool-table';
  table.innerHTML = '<thead><tr><th>Tag</th><th>Content</th></tr></thead>';
  const tbody = document.createElement('tbody');
  tags.forEach(([key, value]) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = key;
    const td = document.createElement('td');
    td.textContent = value;
    tr.append(th, td);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  els.out.appendChild(table);
  tk.setStatus(els.status, `${tags.length} meta tag${tags.length === 1 ? '' : 's'} found locally.`, 'ok');
}

tk.live(els.input, render);
