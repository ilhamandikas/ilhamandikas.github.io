// PEM and DER plumbing shared by the RSA and JWT tools.
//
// WebCrypto only speaks DER: PKCS#8 for private keys and SPKI for public keys.
// The older PKCS#1 shapes (`BEGIN RSA PRIVATE KEY`, `BEGIN RSA PUBLIC KEY`) are
// still what `openssl genrsa` and `openssl rsa -RSAPublicKey_out` print, and they
// hold exactly the same key material inside a fixed wrapper — so the wrapper is
// rebuilt here rather than refusing the input.
//
// Only two tools need any of this, so it is a module rather than part of
// toolkit.js: esbuild inlines it into their bundles and no other page pays for it.

const raw = (value) => {
  const binary = atob(String(value).replace(/\s+/g, ''));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
};

export function fromBase64(text) {
  try {
    return raw(text);
  } catch {
    throw new Error('That is not valid base64');
  }
}

// One PEM block, as bytes. `expect` is a substring of the label to insist on.
export function pemBytes(text, expect) {
  const source = String(text || '').trim();
  if (source === '') throw new Error('No key given');

  const match = source.match(/-----BEGIN ([A-Z0-9 ]+?)-----([\s\S]*?)-----END \1-----/);
  if (!match) throw new Error('No PEM block found — expected a line like "-----BEGIN PUBLIC KEY-----"');

  const kind = match[1].trim();
  if (expect && !kind.includes(expect)) throw new Error(`Expected a ${expect} block, found "${kind}"`);

  const body = match[2].replace(/\s+/g, '');
  if (body === '') throw new Error('The PEM block is empty');
  const bytes = fromBase64(body);
  if (bytes.length === 0) throw new Error('The PEM block is empty');
  return { kind, bytes };
}

export function toPem(value, label, width = 64) {
  let binary = '';
  new Uint8Array(value).forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const lines = btoa(binary).match(new RegExp(`.{1,${width}}`, 'g')) || [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

// One DER tag-length-value triple. Lengths of 128 and up need the long form,
// where the first length byte says how many bytes the length itself occupies.
const der = (tag, body) => {
  const n = body.length;
  const size = n < 0x80 ? 1 : n < 0x100 ? 2 : n < 0x10000 ? 3 : 4;
  const out = new Uint8Array(1 + size + n);
  out[0] = tag;
  if (size === 1) {
    out[1] = n;
  } else {
    out[1] = 0x80 | (size - 1);
    for (let i = 0; i < size - 1; i += 1) out[2 + i] = (n >>> (8 * (size - 2 - i))) & 0xff;
  }
  out.set(body, 1 + size);
  return out;
};

const join = (...parts) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

// AlgorithmIdentifier for rsaEncryption, always the same fifteen bytes.
const RSA = new Uint8Array([
  0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
]);

// PrivateKeyInfo { version 0, rsaEncryption, OCTET STRING { pkcs1 } }
export const pkcs8FromPkcs1 = (pkcs1) =>
  der(0x30, join(new Uint8Array([0x02, 0x01, 0x00]), RSA, der(0x04, pkcs1)));

// SubjectPublicKeyInfo { rsaEncryption, BIT STRING { unused-bits 0, pkcs1 } }
export const spkiFromPkcs1 = (pkcs1) =>
  der(0x30, join(RSA, der(0x03, join(new Uint8Array([0x00]), pkcs1))));

// Read one DER tag-length-value triple, or null when the bytes are not one.
const readDer = (bytes, at) => {
  if (at + 2 > bytes.length) return null;
  const tag = bytes[at];
  let length = bytes[at + 1];
  let start = at + 2;
  if (length & 0x80) {
    const count = length & 0x7f;
    if (count === 0 || count > 4 || start + count > bytes.length) return null;
    length = 0;
    for (let i = 0; i < count; i += 1) length = length * 256 + bytes[start + i];
    start += count;
  }
  if (start + length > bytes.length) return null;
  return { tag, body: bytes.subarray(start, start + length), end: start + length };
};

// JWS keeps ECDSA signatures as raw R||S, and so does WebCrypto — its sign steps
// say to "convert r to a byte sequence of length n and append it to result".
// OpenSSL and Node's own crypto module print DER instead, so a DER signature is
// normalised to raw here rather than rejected. Raw is exactly 2n bytes, which no
// DER SEQUENCE of these curves can be, so the two shapes never collide.
export function ecdsaToRaw(signature, size) {
  if (signature.length === size * 2) return signature;

  const seq = readDer(signature, 0);
  if (seq && seq.tag === 0x30 && seq.end === signature.length) {
    const r = readDer(seq.body, 0);
    const s = r && readDer(seq.body, r.end);
    if (r && r.tag === 0x02 && s && s.tag === 0x02 && s.end === seq.body.length) {
      // A DER INTEGER is signed, so it may carry a leading zero byte and may be
      // shorter than n. Trim to the real value, then left-pad back to n.
      const pad = (part) => {
        let i = 0;
        while (i < part.length - 1 && part[i] === 0) i += 1;
        const trimmed = part.subarray(i);
        if (trimmed.length > size) throw new Error('That ECDSA signature is too big for this curve');
        const out = new Uint8Array(size);
        out.set(trimmed, size - trimmed.length);
        return out;
      };
      return join(pad(r.body), pad(s.body));
    }
  }

  throw new Error(`Expected a ${size * 2}-byte ECDSA signature, got ${signature.length}`);
}
