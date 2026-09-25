// Generate an RSA key pair with WebCrypto and export it as PEM.
const { tk } = window;

const size = document.querySelector('#rsa-size');
const publicArea = document.querySelector('#rsa-public');
const privateArea = document.querySelector('#rsa-private');
const status = document.querySelector('#rsa-status');

function toPem(buffer, label) {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const lines = base64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

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
