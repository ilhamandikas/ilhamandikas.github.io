// JSON Schema validator: a compact draft-07 subset, checked in the page.
const { tk } = window;

const els = {
  schema: document.querySelector('#jsv-schema'),
  doc: document.querySelector('#jsv-doc'),
  status: document.querySelector('#jsv-status'),
  summary: document.querySelector('#jsv-summary'),
  errors: document.querySelector('#jsv-errors'),
  example: document.querySelector('#jsv-example'),
  clear: document.querySelector('#jsv-clear'),
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const typeOf = (value) => (Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value);

function matchesType(value, type) {
  switch (type) {
    case 'null': return value === null;
    case 'boolean': return typeof value === 'boolean';
    case 'object': return isObject(value);
    case 'array': return Array.isArray(value);
    case 'number': return typeof value === 'number';
    case 'integer': return Number.isInteger(value);
    case 'string': return typeof value === 'string';
    default: return true;
  }
}

const FORMATS = {
  date: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
  'date-time': (value) => !Number.isNaN(Date.parse(value)),
  time: (value) => /^\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(value),
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  hostname: (value) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(value),
  ipv4: (value) => /^(\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split('.').every((part) => Number(part) <= 255),
  ipv6: (value) => /^[0-9a-f:]+$/i.test(value) && value.includes(':'),
  uri: (value) => { try { new URL(value); return true; } catch { return false; } },
  uuid: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
};

function resolveRef(root, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#')) return null;
  let node = root;
  for (const raw of ref.slice(1).split('/').filter(Boolean)) {
    const key = raw.replace(/~1/g, '/').replace(/~0/g, '~');
    if (node === undefined || node === null) return null;
    node = node[key];
  }
  return node === undefined ? null : node;
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Collects every problem instead of stopping at the first, so a document can be
// fixed in one pass. Paths are JSON Pointers so they line up with $ref targets.
function validate(schema, data, root, path, errors, seen) {
  if (!isObject(schema) && typeof schema !== 'boolean') return;
  if (schema === true) return;
  if (schema === false) {
    errors.push({ path, message: 'no value is allowed here (false schema)' });
    return;
  }
  if (schema.$ref) {
    const key = `${schema.$ref}@${path}`;
    if (seen.has(key)) return;
    seen.add(key);
    const target = resolveRef(root, schema.$ref);
    if (target === null) errors.push({ path, message: `unresolved $ref ${schema.$ref}` });
    else validate(target, data, root, path, errors, seen);
    return;
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(data, type))) {
      errors.push({ path, message: `expected ${types.join(' or ')}, got ${typeOf(data)}` });
    }
  }

  if (schema.enum && !schema.enum.some((option) => deepEqual(option, data))) {
    errors.push({ path, message: `must be one of ${schema.enum.map((v) => JSON.stringify(v)).join(', ')}` });
  }
  if (schema.const !== undefined && !deepEqual(schema.const, data)) {
    errors.push({ path, message: `must equal ${JSON.stringify(schema.const)}` });
  }

  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) errors.push({ path, message: `must be ≥ ${schema.minimum}` });
    if (schema.maximum !== undefined && data > schema.maximum) errors.push({ path, message: `must be ≤ ${schema.maximum}` });
    if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum) errors.push({ path, message: `must be > ${schema.exclusiveMinimum}` });
    if (schema.exclusiveMaximum !== undefined && data >= schema.exclusiveMaximum) errors.push({ path, message: `must be < ${schema.exclusiveMaximum}` });
    if (schema.multipleOf !== undefined && schema.multipleOf > 0) {
      const ratio = data / schema.multipleOf;
      if (Math.abs(ratio - Math.round(ratio)) > 1e-9) errors.push({ path, message: `must be a multiple of ${schema.multipleOf}` });
    }
  }

  if (typeof data === 'string') {
    if (schema.minLength !== undefined && [...data].length < schema.minLength) errors.push({ path, message: `must be at least ${schema.minLength} characters` });
    if (schema.maxLength !== undefined && [...data].length > schema.maxLength) errors.push({ path, message: `must be at most ${schema.maxLength} characters` });
    if (schema.pattern !== undefined) {
      try {
        if (!new RegExp(schema.pattern).test(data)) errors.push({ path, message: `must match /${schema.pattern}/` });
      } catch {
        errors.push({ path, message: `invalid pattern in the schema: /${schema.pattern}/` });
      }
    }
    if (schema.format && FORMATS[schema.format] && !FORMATS[schema.format](data)) {
      errors.push({ path, message: `is not a valid ${schema.format}` });
    }
  }

  if (Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) errors.push({ path, message: `must have at least ${schema.minItems} items` });
    if (schema.maxItems !== undefined && data.length > schema.maxItems) errors.push({ path, message: `must have at most ${schema.maxItems} items` });
    if (schema.uniqueItems && new Set(data.map((item) => JSON.stringify(item))).size !== data.length) {
      errors.push({ path, message: 'items must be unique' });
    }
    if (Array.isArray(schema.items)) {
      data.forEach((item, index) => {
        if (index < schema.items.length) validate(schema.items[index], item, root, `${path}/${index}`, errors, seen);
        else if (schema.additionalItems === false) errors.push({ path: `${path}/${index}`, message: 'extra items are not allowed' });
        else if (isObject(schema.additionalItems)) validate(schema.additionalItems, item, root, `${path}/${index}`, errors, seen);
      });
    } else if (isObject(schema.items) || typeof schema.items === 'boolean') {
      data.forEach((item, index) => validate(schema.items, item, root, `${path}/${index}`, errors, seen));
    }
  }

  if (isObject(data)) {
    const keys = Object.keys(data);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) errors.push({ path, message: `must have at least ${schema.minProperties} properties` });
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) errors.push({ path, message: `must have at most ${schema.maxProperties} properties` });
    if (Array.isArray(schema.required)) {
      schema.required.forEach((name) => {
        if (!(name in data)) errors.push({ path, message: `missing required property "${name}"` });
      });
    }
    const patterns = isObject(schema.patternProperties) ? Object.entries(schema.patternProperties) : [];
    for (const [name, value] of Object.entries(data)) {
      let handled = false;
      if (isObject(schema.properties) && name in schema.properties) {
        handled = true;
        validate(schema.properties[name], value, root, `${path}/${name}`, errors, seen);
      }
      for (const [pattern, sub] of patterns) {
        if (new RegExp(pattern).test(name)) {
          handled = true;
          validate(sub, value, root, `${path}/${name}`, errors, seen);
        }
      }
      if (!handled && schema.additionalProperties !== undefined) {
        if (schema.additionalProperties === false) errors.push({ path: `${path}/${name}`, message: `property "${name}" is not allowed` });
        else if (isObject(schema.additionalProperties)) validate(schema.additionalProperties, value, root, `${path}/${name}`, errors, seen);
      }
    }
    if (isObject(schema.propertyNames)) {
      keys.forEach((name) => validate(schema.propertyNames, name, root, `${path}/${name}`, errors, seen));
    }
    if (isObject(schema.dependencies)) {
      for (const [name, dependency] of Object.entries(schema.dependencies)) {
        if (!(name in data)) continue;
        if (Array.isArray(dependency)) {
          dependency.forEach((required) => {
            if (!(required in data)) errors.push({ path, message: `"${name}" requires "${required}"` });
          });
        } else {
          validate(dependency, data, root, path, errors, seen);
        }
      }
    }
  }

  if (Array.isArray(schema.allOf)) schema.allOf.forEach((sub) => validate(sub, data, root, path, errors, seen));
  if (Array.isArray(schema.anyOf)) {
    const ok = schema.anyOf.some((sub) => validate(sub, data, root, path, [], new Set(seen)).length === 0);
    if (!ok) errors.push({ path, message: 'does not match any of the anyOf schemas' });
  }
  if (Array.isArray(schema.oneOf)) {
    const hits = schema.oneOf.filter((sub) => validate(sub, data, root, path, [], new Set(seen)).length === 0).length;
    if (hits !== 1) errors.push({ path, message: `matches ${hits} of the oneOf schemas, exactly one is required` });
  }
  if (isObject(schema.not) && validate(schema.not, data, root, path, [], new Set(seen)).length === 0) {
    errors.push({ path, message: 'must not match the "not" schema' });
  }
  if (isObject(schema.if)) {
    const branch = validate(schema.if, data, root, path, [], new Set(seen)).length === 0 ? schema.then : schema.else;
    if (isObject(branch) || typeof branch === 'boolean') validate(branch, data, root, path, errors, seen);
  }
}

