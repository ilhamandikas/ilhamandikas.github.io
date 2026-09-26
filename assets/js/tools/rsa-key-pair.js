// Generate an RSA key pair with WebCrypto, and check whether two pasted keys are
// actually a pair.
import { pemBytes, pkcs8FromPkcs1, spkiFromPkcs1, toPem } from '../pem.js';

const { tk } = window;

const size = document.querySelector('#rsa-size');
const publicArea = document.querySelector('#rsa-public');
const privateArea = document.querySelector('#rsa-private');
const status = document.querySelector('#rsa-status');

const checkPublic = document.querySelector('#rsa-check-public');
const checkPrivate = document.querySelector('#rsa-check-private');
const checkStatus = document.querySelector('#rsa-check-status');

// How the key is used does not change the key material, so any RSA key imports
// under this whatever the pair is actually destined for. SHA-256 is available
// everywhere and is irrelevant to the modulus comparison anyway.
const ALGORITHM = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
const PROBE = new TextEncoder().encode('ilham.dev rsa key pair probe');

document.querySelector('#rsa-generate').addEventListener('click', async () => {
  publicArea.value = '';
  privateArea.value = '';
  tk.setStatus(status, 'Generating…');
  try {
    const pair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: Number(size.value),
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );
    const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
    const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey);
    publicArea.value = toPem(spki, 'PUBLIC KEY');
    privateArea.value = toPem(pkcs8, 'PRIVATE KEY');
    tk.setStatus(status, 'Key pair ready', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

document.querySelector('#rsa-check-fill').addEventListener('click', () => {
  if (publicArea.value === '') {
    tk.setStatus(checkStatus, 'Generate a pair first');
    return;
  }
  checkPublic.value = publicArea.value;
  checkPrivate.value = privateArea.value;
  tk.setStatus(checkStatus, 'Pasted the generated pair — press Check');
});

async function importPrivate(text) {
  const { kind, bytes } = pemBytes(text, 'PRIVATE KEY');
  try {
    return await crypto.subtle.importKey(
      'pkcs8',
      kind === 'RSA PRIVATE KEY' ? pkcs8FromPkcs1(bytes) : bytes,
      ALGORITHM,
      false,
      ['sign'],
    );
  } catch {
    throw new Error('That private key did not parse as RSA — only RSA keys are supported here');
  }
}

async function importPublic(text) {
  const { kind, bytes } = pemBytes(text, 'PUBLIC KEY');
  try {
    return await crypto.subtle.importKey(
      'spki',
      kind === 'RSA PUBLIC KEY' ? spkiFromPkcs1(bytes) : bytes,
      ALGORITHM,
      false,
      ['verify'],
    );
  } catch {
    throw new Error('That public key did not parse as RSA — only RSA keys are supported here');
  }
}

document.querySelector('#rsa-check').addEventListener('click', async () => {
  if (checkPublic.value.trim() === '' || checkPrivate.value.trim() === '') {
    tk.setStatus(checkStatus, 'Paste both keys');
    return;
  }

  tk.setStatus(checkStatus, 'Checking…');
  try {
    const privateKey = await importPrivate(checkPrivate.value);
    const publicKey = await importPublic(checkPublic.value);

    // WebCrypto cannot derive either key from the other, so the only way to ask
    // "are these a pair?" is to sign something and see whether the public key
    // accepts it. A throwaway message is enough; nothing is sent anywhere.
    const signature = await crypto.subtle.sign(ALGORITHM, privateKey, PROBE);
    const ok = await crypto.subtle.verify(ALGORITHM, publicKey, signature, PROBE);

    const publicBits = publicKey.algorithm.modulusLength;
    const privateBits = privateKey.algorithm.modulusLength;
    if (ok) {
      tk.setStatus(checkStatus, `Match — both keys are ${publicBits}-bit and belong to the same pair`, 'ok');
    } else {
      const sizes = privateBits === publicBits ? '' : ` (${privateBits}-bit private key, ${publicBits}-bit public key)`;
      tk.setStatus(checkStatus, `No match — that private key cannot sign for that public key${sizes}`, 'err');
    }
  } catch (error) {
    tk.setStatus(checkStatus, error.message, 'err');
  }
});
