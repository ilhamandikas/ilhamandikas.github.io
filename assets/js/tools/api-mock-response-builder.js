// API mock response builder: describe fields once, get realistic JSON back.
const { tk } = window;

const els = {
  input: document.querySelector('#amr-input'),
  count: document.querySelector('#amr-count'),
  out: document.querySelector('#amr-out'),
  status: document.querySelector('#amr-status'),
  regen: document.querySelector('#amr-regen'),
};

const FIRST = ['Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Iris', 'Kai', 'Nora', 'Leo'];
const LAST = ['Hartono', 'Pratama', 'Santos', 'Reyes', 'Nakamura', 'Khan', 'Silva', 'Novak', 'Okafor', 'Bauer'];
const CITIES = ['Jakarta', 'Bandung', 'Singapore', 'Osaka', 'Berlin', 'Lisbon', 'Toronto', 'Nairobi'];
const COUNTRIES = ['Indonesia', 'Singapore', 'Japan', 'Germany', 'Portugal', 'Canada', 'Kenya'];
const WORDS = ['alpha', 'signal', 'pixel', 'vector', 'matrix', 'beacon', 'cipher', 'kernel', 'orbit', 'delta'];
const PRODUCTS = ['Widget', 'Gadget', 'Sensor', 'Router', 'Adapter', 'Console'];
const DOMAINS = ['example.com', 'mail.test', 'sample.io', 'demo.dev'];
const STREETS = ['Merdeka', 'Sudirman', 'Maple', 'Cedar', 'Harbor'];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const r = Math.floor(Math.random() * 16);
    const v = char === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isoDate(offsetDays) {
  const date = new Date(Date.now() + offsetDays * 86400000);
  return date.toISOString().slice(0, 10);
}

function valueFor(type, index) {
  switch (type) {
    case 'string':
      return `${pick(WORDS)} ${pick(WORDS)}`;
    case 'word':
      return pick(WORDS);
    case 'name':
      return `${pick(FIRST)} ${pick(LAST)}`;
    case 'firstname':
    case 'first_name':
      return pick(FIRST);
    case 'lastname':
    case 'last_name':
      return pick(LAST);
    case 'email':
      return `${pick(FIRST).toLowerCase()}.${pick(LAST).toLowerCase()}@${pick(DOMAINS)}`;
    case 'phone':
      return `+62 8${digits(2)}-${digits(4)}-${digits(4)}`;
    case 'city':
      return pick(CITIES);
    case 'country':
      return pick(COUNTRIES);
    case 'address':
      return `${Math.floor(Math.random() * 200) + 1} ${pick(STREETS)} Street`;
    case 'company':
      return `${pick(LAST)} ${pick(['Labs', 'Works', 'Group', 'Systems'])}`;
    case 'product':
      return `${pick(PRODUCTS)} ${pick(['Pro', 'Mini', 'Max', 'Lite'])}`;
    case 'url':
      return `https://${pick(DOMAINS)}/${pick(WORDS)}/${index + 1}`;
    case 'image':
      return `https://picsum.photos/seed/${pick(WORDS)}${index}/640/360`;
    case 'uuid':
      return uuid();
    case 'id':
      return index + 1;
    case 'number':
    case 'float':
      return Math.round(Math.random() * 1000 * 100) / 100;
    case 'integer':
    case 'int':
      return Math.floor(Math.random() * 1000);
    case 'price':
      return Math.round(Math.random() * 500 * 100) / 100;
    case 'age':
      return Math.floor(Math.random() * 60) + 18;
    case 'boolean':
    case 'bool':
      return Math.random() > 0.5;
    case 'date':
      return isoDate(Math.floor(Math.random() * 365) - 180);
    case 'datetime':
      return new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString();
    case 'timestamp':
      return Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 100000);
    case 'color':
      return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
    default:
      return null;
  }
}

function buildRecord(fields, index) {
  const record = {};
  fields.forEach(([name, type]) => {
    const array = /^array(?:\((\d+)\))?$/.exec(type);
    if (array) {
      const size = array[1] ? Number(array[1]) : 3;
      record[name] = Array.from({ length: size }, () => pick(WORDS));
      return;
    }
    const object = /^object$/.test(type);
    if (object) {
      record[name] = { id: index + 1, label: `${pick(WORDS)} ${pick(WORDS)}` };
      return;
    }
    record[name] = valueFor(type, index);
  });
  return record;
}

function parseFields(text) {
  const fields = [];
  const unknown = [];
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const at = trimmed.indexOf(':');
    const name = (at === -1 ? trimmed : trimmed.slice(0, at)).trim();
    const type = (at === -1 ? 'string' : trimmed.slice(at + 1).trim().toLowerCase()) || 'string';
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      unknown.push(name);
      return;
    }
    if (!/^(string|word|name|firstname|first_name|lastname|last_name|email|phone|city|country|address|company|product|url|image|uuid|id|number|float|integer|int|price|age|boolean|bool|date|datetime|timestamp|color|object|array(\(\d+\))?)$/.test(type)) {
      unknown.push(`${name}: ${type}`);
      return;
    }
    fields.push([name, type]);
  });
  return { fields, unknown };
}

function render() {
  const text = els.input.value;
  if (!text.trim()) {
    els.out.textContent = '';
    tk.setStatus(els.status, '');
    return;
  }
  const { fields, unknown } = parseFields(text);
  if (!fields.length) {
    els.out.textContent = '';
    tk.setStatus(els.status, 'Add at least one field, one per line, as name: type.', 'err');
    return;
  }
  const count = Math.min(50, Math.max(1, Number(els.count.value) || 1));
  const data = Array.from({ length: count }, (_, index) => buildRecord(fields, index));
  els.out.textContent = JSON.stringify({ data }, null, 2);
  if (unknown.length) {
    tk.setStatus(els.status, `Generated, but these lines were skipped: ${unknown.join(', ')}.`, 'err');
  } else {
    tk.setStatus(els.status, `${count} record${count === 1 ? '' : 's'} generated locally.`, 'ok');
  }
}

tk.live([els.input, els.count], render);
if (els.regen) els.regen.addEventListener('click', render);
