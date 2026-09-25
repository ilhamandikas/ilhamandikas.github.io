// DNS records over DNS-over-HTTPS. Cloudflare first, Google as a fallback —
// both free, keyless and permissive with CORS. Nothing is proxied through us.
const { tk } = window;

const input = document.querySelector('#dns-input');
const typeSelect = document.querySelector('#dns-type');
const button = document.querySelector('#dns-lookup-btn');
const results = document.querySelector('#dns-results');
const status = document.querySelector('#dns-status');
const json = document.querySelector('#dns-json');

const TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SOA', 'CAA', 'SRV'];
const CODE = { 1: 'A', 2: 'NS', 5: 'CNAME', 6: 'SOA', 12: 'PTR', 15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 257: 'CAA' };
const RCODE = { 0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL', 3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED' };

const PROVIDERS = [
  {
    name: 'Cloudflare',
    url: (name, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    init: { headers: { accept: 'application/dns-json' } },
  },
  {
    name: 'Google',
    url: (name, type) => `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
    init: { headers: { accept: 'application/dns-json' } },
  },
];

async function ask(name, type) {
  let failure = null;
  for (const provider of PROVIDERS) {
    try {
      const response = await fetch(provider.url(name, type), provider.init);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        provider: provider.name,
        status: typeof data.Status === 'number' ? data.Status : 0,
        records: (data.Answer || []).map((record) => ({
          name: record.name,
          type: CODE[record.type] || `TYPE${record.type}`,
          ttl: record.TTL,
          data: String(record.data),
        })),
      };
    } catch (error) {
      failure = error;
    }
  }
  throw failure || new Error('Lookup failed');
}

function cell(tag, text, className) {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

function table(records) {
  const el = document.createElement('table');
  el.className = 'tool-table';

  const head = document.createElement('tr');
  for (const label of ['Type', 'Name', 'TTL', 'Value']) head.append(cell('th', label));
  const thead = document.createElement('thead');
  thead.append(head);

  const tbody = document.createElement('tbody');
  for (const record of records) {
    const row = document.createElement('tr');
    row.append(
      cell('td', record.type, 'tool-type'),
      cell('td', record.name),
      cell('td', record.ttl === undefined ? '' : String(record.ttl)),
      cell('td', record.data),
    );
    tbody.append(row);
  }

  el.append(thead, tbody);
  return el;
}

function render(answers, grouped) {
  const fragment = document.createDocumentFragment();

  for (const answer of answers) {
    if (grouped) fragment.append(cell('p', `${answer.type} · ${RCODE[answer.status] || answer.status}`, 'tool-group'));
    if (answer.records.length === 0) {
      fragment.append(cell('p', grouped ? 'No records of this type.' : `No ${answer.type} records.`, 'tool-hint'));
    } else {
      fragment.append(table(answer.records));
    }
  }

  results.replaceChildren(fragment);
  json.value = JSON.stringify(answers, null, 2);
}

async function lookup() {
  const name = tk.domain(input.value);
  if (name === '') {
    results.replaceChildren();
    tk.setStatus(status, 'Enter a domain name', 'err');
    return;
  }
  if (!tk.looksLikeDomain(name)) {
    results.replaceChildren();
    tk.setStatus(status, `"${name}" does not look like a domain name`, 'err');
    return;
  }

  const chosen = typeSelect.value;
  const types = chosen === 'all' ? TYPES : [chosen];
  button.disabled = true;
  tk.setStatus(status, 'Looking up…');

  try {
    const answers = await Promise.all(types.map(async (type) => ({ type, ...(await ask(name, type)) })));
    render(answers, chosen === 'all');

    const total = answers.reduce((sum, answer) => sum + answer.records.length, 0);
    const providers = [...new Set(answers.map((answer) => answer.provider))].join(' + ');
    if (total === 0) {
      const codes = [...new Set(answers.map((answer) => RCODE[answer.status] || answer.status))].join(' / ');
      tk.setStatus(status, `${codes} — no records via ${providers}`);
    } else {
      tk.setStatus(status, `${total} record${total === 1 ? '' : 's'} via ${providers}`, 'ok');
    }
  } catch (error) {
    results.replaceChildren();
    json.value = '';
    tk.setStatus(status, `${error.message} — try again in a moment`, 'err');
  } finally {
    button.disabled = false;
  }
}

button.addEventListener('click', lookup);
input.addEventListener('keydown', (event) => { if (event.key === 'Enter') lookup(); });
typeSelect.addEventListener('change', () => { if (tk.domain(input.value) !== '') lookup(); });
document.querySelector('#dns-copy').addEventListener('click', () => {
  if (json.value === '') {
    tk.setStatus(status, 'Look something up first', 'err');
    return;
  }
  tk.copy(json.value, status);
});
