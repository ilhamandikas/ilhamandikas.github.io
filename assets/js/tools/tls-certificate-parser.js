import { fromBase64 } from '../pem.js';

const malformed = () => { throw new Error('Malformed or unsupported X.509 DER certificate. Paste a complete PEM certificate, not a key or CSR.'); };
const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join(':').toUpperCase();

function node(bytes, at = 0) {
  if (at + 2 > bytes.length || (bytes[at] & 31) === 31) malformed();
  const tag = bytes[at++];
  let size = bytes[at++];
  if (size & 128) {
    const count = size & 127;
    if (!count || count > 4 || at + count > bytes.length || bytes[at] === 0) malformed();
    size = 0;
    for (let i = 0; i < count; i += 1) size = size * 256 + bytes[at++];
    if (size < 128) malformed();
  }
  if (at + size > bytes.length) malformed();
  return { tag, body: bytes.subarray(at, at + size), end: at + size };
}
function expect(n, tag) {
  if (!n || n.tag !== tag) malformed();
  return n;
}
function children(n, tag = 0x30) {
  expect(n, tag);
  const out = [];
  for (let at = 0; at < n.body.length;) {
    const child = node(n.body, at);
    out.push(child);
    if (out.length > 10000) malformed();
    at = child.end;
  }
  return out;
}
function root(bytes) {
  const n = node(bytes);
  if (n.end !== bytes.length) malformed();
  return n;
}
function oid(n) {
  const bytes = expect(n, 6).body;
  const parts = [];
  let value = 0n;
  let open = false;
  for (const b of bytes) {
    if (!open && b === 128) malformed();
    value = value * 128n + BigInt(b & 127);
    open = !!(b & 128);
    if (!open) { parts.push(value); value = 0n; }
  }
  if (open || !parts.length) malformed();
  const first = parts.shift();
  const arc = first < 40n ? 0n : first < 80n ? 1n : 2n;
  return [arc, first - arc * 40n, ...parts].join('.');
}
function string(n) {
  if (n.tag === 12) return new TextDecoder('utf-8', { fatal: true }).decode(n.body);
  if ([19, 22, 23, 24].includes(n.tag)) {
    if (n.body.some((b) => b > 127)) malformed();
    return new TextDecoder().decode(n.body);
  }
  if (n.tag === 30) {
    if (n.body.length % 2) malformed();
    let text = '';
    for (let i = 0; i < n.body.length; i += 2) text += String.fromCharCode(n.body[i] * 256 + n.body[i + 1]);
    return text;
  }
  return `[unsupported string type ${n.tag}; hex ${hex(n.body)}]`;
}
const nameLabels = { '2.5.4.3': 'CN', '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST', '2.5.4.10': 'O', '2.5.4.11': 'OU', '2.5.4.5': 'serialNumber', '1.2.840.113549.1.9.1': 'emailAddress', '0.9.2342.19200300.100.1.25': 'DC' };
function name(n) {
  return children(n).map((rdn) => children(rdn, 0x31).map((attribute) => {
    const pair = children(attribute);
    if (pair.length !== 2) malformed();
    const id = oid(pair[0]);
    return `${nameLabels[id] || id}=${JSON.stringify(string(pair[1]))}`;
  }).join(' + ')).join('\n') || '(empty subject)';
}
function time(n) {
  if (![23, 24].includes(n.tag)) malformed();
  const raw = string(n);
  if (!(n.tag === 23 ? /^\d{12}Z$/ : /^\d{14}Z$/).test(raw)) malformed();
  const full = n.tag === 23 ? (Number(raw.slice(0, 2)) >= 50 ? '19' : '20') + raw : raw;
  const iso = `${full.slice(0, 4)}-${full.slice(4, 6)}-${full.slice(6, 8)}T${full.slice(8, 10)}:${full.slice(10, 12)}:${full.slice(12, 14)}.000Z`;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== iso) malformed();
  return date.toISOString();
}
const algorithms = {
  '1.2.840.113549.1.1.1': 'RSA', '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA', '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA', '1.2.840.113549.1.1.10': 'RSA-PSS (parameters not decoded)',
  '1.2.840.10045.2.1': 'EC', '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384', '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '1.3.101.112': 'Ed25519', '1.3.101.113': 'Ed448',
};
const curves = { '1.2.840.10045.3.1.7': 'P-256', '1.3.132.0.34': 'P-384', '1.3.132.0.35': 'P-521', '1.3.132.0.10': 'secp256k1' };
function algorithm(n) {
  const fields = children(n);
  const id = oid(fields[0]);
  return { id, label: `${algorithms[id] || 'Unknown algorithm'} (${id})`, fields };
}
function publicKey(n) {
  const fields = children(n);
  if (fields.length !== 2) malformed();
  const alg = algorithm(fields[0]);
  const bits = expect(fields[1], 3).body;
  if (!bits.length || bits[0] !== 0) malformed();
  let details = alg.label;
  if (alg.id === '1.2.840.113549.1.1.1') {
    const rsa = children(root(bits.subarray(1)));
    if (rsa.length !== 2) malformed();
    const modulus = expect(rsa[0], 2).body;
    if (!modulus.length || modulus[0] & 128) malformed();
    let at = 0;
    while (at < modulus.length && modulus[at] === 0) at += 1;
    if (at === modulus.length) malformed();
    const size = (modulus.length - at - 1) * 8 + (32 - Math.clz32(modulus[at]));
    details += `, ${size} bits`;
  } else if (alg.id === '1.2.840.10045.2.1' && alg.fields[1]?.tag === 6) {
    const curve = oid(alg.fields[1]);
    details += `, ${curves[curve] || curve}`;
  }
  return details;
}
function san(n) {
  return children(root(n.body)).map((entry) => {
    if ([0x81, 0x82, 0x86].includes(entry.tag)) {
      const label = { 129: 'Email', 130: 'DNS', 134: 'URI' }[entry.tag];
      return `${label}: ${string({ tag: 22, body: entry.body })}`;
    }
    if (entry.tag === 0x87) {
      const b = entry.body;
      if (b.length === 4) return `IP: ${[...b].join('.')}`;
      if (b.length === 16) return `IP: ${Array.from({ length: 8 }, (_, i) => (b[i * 2] * 256 + b[i * 2 + 1]).toString(16)).join(':')}`;
      malformed();
    }
    return `Other SAN type [${entry.tag & 31}] (not decoded)`;
  });
}

