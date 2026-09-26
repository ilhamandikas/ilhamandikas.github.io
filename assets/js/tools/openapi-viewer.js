// Read an OpenAPI or Swagger document and list its operations: method, path,
// parameters, request body and responses. References are resolved inside the
// document, so nothing is fetched and the page works offline.
import { parse as parseYaml } from '../vendor/yaml.js';

const { tk } = window;

const els = {
  input: document.querySelector('#oav-input'),
  format: document.querySelector('#oav-format'),
  file: document.querySelector('#oav-file'),
  load: document.querySelector('#oav-load'),
  status: document.querySelector('#oav-status'),
  summary: document.querySelector('#oav-summary'),
  title: document.querySelector('#oav-title'),
  version: document.querySelector('#oav-version'),
  servers: document.querySelector('#oav-servers'),
  count: document.querySelector('#oav-count'),
  panel: document.querySelector('#oav-ops-panel'),
  filter: document.querySelector('#oav-filter'),
  ops: document.querySelector('#oav-ops'),
};

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace'];
const REF_ROOT = '#/';

let spec = null;
let operations = [];

function parse(text, format) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  if (format === 'json' || (format === 'auto' && looksJson)) return JSON.parse(trimmed);
  return parseYaml(trimmed);
}

// Follow a local JSON pointer such as #/components/schemas/Order. A pointer to
// another file cannot be followed without a network request, so it is reported
// as the reference it is rather than silently dropped.
function resolve(node, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 8 || !node.$ref) return node;
  const pointer = node.$ref;
  if (!pointer.startsWith(REF_ROOT)) return { type: 'external', description: pointer };
  const target = pointer
    .slice(REF_ROOT.length)
    .split('/')
    .reduce((acc, key) => (acc == null ? acc : acc[key.replace(/~1/g, '/').replace(/~0/g, '~')]), spec);
  return target == null ? { type: 'external', description: pointer } : resolve(target, depth + 1);
}

