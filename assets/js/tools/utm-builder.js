const { tk } = window;

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];

const urlField = document.querySelector('#utm-url');
const output = document.querySelector('#utm-output');
const status = document.querySelector('#utm-status');
const parseField = document.querySelector('#utm-parse');
const parsed = document.querySelector('#utm-parsed');

const fields = {
  utm_source: document.querySelector('#utm-source'),
  utm_medium: document.querySelector('#utm-medium'),
  utm_campaign: document.querySelector('#utm-campaign'),
  utm_term: document.querySelector('#utm-term'),
  utm_content: document.querySelector('#utm-content'),
  utm_id: document.querySelector('#utm-id'),
};

function normalizeUrl(value) {
  const text = value.trim();
  if (!text) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`;
  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function build() {
  const url = normalizeUrl(urlField.value);
  if (!url) {
    output.value = '';
    tk.setStatus(status, urlField.value.trim() ? 'Enter a valid URL' : '', urlField.value.trim() ? 'err' : '');
    return;
  }
  KEYS.forEach((key) => {
    const value = fields[key].value.trim();
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  output.value = url.toString();
  const count = KEYS.filter((key) => fields[key].value.trim()).length;
  tk.setStatus(status, count ? `${count} parameter${count === 1 ? '' : 's'}` : 'Add at least one UTM field', count ? 'ok' : '');
}

function parse() {
  parsed.replaceChildren();
  const url = normalizeUrl(parseField.value);
  if (!url) return;
  const rows = [];
  KEYS.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value !== null) rows.push([key, value]);
  });
  if (!rows.length) {
    const empty = document.createElement('p');
    empty.className = 'tool-hint';
    empty.textContent = 'No UTM parameters found in that URL.';
    parsed.appendChild(empty);
    return;
  }
  rows.forEach(([key, value]) => {
    const row = document.createElement('div');
    row.className = 'tool-result-row';
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = key;
    dd.textContent = value;
    row.append(dt, dd);
    parsed.appendChild(row);
  });
}

tk.live([urlField, ...Object.values(fields)], build);
parseField.addEventListener('input', tk.debounce(parse, 150));
build();