function renderRow(path, message) {
  const row = document.createElement('div');
  row.className = 'tool-result-row jsv-error';
  const dt = document.createElement('dt');
  dt.textContent = `#${path}`;
  const dd = document.createElement('dd');
  dd.textContent = message;
  row.append(dt, dd);
  return row;
}

function render() {
  const schemaText = els.schema.value.trim();
  const docText = els.doc.value.trim();
  if (schemaText === '' && docText === '') {
    els.errors.replaceChildren();
    els.summary.textContent = '';
    tk.setStatus(els.status, '');
    return;
  }
  let schema;
  let data;
  try {
    schema = JSON.parse(schemaText);
  } catch (error) {
    els.errors.replaceChildren();
    els.summary.textContent = '';
    tk.setStatus(els.status, `Schema is not valid JSON: ${error.message}`, 'err');
    return;
  }
  try {
    data = JSON.parse(docText);
  } catch (error) {
    els.errors.replaceChildren();
    els.summary.textContent = '';
    tk.setStatus(els.status, `Document is not valid JSON: ${error.message}`, 'err');
    return;
  }
  const errors = [];
  validate(schema, data, schema, '', errors, new Set());
  els.errors.replaceChildren(...errors.map((error) => renderRow(error.path, error.message)));
  if (errors.length === 0) {
    els.summary.textContent = 'The document matches the schema.';
    tk.setStatus(els.status, 'Valid', 'ok');
  } else {
    els.summary.textContent = `${errors.length} problem${errors.length === 1 ? '' : 's'} found.`;
    tk.setStatus(els.status, `${errors.length} problem${errors.length === 1 ? '' : 's'}`, 'err');
  }
}

const EXAMPLE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'User',
  type: 'object',
  required: ['id', 'email'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer', minimum: 1 },
    email: { type: 'string', format: 'email' },
    role: { enum: ['admin', 'editor', 'viewer'] },
    tags: { type: 'array', items: { type: 'string' }, uniqueItems: true },
  },
};

const EXAMPLE_DOC = { id: 7, email: 'ada@example.com', role: 'editor', tags: ['math', 'code'] };

els.example.addEventListener('click', () => {
  els.schema.value = JSON.stringify(EXAMPLE_SCHEMA, null, 2);
  els.doc.value = JSON.stringify(EXAMPLE_DOC, null, 2);
  render();
});

els.clear.addEventListener('click', () => {
  els.schema.value = '';
  els.doc.value = '';
  render();
});

tk.live([els.schema, els.doc], render);