function describe(schema, depth = 0) {
  const node = resolve(schema);
  if (!node || typeof node !== 'object') return 'any';
  if (Array.isArray(node.enum)) return `enum(${node.enum.join(' | ')})`;
  const variants = node.oneOf || node.anyOf;
  if (Array.isArray(variants)) return variants.map((part) => describe(part, depth + 1)).join(' | ');
  if (Array.isArray(node.allOf)) return node.allOf.map((part) => describe(part, depth + 1)).join(' & ');

  const type = Array.isArray(node.type) ? node.type.join(' | ') : node.type || (node.properties ? 'object' : node.items ? 'array' : 'any');
  if (type === 'array') return `array of ${describe(node.items, depth + 1)}`;
  if (type === 'object' || node.properties) {
    if (!node.properties || depth >= 2) return 'object';
    const fields = Object.entries(node.properties).map(([name, value]) => {
      const required = Array.isArray(node.required) && node.required.includes(name);
      return `${name}${required ? '' : '?'}: ${describe(value, depth + 1)}`;
    });
    return `{ ${fields.join(', ')} }`;
  }
  return node.format ? `${type}(${node.format})` : type;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function table(headers, rows) {
  if (!rows.length) return null;
  const wrap = el('div', 'tool-table-wrap');
  const table_ = el('table', 'tool-table');
  const head = el('thead');
  const headRow = el('tr');
  headers.forEach((label) => headRow.append(el('th', null, label)));
  head.append(headRow);
  const body = el('tbody');
  rows.forEach((cells) => {
    const row = el('tr');
    cells.forEach((cell) => row.append(el('td', null, cell == null || cell === '' ? '—' : String(cell))));
    body.append(row);
  });
  table_.append(head, body);
  wrap.append(table_);
  return wrap;
}

function section(title) {
  return el('p', 'oav-section', title);
}

// A default can sit on the parameter or on its schema, so both are checked.
function defaultNote(parameter) {
  const value = parameter.default !== undefined ? parameter.default : parameter.schema && parameter.schema.default;
  return value === undefined ? '' : `default ${value}`;
}

function parameterRows(parameters) {
  return (parameters || []).map((raw) => {
    const parameter = resolve(raw);
    return [
      parameter.name,
      parameter.in,
      parameter.required ? 'yes' : 'no',
      describe(parameter.schema || parameter),
      parameter.description || defaultNote(parameter),
    ];
  });
}

function responseRows(responses) {
  return Object.entries(responses || {}).map(([code, raw]) => {
    const response = resolve(raw);
    const bodies = Object.entries(response.content || {})
      .map(([media, mediaType]) => `${media}: ${describe(mediaType.schema)}`)
      .join(' · ');
    return [code, response.description || '', bodies || (response.schema ? describe(response.schema) : '')];
  });
}

function requestBodyCard(body) {
  const node = resolve(body);
  if (!node || !node.content) return null;
  const lines = Object.entries(node.content).map(([media, mediaType]) => `${media}: ${describe(mediaType.schema)}`);
  const pre = el('pre', 'tool-result', `${node.required ? 'required · ' : ''}${lines.join('\n')}`);
  return pre;
}

function operationCard(entry) {
  const card = el('article', 'oav-op');
  const head = el('div', 'oav-op-head');
  head.append(el('span', 'oav-method', entry.method.toUpperCase()), el('code', 'oav-path', entry.path));
  if (entry.summary) head.append(el('span', 'oav-op-summary', entry.summary));
  card.append(head);
  if (entry.tags.length) card.append(el('p', 'oav-tags', `Tags: ${entry.tags.join(', ')}`));

  const parameters = table(['Name', 'In', 'Required', 'Type', 'Notes'], parameterRows(entry.parameters));
  if (parameters) {
    card.append(section('Parameters'), parameters);
  }
  const bodyCard = entry.requestBody ? requestBodyCard(entry.requestBody) : null;
  if (bodyCard) card.append(section('Request body'), bodyCard);
  const responses = table(['Status', 'Description', 'Body'], responseRows(entry.responses));
  if (responses) card.append(section('Responses'), responses);
  return card;
}

function renderOperations() {
  const needle = els.filter.value.trim().toLowerCase();
  const shown = needle
    ? operations.filter((entry) => `${entry.method} ${entry.path} ${entry.summary} ${entry.tags.join(' ')}`.toLowerCase().includes(needle))
    : operations;

  if (!shown.length) {
    els.ops.replaceChildren(el('p', 'tool-hint', operations.length ? 'No operation matches that filter.' : 'This document declares no operations.'));
    tk.setStatus(els.status, operations.length ? `No operation matches "${needle}".` : 'The document loads but declares no operations.');
    return;
  }

  els.ops.replaceChildren(...shown.map(operationCard));
  const suffix = needle && shown.length !== operations.length ? `, ${shown.length} shown` : '';
  tk.setStatus(els.status, `Read — ${operations.length} operation${operations.length === 1 ? '' : 's'}${suffix}.`, 'ok');
}

function read() {
  const text = els.input.value;
  if (!text.trim()) {
    spec = null;
    operations = [];
    els.summary.hidden = true;
    els.panel.hidden = true;
    tk.setStatus(els.status, 'Paste a specification or choose a file.');
    return;
  }

  let doc;
  try {
    doc = parse(text, els.format.value);
  } catch (error) {
    spec = null;
    operations = [];
    els.summary.hidden = true;
    els.panel.hidden = true;
    tk.setStatus(els.status, `Could not parse the document: ${String((error && error.message) || error).split('\n')[0]}`, 'err');
    return;
  }

  if (!doc || typeof doc !== 'object' || !doc.paths) {
    spec = null;
    operations = [];
    els.summary.hidden = true;
    els.panel.hidden = true;
    tk.setStatus(els.status, 'That document has no paths, so it is not an OpenAPI or Swagger specification.', 'err');
    return;
  }

  spec = doc;
  const info = doc.info || {};
  const servers = Array.isArray(doc.servers) && doc.servers.length
    ? doc.servers.map((server) => server.url).join(', ')
    : doc.host
      ? `${(doc.schemes || ['https'])[0]}://${doc.host}${doc.basePath || ''}`
      : '';

  operations = Object.entries(doc.paths).flatMap(([path, item]) => {
    const shared = (item && item.parameters) || [];
    return METHODS.filter((method) => item && item[method]).map((method) => {
      const operation = item[method];
      const body = operation.requestBody || (operation.parameters || []).find((parameter) => parameter.in === 'body');
      return {
        path,
        method,
        summary: operation.summary || operation.description || '',
        tags: Array.isArray(operation.tags) ? operation.tags : [],
        parameters: [...shared, ...(operation.parameters || [])].filter((parameter) => parameter.in !== 'body'),
        requestBody: body && body.in === 'body' ? { content: { 'application/json': { schema: body.schema } }, required: body.required } : body,
        responses: operation.responses,
      };
    });
  });

  els.title.textContent = info.title || '—';
  els.version.textContent = [doc.openapi ? `OpenAPI ${doc.openapi}` : doc.swagger ? `Swagger ${doc.swagger}` : '', info.version].filter(Boolean).join(' · ') || '—';
  els.servers.textContent = servers || '—';
  els.count.textContent = String(operations.length);
  els.summary.hidden = false;
  els.panel.hidden = false;
  renderOperations();
}

async function onFile() {
  const file = els.file.files && els.file.files[0];
  if (!file) return;
  const name = file.name || '';
  if (/\.json$/i.test(name)) els.format.value = 'json';
  else if (/\.ya?ml$/i.test(name)) els.format.value = 'yaml';
  els.input.value = await file.text();
  read();
}

els.file.addEventListener('change', onFile);
els.load.addEventListener('click', read);
els.filter.addEventListener('input', () => {
  if (operations.length) renderOperations();
});
tk.live([els.input, els.format], read, 250);
