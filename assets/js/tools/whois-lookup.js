// Domain registration data via RDAP — the JSON successor to WHOIS.
//
// Strategy: read the IANA bootstrap directory to find the registry that serves a
// TLD, then ask that registry directly. rdap.org is the fallback for anything the
// bootstrap lookup cannot place. Both are free and keyless.
const { tk } = window;

const input = document.querySelector('#whois-input');
const button = document.querySelector('#whois-lookup-btn');
const result = document.querySelector('#whois-result');
const status = document.querySelector('#whois-status');
const json = document.querySelector('#whois-json');

const BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';
let bootstrap = null;

function loadBootstrap() {
  if (!bootstrap) {
    bootstrap = fetch(BOOTSTRAP_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const map = new Map();
        for (const [tlds, urls] of data.services || []) {
          if (urls && urls[0]) for (const tld of tlds) map.set(tld, urls[0]);
        }
        return map;
      })
      .catch((error) => {
        bootstrap = null;
        throw error;
      });
  }
  return bootstrap;
}

const PROVIDERS = [
  {
    name: 'registry RDAP',
    async url(domain, tld) {
      const map = await loadBootstrap();
      const base = map.get(tld);
      if (!base) {
        // rdap.org reads the same directory, so a second request cannot help.
        const error = new Error(`No RDAP service is published for .${tld}`);
        error.final = true;
        throw error;
      }
      return `${base.replace(/\/?$/, '/')}domain/${encodeURIComponent(domain)}`;
    },
  },
  {
    name: 'rdap.org',
    url: (domain) => `https://rdap.org/domain/${encodeURIComponent(domain)}`,
  },
];

