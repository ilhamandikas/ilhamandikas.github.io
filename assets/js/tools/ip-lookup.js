// Look up the public IP address (or any address) and its geolocation.
//
// This is the one tool here that makes an outbound request. It uses two free,
// key-less services and falls back from the first to the second:
//   - ipwho.is      (rich: ISP/ASN, timezone, flag)
//   - freeipapi.com (no ISP, but a solid backup)
const { tk } = window;

const input = document.querySelector('#ip-input');
const button = document.querySelector('#ip-lookup-btn');
const result = document.querySelector('#ip-result');
const jsonOut = document.querySelector('#ip-json');
const status = document.querySelector('#ip-status');

const flagFromCode = (code) =>
  /^[A-Za-z]{2}$/.test(code || '')
    ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : '';

// --- providers -------------------------------------------------------------

async function fromIpWho(address) {
  const response = await fetch(`https://ipwho.is/${encodeURIComponent(address)}`);
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message || 'Lookup failed');
  return {
    ip: data.ip,
    version: data.type,
    country: data.country,
    countryCode: data.country_code,
    flag: (data.flag && data.flag.emoji) || flagFromCode(data.country_code),
    continent: data.continent,
    region: data.region,
    city: data.city,
    postal: data.postal,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone && data.timezone.id,
    utcOffset: data.timezone && data.timezone.utc,
    isp: data.connection && data.connection.isp,
    org: data.connection && data.connection.org,
    asn: data.connection && data.connection.asn,
    domain: data.connection && data.connection.domain,
    provider: 'ipwho.is',
  };
}

async function fromFreeIpApi(address) {
  const suffix = address ? `/${encodeURIComponent(address)}` : '';
  const response = await fetch(`https://freeipapi.com/api/json${suffix}`);
  const data = await response.json();
  if (!response.ok || !data.ipAddress) throw new Error('Lookup failed');
  return {
    ip: data.ipAddress,
    version: `IPv${data.ipVersion}`,
    country: data.countryName,
    countryCode: data.countryCode,
    flag: flagFromCode(data.countryCode),
    continent: data.continent,
    region: data.regionName,
    city: data.cityName,
    postal: data.zipCode,
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: (data.timeZones && data.timeZones[0]) || null,
    utcOffset: null,
    isp: null,
    org: null,
    asn: null,
    domain: null,
    provider: 'freeipapi.com',
  };
}

const PROVIDERS = [fromIpWho, fromFreeIpApi];

// --- validation ------------------------------------------------------------

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

function looksLikeIp(value) {
  if (IPV4.test(value)) return value.split('.').every((part) => Number(part) <= 255);
  return /^[0-9a-fA-F:]+$/.test(value) && value.includes(':');
}

// --- rendering -------------------------------------------------------------

function row(label, value) {
  if (value === null || value === undefined || value === '') return null;
  const el = document.createElement('div');
  el.className = 'tool-result-row';
  const dd = document.createElement('dd');
  dd.textContent = String(value);
  el.innerHTML = `<dt>${label}</dt>`;
  el.appendChild(dd);
  return el;
}

function render(info) {
  const head = document.createElement('div');
  head.className = 'ip-head';
  head.innerHTML = `<span class="ip-flag" aria-hidden="true">${info.flag || '🌐'}</span><span class="ip-ip"></span>`;
  head.querySelector('.ip-ip').textContent = info.ip;

  const place = [info.city, info.region, info.country].filter(Boolean).join(', ');
  const coordinates = info.latitude != null && info.longitude != null
    ? `${Number(info.latitude).toFixed(4)}, ${Number(info.longitude).toFixed(4)}`
    : null;

  const list = document.createElement('dl');
  list.className = 'tool-results';
  list.append(
    ...[
      row('Address type', info.version),
      row('Location', place),
      row('Continent', info.continent),
      row('Postal code', info.postal),
      row('Coordinates', coordinates),
      row('Timezone', info.timezone ? `${info.timezone}${info.utcOffset ? ` (UTC${info.utcOffset})` : ''}` : null),
      row('ISP', info.isp),
      row('Organisation', info.org),
      row('ASN', info.asn ? `AS${info.asn}` : null),
      row('Domain', info.domain),
      row('Source', info.provider),
    ].filter(Boolean),
  );

  const actions = document.createElement('div');
  actions.className = 'ip-actions';
  if (coordinates) {
    const map = document.createElement('a');
    map.className = 'btn';
    map.target = '_blank';
    map.rel = 'noopener noreferrer';
    map.textContent = 'Open in OpenStreetMap';
    map.href = `https://www.openstreetmap.org/?mlat=${info.latitude}&mlon=${info.longitude}#map=10/${info.latitude}/${info.longitude}`;
    actions.appendChild(map);
  }
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'btn';
  copy.textContent = 'Copy as JSON';
  copy.addEventListener('click', () => tk.copy(jsonOut.value, status, 'JSON copied'));
  actions.appendChild(copy);

  result.replaceChildren(head, list, actions);
  jsonOut.value = JSON.stringify(info, null, 2);
}

// --- flow ------------------------------------------------------------------

async function lookup() {
  const typed = input.value.trim();
  if (typed !== '' && !looksLikeIp(typed)) {
    result.replaceChildren();
    tk.setStatus(status, 'That does not look like an IPv4 or IPv6 address', 'err');
    return;
  }

  button.disabled = true;
  result.replaceChildren();
  tk.setStatus(status, 'Looking up…');

  let lastError = null;
  for (const provider of PROVIDERS) {
    try {
      const info = await provider(typed);
      render(info);
      tk.setStatus(status, `Resolved via ${info.provider}`, 'ok');
      button.disabled = false;
      return;
    } catch (error) {
      lastError = error;
    }
  }

  tk.setStatus(status, lastError ? `${lastError.message} — try again in a moment` : 'Lookup failed', 'err');
  button.disabled = false;
}

button.addEventListener('click', lookup);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); lookup(); }
});

lookup();
