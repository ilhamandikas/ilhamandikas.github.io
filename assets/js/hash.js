// Shared hashing primitives.
//
// The SHA family comes from WebCrypto; MD5 does not exist there and never will, so
// it is implemented here from RFC 1321. Two tools need the same MD5 — one hashes
// text, one hashes a file — so it lives in a module rather than being written twice.
//
// Every function takes bytes, not text. A file has no encoding, and a tool that
// hashed the result of decoding a binary file as UTF-8 would produce a digest that
// matches nothing anyone else computes.

const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);

export const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

// RFC 1321. The message is padded to a multiple of 64 bytes, the length is written
// into the last 8 bytes little-endian, and the state is four 32-bit words.
export function md5(input) {
  const msg = input instanceof Uint8Array ? input : new Uint8Array(input);
  const bitLen = msg.length * 8;
  const withOne = msg.length + 1;
  const padLen = (56 - (withOne % 64) + 64) % 64;
  const total = withOne + padLen + 8;

  const buffer = new Uint8Array(total);
  buffer.set(msg);
  buffer[msg.length] = 0x80;
  const view = new DataView(buffer.buffer);
  view.setUint32(total - 8, bitLen >>> 0, true);
  view.setUint32(total - 4, Math.floor(bitLen / 4294967296), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const M = new Array(16);
  for (let chunk = 0; chunk < total; chunk += 64) {
    for (let j = 0; j < 16; j += 1) M[j] = view.getUint32(chunk + j * 4, true);

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      f = (f + a + MD5_K[i] + M[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + (((f << MD5_S[i]) | (f >>> (32 - MD5_S[i]))) >>> 0)) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const le = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
  return toHex([...le(a0), ...le(b0), ...le(c0), ...le(d0)]);
}

export const SHA = { sha1: 'SHA-1', sha256: 'SHA-256', sha512: 'SHA-512' };

export async function sha(algorithm, bytes) {
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return toHex(new Uint8Array(digest));
}

// A `sha256sum` line is `hex  filename`, a vendor page might write
// `SHA256 (file.iso) = hex`, and a person pastes the bare hex. Rather than parse
// three formats, find every long hex run and let the comparison decide.
export function expectedHashes(value) {
  return (value.toLowerCase().match(/[a-f0-9]{32,128}/g) || []).filter(Boolean);
}
