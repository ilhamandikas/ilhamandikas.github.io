// Hash text — the same primitives the file hash checker uses, over a string.
import { SHA, md5, sha } from '../hash.js';

const { tk } = window;

const input = document.querySelector('#hash-input');
const results = document.querySelector('#hash-results');
const upper = document.querySelector('#hash-upper');
const opts = {
  md5: document.querySelector('#hash-md5'),
  sha1: document.querySelector('#hash-sha1'),
  sha256: document.querySelector('#hash-sha256'),
  sha512: document.querySelector('#hash-sha512'),
};

function row(label, value) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-field';
  const id = `hash-out-${label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const tag = document.createElement('label');
  tag.setAttribute('for', id);
  tag.textContent = label;
  const field = document.createElement('textarea');
  field.id = id;
  field.className = 'tool-input';
  field.rows = 2;
  field.readOnly = true;
  field.spellcheck = false;
  field.value = value;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.style.marginTop = '8px';
  btn.textContent = 'Copy';
  btn.addEventListener('click', () => tk.copy(value));
  wrap.append(tag, field, btn);
  return wrap;
}

async function render() {
  const bytes = new TextEncoder().encode(input.value);
  const jobs = [];
  if (opts.md5.checked) jobs.push(['MD5', Promise.resolve(md5(bytes))]);
  if (opts.sha1.checked) jobs.push(['SHA-1', sha(SHA.sha1, bytes)]);
  if (opts.sha256.checked) jobs.push(['SHA-256', sha(SHA.sha256, bytes)]);
  if (opts.sha512.checked) jobs.push(['SHA-512', sha(SHA.sha512, bytes)]);

  const settled = await Promise.all(jobs.map(async ([label, promise]) => [label, await promise]));

  results.replaceChildren();
  settled.forEach(([label, value]) => {
    results.appendChild(row(label, upper.checked ? value.toUpperCase() : value));
  });
}

const debounced = tk.debounce(render, 120);
input.addEventListener('input', debounced);
Object.values(opts).forEach((el) => el.addEventListener('change', render));
upper.addEventListener('change', render);

render();
