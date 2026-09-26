// The JWS algorithms WebCrypto can do, and the two operations over them.
//
// Only two pages need this — the JWT Parser checks signatures, the JWT Token
// Editor makes them — so it is a module rather than part of toolkit.js: esbuild
// inlines it into those two bundles and no other page pays for it.
//
// Only the mechanism lives here. Which algorithm to trust, when to refuse and
// what to say are policy, and they are different in the two tools, so they stay
// in the tools.
import { ecdsaToRaw, fromBase64, pemBytes, pkcs8FromPkcs1, spkiFromPkcs1 } from './pem.js';

// HS* take the shared secret as raw UTF-8 bytes; everything else takes a PEM key.
// `size` is the length of each half of an ECDSA signature in bytes, which is what
// JWS stores as one raw R||S blob.
export const ALGORITHMS = {
  HS256: { kind: 'hmac', hash: 'SHA-256' },
  HS384: { kind: 'hmac', hash: 'SHA-384' },
  HS512: { kind: 'hmac', hash: 'SHA-512' },
  RS256: { kind: 'rsa', name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  RS384: { kind: 'rsa', name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-384' },
  RS512: { kind: 'rsa', name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-512' },
  PS256: { kind: 'rsa', name: 'RSA-PSS', hash: 'SHA-256', saltLength: 32 },
  PS384: { kind: 'rsa', name: 'RSA-PSS', hash: 'SHA-384', saltLength: 48 },
  PS512: { kind: 'rsa', name: 'RSA-PSS', hash: 'SHA-512', saltLength: 64 },
  ES256: { kind: 'ec', namedCurve: 'P-256', hash: 'SHA-256', size: 32 },
  ES384: { kind: 'ec', namedCurve: 'P-384', hash: 'SHA-384', size: 48 },
  ES512: { kind: 'ec', namedCurve: 'P-521', hash: 'SHA-512', size: 66 },
};

// base64url of raw bytes. tk.b64encode takes text and would mangle a binary
// signature, so this one stays byte-level.
export function b64url(bytes) {
  let binary = '';
  new Uint8Array(bytes).forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// base64url text back to bytes, tolerant of missing padding. Goes through pem's
// fromBase64 so a bad character gives the same sentence here as everywhere else.
export function unb64url(value) {
  const v = String(value).replace(/-/g, '+').replace(/_/g, '/');
  return fromBase64(v + '='.repeat((4 - (v.length % 4)) % 4));
}

export function decodePart(part) {
  return JSON.parse(new TextDecoder().decode(unb64url(part)));
}

// HMAC takes the secret as bytes. Callers decide whether those bytes are the text
// the user typed or the base64 of a secret that another system printed.
function secretBytes(text, isBase64) {
  if (text.trim() === '') throw new Error('Paste the shared secret');
  return isBase64 ? fromBase64(text) : new TextEncoder().encode(text);
}

function rsaParams(spec) {
  return spec.name === 'RSA-PSS' ? { name: 'RSA-PSS', saltLength: spec.saltLength } : { name: spec.name };
}

// A private key is PKCS#8. The older PKCS#1 wrapper holds the same key material
// and is rebuilt here; a SEC1 EC key is a different wrapper with the curve name
// buried inside, so it is refused with the one command that fixes it.
function privateKeyBytes(text) {
  const { kind, bytes } = pemBytes(text, 'PRIVATE KEY');
  if (kind === 'EC PRIVATE KEY') {
    throw new Error('That is a SEC1 EC key — convert it with: openssl pkcs8 -topk8 -nocrypt -in key.pem');
  }
  return kind === 'RSA PRIVATE KEY' ? pkcs8FromPkcs1(bytes) : bytes;
}

export async function sign(spec, keyText, data, { secretIsBase64 = false } = {}) {
  if (spec.kind === 'hmac') {
    const key = await crypto.subtle.importKey('raw', secretBytes(keyText, secretIsBase64), { name: 'HMAC', hash: spec.hash }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
  }
  if (spec.kind === 'rsa') {
    const key = await crypto.subtle.importKey('pkcs8', privateKeyBytes(keyText), { name: spec.name, hash: spec.hash }, false, ['sign']);
    return new Uint8Array(await crypto.subtle.sign(rsaParams(spec), key, data));
  }
  const key = await crypto.subtle.importKey('pkcs8', privateKeyBytes(keyText), { name: 'ECDSA', namedCurve: spec.namedCurve }, false, ['sign']);
  // WebCrypto already returns raw R||S here — its sign steps say to pad r and s to
  // the curve size and append one to the other — so unlike the verify direction
  // there is nothing to normalise on the way out.
  return new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: spec.hash }, key, data));
}

export async function verify(spec, keyText, signature, data) {
  if (spec.kind === 'hmac') {
    const key = await crypto.subtle.importKey('raw', secretBytes(keyText, false), { name: 'HMAC', hash: spec.hash }, false, ['verify']);
    return crypto.subtle.verify('HMAC', key, signature, data);
  }
  if (spec.kind === 'rsa') {
    const { kind, bytes } = pemBytes(keyText, 'PUBLIC KEY');
    const key = await crypto.subtle.importKey(
      'spki',
      kind === 'RSA PUBLIC KEY' ? spkiFromPkcs1(bytes) : bytes,
      { name: spec.name, hash: spec.hash },
      false,
      ['verify'],
    );
    return crypto.subtle.verify(rsaParams(spec), key, signature, data);
  }
  const { bytes } = pemBytes(keyText, 'PUBLIC KEY');
  const key = await crypto.subtle.importKey('spki', bytes, { name: 'ECDSA', namedCurve: spec.namedCurve }, false, ['verify']);
  return crypto.subtle.verify({ name: 'ECDSA', hash: spec.hash }, key, ecdsaToRaw(signature, spec.size), data);
}
