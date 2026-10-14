const MAX_INPUT = 500000;
const MAX_MATCHES = 20000;
const MARKER = '[REDACTED]';
export const categories = {
  privateKeys: 'PEM private-key blocks',
  fields: 'Sensitive-field lines',
  credentials: 'URL credentials',
  jwt: 'JWT-like tokens',
  email: 'Email addresses',
  ipv4: 'IPv4 addresses',
  ipv6: 'IPv6 addresses',
  custom: 'Exact-text matches',
};
const sensitiveNames = new Set([
  'authorization', 'proxy_authorization', 'cookie', 'set_cookie', 'password', 'passwd', 'pwd',
  'secret', 'token', 'access_token', 'refresh_token', 'id_token', 'client_secret', 'api_key', 'apikey',
  'private_key', 'secret_access_key', 'database_url', 'db_url', 'connection_string',
]);
function sensitiveKey(key) {
  const normalized = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase().replace(/[.-]/g, '_');
  return [...sensitiveNames].some((name) => normalized === name || normalized.endsWith(`_${name}`));
}
function ipv4(value) {
  const parts = value.split('.');
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
function ipv6(value) {
  if (!/^[0-9a-f:.]+(?:%[a-z0-9_.-]+)?$/i.test(value)) return false;
  let address = value.split('%')[0];
  if (!address.includes(':')) return false;
  if (address.includes('.')) {
    const at = address.lastIndexOf(':');
    if (!ipv4(address.slice(at + 1))) return false;
    address = address.slice(0, at + 1) + '0:0';
  }
  const halves = address.split('::');
  if (halves.length > 2) return false;
  const groups = halves.flatMap((half) => half ? half.split(':') : []);
  if (!groups.every((part) => /^[0-9a-f]{1,4}$/i.test(part))) return false;
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
}

export function redactLog(text, options, customText = '') {
  if (text.length > MAX_INPUT) throw new Error('Maximum log size is 500,000 characters. Split larger logs before redacting.');
  if (customText.length > 10000) throw new Error('Exact-text list: maximum 10,000 characters.');
  const custom = [...new Set(customText.split(/\r\n|\n|\r/).filter((line) => line !== ''))];
  if (custom.length > 100) throw new Error('Exact-text list: maximum 100 distinct non-empty lines.');
  if (custom.some((line) => line.length < 3)) throw new Error('Each exact-text entry needs at least 3 characters. Blank lines are ignored.');
  const counts = Object.fromEntries(Object.keys(categories).map((key) => [key, 0]));
  const spans = [];
  let conservativeTail = false;
  function add(start, end, kind) {
    if (end <= start) return;
    if (spans.length >= MAX_MATCHES) throw new Error('More than 20,000 matches found. Split the log into smaller parts before redacting.');
    spans.push({ start, end });
    counts[kind] += 1;
  }
  if (options.privateKeys) {
    for (const match of text.matchAll(/-----BEGIN ((?:[A-Z0-9]+ )*PRIVATE KEY)-----/g)) {
      const footer = `-----END ${match[1]}-----`;
      const end = text.indexOf(footer, match.index + match[0].length);
      add(match.index, end < 0 ? text.length : end + footer.length, 'privateKeys');
      if (end < 0) conservativeTail = true;
    }
  }
  if (options.fields) {
    for (const line of text.matchAll(/[^\r\n]+/g)) {
      for (const key of line[0].matchAll(/[A-Za-z_][A-Za-z0-9_.-]*/g)) {
        if (!sensitiveKey(key[0])) continue;
        const tail = line[0].slice(key.index + key[0].length);
        const separator = /^["']?[ \t]*[:=][ \t]*/.exec(tail);
        if (!separator) continue;
        const offset = key.index + key[0].length + separator[0].length;
        const start = line.index + offset;
        const value = line[0].slice(offset);
        let end = line.index + line[0].length;
        // A split or unterminated value is ambiguous. Hide the rest rather than
        // leave the next line of a possible secret visible.
        let unfinished = !value.trim() || value.startsWith('{') || value.startsWith('[');
        if (value.startsWith('"') || value.startsWith("'")) {
          let closed = false;
          for (let i = 1; i < value.length; i += 1) {
            if (value[i] === '\\') { i += 1; continue; }
            if (value[i] === value[0]) { closed = true; break; }
          }
          unfinished = !closed;
        }
        if (unfinished) { end = text.length; conservativeTail = true; }
        add(start, end, 'fields');
        break;
      }
    }
  }
  if (options.credentials) {
    for (const match of text.matchAll(/:\/\//g)) {
      let schemeStart = match.index;
      while (schemeStart > 0 && /[a-z0-9+.-]/i.test(text[schemeStart - 1])) schemeStart -= 1;
      if (!/^[a-z][a-z0-9+.-]*$/i.test(text.slice(schemeStart, match.index))) continue;
      const start = match.index + 3;
      const authority = /^[^\s/?#"'<>]*/.exec(text.slice(start))[0];
      const at = authority.lastIndexOf('@');
      if (at > 0) add(start, start + at, 'credentials');
    }
  }
  // Scan complete token runs once, instead of repeatedly backtracking over a
  // very long non-matching word with an email/JWT regular expression.
  if (options.jwt) {
    for (const match of text.matchAll(/[A-Za-z0-9_.-]+/g)) {
      let value = match[0];
      if (value.endsWith('.') && value.split('.').length === 4) value = value.slice(0, -1);
      const parts = value.split('.');
      if (parts.length === 3 && parts[0].startsWith('eyJ') && parts[0].length > 3 && parts[1] && parts.every((part) => /^[A-Za-z0-9_-]*$/.test(part))) {
        add(match.index, match.index + value.length, 'jwt');
      }
    }
  }
  if (options.email) {
    for (const match of text.matchAll(/[A-Za-z0-9._%+@-]+/g)) {
      const value = match[0].replace(/\.+$/, '');
      const parts = value.split('@');
      if (parts.length === 2 && /^[A-Za-z0-9._%+-]+$/.test(parts[0]) && /^(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63}$/.test(parts[1])) {
        add(match.index, match.index + value.length, 'email');
      }
    }
  }
  if (options.ipv4) {
    for (const match of text.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)) {
      if (ipv4(match[0])) add(match.index, match.index + match[0].length, 'ipv4');
    }
  }
  if (options.ipv6) {
    for (const match of text.matchAll(/[a-z0-9_.:%-]+/gi)) {
      const value = match[0].replace(/\.+$/, '');
      if (ipv6(value)) add(match.index, match.index + value.length, 'ipv6');
    }
  }
  for (const literal of custom) {
    let at = text.indexOf(literal);
    while (at !== -1) {
      add(at, at + literal.length, 'custom');
      at = text.indexOf(literal, at + 1);
    }
  }
  spans.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged = [];
  for (const span of spans) {
    const last = merged.at(-1);
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  const output = [];
  let at = 0;
  for (const span of merged) {
    output.push(text.slice(at, span.start), MARKER);
    at = span.end;
  }
  output.push(text.slice(at));
  return { text: output.join(''), counts, regions: merged.length, conservativeTail };
}