export function parseCertificate(bytes) {
  const cert = children(root(bytes));
  if (cert.length !== 3) malformed();
  const tbs = children(cert[0]);
  let at = 0;
  let version = 1;
  if (tbs[0]?.tag === 0xa0) {
    const v = children(tbs[at++], 0xa0);
    const integer = expect(v[0], 2).body;
    if (v.length !== 1 || integer.length !== 1 || integer[0] > 2) malformed();
    version = integer[0] + 1;
  }
  const serial = expect(tbs[at++], 2).body;
  if (!serial.length) malformed();
  const tbsAlg = algorithm(tbs[at++]);
  const issuer = name(tbs[at++]);
  const validity = children(tbs[at++]);
  if (validity.length !== 2) malformed();
  const notBefore = time(validity[0]);
  const notAfter = time(validity[1]);
  if (notAfter < notBefore) malformed();
  const subject = name(tbs[at++]);
  const key = publicKey(tbs[at++]);
  const signature = algorithm(cert[1]);
  if (signature.id !== tbsAlg.id) malformed();
  const sigBytes = expect(cert[2], 3).body;
  if (sigBytes.length < 2 || sigBytes[0] !== 0) malformed();
  let subjectAltNames = [];
  const extensions = [];
  const seen = new Set();
  for (; at < tbs.length; at += 1) {
    const optional = tbs[at];
    if ([0x81, 0x82].includes(optional.tag)) continue;
    if (optional.tag !== 0xa3 || seen.has('extensions')) malformed();
    seen.add('extensions');
    const wrapper = children(optional, 0xa3);
    if (wrapper.length !== 1) malformed();
    for (const extension of children(wrapper[0])) {
      const fields = children(extension);
      const id = oid(fields[0]);
      if (seen.has(id) || ![2, 3].includes(fields.length)) malformed();
      seen.add(id);
      let critical = false;
      if (fields.length === 3) {
        const b = expect(fields[1], 1).body;
        if (b.length !== 1 || ![0, 255].includes(b[0])) malformed();
        critical = b[0] !== 0;
      }
      const value = expect(fields.at(-1), 4);
      extensions.push(`${id}${critical ? ' (critical)' : ''}${id === '2.5.29.17' ? ' — Subject Alternative Name' : ' — not decoded'}`);
      if (id === '2.5.29.17') subjectAltNames = san(value);
    }
  }
  return { version, serial: hex(serial), issuer, subject, notBefore, notAfter, publicKey: key, signatureAlgorithm: signature.label, subjectAltNames, extensions };
}

export async function decodeCertificates(text) {
  if (!text.trim()) throw new Error('Paste a PEM certificate beginning with -----BEGIN CERTIFICATE-----.');
  if (text.length > 1000000) throw new Error('Maximum input size is 1,000,000 characters.');
  const pattern = /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g;
  const blocks = [...text.matchAll(pattern)];
  if (!blocks.length || text.replace(pattern, '').trim()) throw new Error('Use only complete BEGIN CERTIFICATE / END CERTIFICATE blocks. Private keys, CSRs, and surrounding text are not accepted.');
  if (blocks.length > 20) throw new Error('Maximum 20 certificates per bundle.');
  const out = [];
  for (const [i, block] of blocks.entries()) {
    try {
      const body = block[1].replace(/\s/g, '');
      if (!body || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body)) throw new Error('Invalid certificate Base64.');
      const bytes = fromBase64(body);
      const cert = parseCertificate(bytes);
      if (!globalThis.crypto?.subtle) throw new Error('SHA-256 fingerprint needs Web Crypto. Open this page over HTTPS or localhost.');
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      out.push({ ...cert, fingerprint: hex(new Uint8Array(digest)) });
    } catch (error) {
      throw new Error(`Certificate ${i + 1}: ${error instanceof TypeError ? 'Malformed certificate fields.' : error.message}`);
    }
  }
  return out;
}
