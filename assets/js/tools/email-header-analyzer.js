// Email header analyzer: read the delivery path and the authentication verdicts.
const { tk } = window;

const els = {
  input: document.querySelector('#eh-input'),
  summary: document.querySelector('#eh-summary'),
  hops: document.querySelector('#eh-hops'),
  status: document.querySelector('#eh-status'),
};

function parseHeaders(text) {
  const headers = [];
  text.split(/\r?\n/).forEach((line) => {
    if (/^[ \t]/.test(line) && headers.length) {
      headers[headers.length - 1].value += ` ${line.trim()}`;
      return;
    }
    const at = line.indexOf(':');
    if (at === -1) return;
    headers.push({ name: line.slice(0, at).trim().toLowerCase(), value: line.slice(at + 1).trim() });
  });
  return headers;
}

function parseReceived(value) {
  const at = value.lastIndexOf(';');
  const dateText = at !== -1 ? value.slice(at + 1).trim() : '';
  const head = at !== -1 ? value.slice(0, at) : value;
  const from = /\bfrom\s+([^\s(;]+)/i.exec(head);
  const by = /\bby\s+([^\s(;]+)/i.exec(head);
  const proto = /\bwith\s+([^\s;]+)/i.exec(head);
  const ip = /\[([0-9a-f:.]+)\]/i.exec(head);
  return {
    from: from ? from[1] : '—',
    by: by ? by[1] : '—',
    protocol: proto ? proto[1] : '—',
    ip: ip ? ip[1] : '',
    date: dateText,
    time: dateText ? Date.parse(dateText) : NaN,
  };
}

function row(dt, dd) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const key = document.createElement('dt');
  const value = document.createElement('dd');
  key.textContent = dt;
  value.textContent = dd;
  wrap.append(key, value);
  return wrap;
}

const first = (headers, name) => {
  const hit = headers.find((header) => header.name === name);
  return hit ? hit.value : '—';
};

function render() {
  const text = els.input.value;
  els.summary.replaceChildren();
  els.hops.replaceChildren();
  if (!text.trim()) {
    tk.setStatus(els.status, '');
    return;
  }
  const headers = parseHeaders(text);
  if (!headers.length) {
    tk.setStatus(els.status, 'No headers found — paste the raw header block of a message.', 'err');
    return;
  }

  const auth = headers.filter((header) => header.name === 'authentication-results').map((header) => header.value).join(' ');
  const verdict = (key) => {
    const match = new RegExp(`${key}=([a-z]+)`, 'i').exec(auth);
    return match ? match[1] : '—';
  };

  els.summary.append(
    row('From', first(headers, 'from')),
    row('To', first(headers, 'to')),
    row('Subject', first(headers, 'subject')),
    row('Date', first(headers, 'date')),
    row('Message-ID', first(headers, 'message-id')),
    row('Return-Path', first(headers, 'return-path')),
    row('Reply-To', first(headers, 'reply-to')),
    row('SPF', verdict('spf')),
    row('DKIM', verdict('dkim')),
    row('DMARC', verdict('dmarc')),
  );

  const received = headers
    .filter((header) => header.name === 'received')
    .map((header) => parseReceived(header.value))
    .reverse();

  const table = document.createElement('table');
  table.className = 'tool-table';
  table.innerHTML = '<thead><tr><th>#</th><th>From</th><th>By</th><th>Protocol</th><th>IP</th><th>Time</th><th>Delay</th></tr></thead>';
  const body = document.createElement('tbody');
  received.forEach((hop, index) => {
    const previous = received[index - 1];
    let delay = '—';
    if (previous && Number.isFinite(previous.time) && Number.isFinite(hop.time)) {
      const seconds = Math.round((hop.time - previous.time) / 1000);
      delay = `${seconds}s`;
    }
    const tr = document.createElement('tr');
    [String(index + 1), hop.from, hop.by, hop.protocol, hop.ip || '—', hop.date || '—', delay].forEach((value, cellIndex) => {
      const cell = document.createElement(cellIndex === 0 ? 'th' : 'td');
      if (cellIndex === 0) cell.scope = 'row';
      cell.textContent = value;
      tr.appendChild(cell);
    });
    body.appendChild(tr);
  });
  table.appendChild(body);
  els.hops.appendChild(table);

  tk.setStatus(els.status, `${received.length} delivery hop${received.length === 1 ? '' : 's'} parsed locally.`, 'ok');
}

tk.live(els.input, render);