async function fetchRdap(domain) {
  const tld = domain.split('.').pop();
  let failure = null;

  for (const provider of PROVIDERS) {
    try {
      const response = await fetch(await provider.url(domain, tld), { headers: { accept: 'application/rdap+json' } });
      if (!response.ok) {
        // Registries disagree here: some send an empty 404, others a JSON error.
        let detail = '';
        try {
          const body = await response.json();
          detail = body.title || (body.description || [])[0] || '';
        } catch {
          detail = '';
        }
        throw new Error(detail || `HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.errorCode) throw new Error(data.title || `Error ${data.errorCode}`);
      return { provider: provider.name, data };
    } catch (error) {
      if (error.final) throw error;
      failure = error;
    }
  }
  throw failure || new Error('Lookup failed');
}

// --- RDAP -> flat shape ----------------------------------------------------

function vcard(entity) {
  const out = {};
  for (const entry of (entity && entity.vcardArray && entity.vcardArray[1]) || []) {
    const [name, , , value] = entry;
    if (typeof value !== 'string') continue;
    if (name === 'fn') out.name = value;
    else if (name === 'email') out.email = value;
    else if (name === 'org') out.org = value;
  }
  return out;
}

function byRole(entities, role, found = []) {
  for (const entity of entities || []) {
    if ((entity.roles || []).includes(role)) found.push(entity);
    byRole(entity.entities, role, found);
  }
  return found;
}

function day(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function normalize(data) {
  const events = {};
  for (const event of data.events || []) events[event.eventAction] = event.eventDate;

  const registrarEntity = byRole(data.entities, 'registrar')[0];
  const registrar = vcard(registrarEntity);
  const registrant = vcard(byRole(data.entities, 'registrant')[0]);
  const abuse = vcard(byRole(data.entities, 'abuse')[0]);
  const publicId = registrarEntity && (registrarEntity.publicIds || [])[0];

  return {
    domain: data.unicodeName || data.ldhName || '',
    handle: data.handle || '',
    registrar: registrar.name || '',
    registrarId: (publicId && publicId.identifier) || '',
    registrant: registrant.org || registrant.name || '',
    abuseEmail: abuse.email || '',
    status: data.status || [],
    registered: day(events.registration),
    updated: day(events['last changed'] || events['last update of RDAP database']),
    expires: day(events.expiration),
    transferred: day(events.transfer),
    nameservers: (data.nameservers || []).map((ns) => (ns.ldhName || ns.unicodeName || '').toLowerCase()).filter(Boolean),
    dnssec: Boolean(data.secureDNS && data.secureDNS.delegationSigned),
    redacted: (data.redacted || []).length > 0,
  };
}

// --- rendering -------------------------------------------------------------

function row(label, value, extra) {
  const el = document.createElement('div');
  el.className = 'tool-result-row';
  el.append(Object.assign(document.createElement('dt'), { textContent: label }));

  const dd = document.createElement('dd');
  if (extra) dd.append(extra);
  else dd.textContent = value;
  el.append(dd);
  return el;
}

function chips(values) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-chips';
  for (const value of values) wrap.append(Object.assign(document.createElement('span'), { className: 'tool-chip', textContent: value }));
  return wrap;
}

function list(values) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-chips';
  for (const value of values) wrap.append(Object.assign(document.createElement('code'), { className: 'tool-chip', textContent: value }));
  return wrap;
}

function render(info, provider) {
  const head = document.createElement('div');
  head.className = 'ip-head';
  head.append(Object.assign(document.createElement('span'), { className: 'ip-ip', textContent: info.domain }));

  const rows = document.createElement('dl');
  rows.className = 'tool-results';
  if (info.registrar) rows.append(row('Registrar', info.registrar));
  if (info.registrarId) rows.append(row('Registrar ID', info.registrarId));
  if (info.registrant) rows.append(row('Registrant', info.registrant));
  if (info.abuseEmail) rows.append(row('Abuse contact', info.abuseEmail));
  if (info.registered) rows.append(row('Registered', info.registered));
  if (info.updated) rows.append(row('Last changed', info.updated));
  if (info.expires) rows.append(row('Expires', info.expires));
  if (info.transferred) rows.append(row('Transferred', info.transferred));
  if (info.nameservers.length) rows.append(row('Nameservers', '', list(info.nameservers)));
  if (info.status.length) rows.append(row('Status', '', chips(info.status)));
  rows.append(row('DNSSEC', info.dnssec ? 'signed' : 'not signed'));
  if (info.handle) rows.append(row('Registry handle', info.handle));
  rows.append(row('Source', provider));

  const fragment = document.createDocumentFragment();
  fragment.append(head, rows);
  if (info.redacted) {
    fragment.append(Object.assign(document.createElement('p'), {
      className: 'tool-hint',
      textContent: 'Some contact details are redacted by the registry, usually to satisfy privacy law.',
    }));
  }
  result.replaceChildren(fragment);
  json.value = JSON.stringify(info, null, 2);
}

// --- flow ------------------------------------------------------------------

async function lookup() {
  const domain = tk.domain(input.value);
  if (domain === '') {
    result.replaceChildren();
    tk.setStatus(status, 'Enter a domain name', 'err');
    return;
  }
  if (!tk.looksLikeDomain(domain)) {
    result.replaceChildren();
    tk.setStatus(status, `"${domain}" does not look like a domain name`, 'err');
    return;
  }

  button.disabled = true;
  tk.setStatus(status, 'Looking up…');

  try {
    const { provider, data } = await fetchRdap(domain);
    render(normalize(data), provider);
    tk.setStatus(status, `Registration data via ${provider}`, 'ok');
  } catch (error) {
    result.replaceChildren();
    json.value = '';
    const message = /No RDAP service/.test(error.message)
      ? `${error.message} — that registry still only offers plain WHOIS`
      : `${error.message} — check the spelling, or try again in a moment`;
    tk.setStatus(status, message, 'err');
  } finally {
    button.disabled = false;
  }
}

button.addEventListener('click', lookup);
input.addEventListener('keydown', (event) => { if (event.key === 'Enter') lookup(); });
document.querySelector('#whois-copy').addEventListener('click', () => {
  if (json.value === '') {
    tk.setStatus(status, 'Look something up first', 'err');
    return;
  }
  tk.copy(json.value, status, 'JSON copied');
});
