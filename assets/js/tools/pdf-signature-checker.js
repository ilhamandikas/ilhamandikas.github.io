// Inspect the digital signatures embedded in a PDF.
//
// This is a from-scratch, best-effort checker: it locates signature
// dictionaries, hashes the /ByteRange they cover and compares that hash with
// the message digest sealed inside the PKCS#7 blob. It does not validate
// certificate chains — that would need a trust store.
const { tk } = window;

const file = document.querySelector('#pdf-file');
const results = document.querySelector('#pdf-results');
const status = document.querySelector('#pdf-status');

const OIDS = {
  '2a864886f70d010904': 'messageDigest',
  '2a864886f70d010905': 'signingTime',
  '608648016503040201': 'SHA-256',
  '608648016503040202': 'SHA-384',
  '608648016503040203': 'SHA-512',
  '608648016503040204': 'SHA-224',
  '2b0e03021a': 'SHA-1',
  '2a864886f70d0205': 'MD5',
  '550403': 'commonName',
  '55040a': 'organizationName',
  '550411': 'countryName',
};

const SUBTLE = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512', 'SHA-224': null, MD5: null };

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
const toBytes = (value) => {
  const clean = value.replace(/[^0-9a-fA-F]/g, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
};

function readTlv(bytes, offset) {
  const tag = bytes[offset];
  let cursor = offset + 1;
  let length = bytes[cursor++];
  if (length & 0x80) {
    const count = length & 0x7f;
    length = 0;
    for (let i = 0; i < count; i += 1) length = (length << 8) | bytes[cursor++];
  }
  return { tag, start: cursor, end: cursor + length, next: cursor + length };
}

// Walk the DER tree, calling visit(tag, bytes, start, end) for every node.
function walk(bytes, start, end, visit) {
  let offset = start;
  while (offset < end) {
    const tlv = readTlv(bytes, offset);
    if (tlv.next > end + 1 || tlv.end > bytes.length) return;
    visit(tlv.tag, bytes, tlv.start, tlv.end);
    if ((tlv.tag & 0x20) !== 0) walk(bytes, tlv.start, tlv.end, visit);
    offset = tlv.next;
  }
}

function findDigest(der) {
  let algorithm = null;
  let messageDigest = null;
  let signingTime = null;
  let expectDigest = false;
  walk(der, 0, der.length, (tag, bytes, start, end) => {
    if (tag === 0x06) {
      const oid = hex(bytes.slice(start, end));
      const name = OIDS[oid];
      if (oid === '2a864886f70d010904') expectDigest = true;
      else if (name && SUBTLE[name] !== undefined && !algorithm) algorithm = name;
    }
    if (tag === 0x04 && expectDigest && !messageDigest) {
      messageDigest = bytes.slice(start, end);
      expectDigest = false;
    }
    if ((tag === 0x17 || tag === 0x18) && !signingTime) signingTime = new TextDecoder().decode(bytes.slice(start, end));
  });
  return { algorithm, messageDigest, signingTime };
}

function findName(der, oidHex) {
  let value = null;
  walk(der, 0, der.length, (tag, bytes, start, end) => {
    if (value || tag !== 0x06) return;
    if (hex(bytes.slice(start, end)) !== oidHex || end >= der.length) return;
    const tlv = readTlv(der, end);
    if ([0x0c, 0x13, 0x16, 0x14, 0x1e].includes(tlv.tag)) value = new TextDecoder().decode(der.slice(tlv.start, tlv.end));
  });
  return value;
}

function readLiteral(text, key) {
  const match = text.match(new RegExp(`/${key}\\s*\\(([^)]*)\\)`));
  return match ? match[1].replace(/\\([()\\])/g, '$1') : null;
}

async function digestRanges(buffer, ranges, algorithm) {
  const name = SUBTLE[algorithm];
  if (!name) throw new Error(`${algorithm} is not supported for verification`);
  const chunks = [];
  for (let i = 0; i + 1 < ranges.length; i += 2) {
    chunks.push(new Uint8Array(buffer, ranges[i], ranges[i + 1]));
  }
  const blob = new Blob(chunks);
  return new Uint8Array(await crypto.subtle.digest(name, await blob.arrayBuffer()));
}

function card(signature) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tool-panel';
  const heading = document.createElement('h3');
  heading.textContent = `Signature ${signature.index}`;
  wrapper.appendChild(heading);

  const rows = [
    ['Integrity', signature.integrity],
    ['Digest algorithm', signature.algorithm || 'unknown'],
    ['Sub filter', signature.subFilter || '—'],
    ['Signed by', signature.name || '—'],
    ['Reason', signature.reason || '—'],
    ['Location', signature.location || '—'],
    ['Signed at', signature.signedAt || '—'],
    ['Byte range', signature.ranges.join(', ')],
  ];
  const list = document.createElement('dl');
  list.className = 'tool-results';
  for (const [key, value] of rows) {
    const row = document.createElement('div');
    row.className = 'tool-result-row';
    row.innerHTML = `<dt>${key}</dt><dd>${String(value)}</dd>`;
    list.appendChild(row);
  }
  wrapper.appendChild(list);
  return wrapper;
}

document.querySelector('#pdf-check').addEventListener('click', async () => {
  results.replaceChildren();
  const chosen = file.files[0];
  if (!chosen) { tk.setStatus(status, 'Choose a PDF first', 'err'); return; }
  tk.setStatus(status, 'Reading…');

  try {
    const buffer = await chosen.arrayBuffer();
    const text = new TextDecoder('latin1').decode(buffer);
    const found = [];
    const re = /\/ByteRange\s*\[([^\]]*)\]/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      const ranges = match[1].trim().split(/\s+/).map(Number);
      if (ranges.length < 4 || ranges.some(Number.isNaN)) continue;

      const tail = text.slice(match.index, match.index + 400000);
      const contents = tail.match(/\/Contents\s*<([0-9a-fA-F\s]+)>/);
      const subFilter = text.slice(Math.max(0, match.index - 400), match.index).match(/\/SubFilter\s*\/([\w.]+)/);
      const der = contents ? toBytes(contents[1]) : null;

      let algorithm = null;
      let integrity = 'No signature data found';
      let signingTime = null;
      if (der && der.length > 4) {
        const parsed = findDigest(der);
        algorithm = parsed.algorithm;
        signingTime = parsed.signingTime;
        try {
          if (!parsed.messageDigest) throw new Error('no message digest');
          const computed = await digestRanges(buffer, ranges, algorithm || 'SHA-256');
          integrity = hex(computed) === hex(parsed.messageDigest)
            ? 'Intact — the document matches the signature'
            : 'Mismatch — the document changed after signing';
        } catch (error) {
          integrity = `Could not verify (${error.message})`;
        }
      }

      found.push({
        index: found.length + 1,
        ranges,
        algorithm,
        integrity,
        subFilter: subFilter ? subFilter[1] : null,
        name: readLiteral(text, 'Name') || (der ? findName(der, '550403') : null),
        reason: readLiteral(text, 'Reason'),
        location: readLiteral(text, 'Location'),
        signedAt: readLiteral(text, 'M') || signingTime,
      });
    }

    if (found.length === 0) {
      results.innerHTML = '<div class="tool-panel"><p class="tool-hint">No digital signature was found in this PDF.</p></div>';
      tk.setStatus(status, 'No signatures found', 'err');
      return;
    }
    results.replaceChildren(...found.map(card));
    tk.setStatus(status, `${found.length} signature${found.length === 1 ? '' : 's'} found`, 'ok');
  } catch (error) {
    tk.setStatus(status, error.message || 'Could not read the PDF', 'err');
  }
});
