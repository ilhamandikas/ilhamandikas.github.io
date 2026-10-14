import { decodeCertificates } from './tls-certificate-parser.js';
import example from '../data/tls-certificate-example.js';

const { tk } = window;
const $ = (name) => document.getElementById(`tls-${name}`);
let revision = 0;

export function dateStatus(cert, now = Date.now()) {
  const start = Date.parse(cert.notBefore);
  const end = Date.parse(cert.notAfter);
  if (now < start) return 'Not yet within validity dates (device clock)';
  if (now > end) return 'Expired (device clock)';
  return `Within validity dates — ${Math.floor((end - now) / 86400000)} full days remaining (device clock; not a trust check)`;
}
function report(cert, index, now) {
  return [
    `Certificate ${index + 1}`, '====================',
    `Version: v${cert.version}`, `Serial number (hex): ${cert.serial}`,
    `Subject:\n${cert.subject}`, `Issuer:\n${cert.issuer}`,
    `Not before (UTC): ${cert.notBefore}`, `Not after (UTC): ${cert.notAfter}`,
    `Date status: ${dateStatus(cert, now)}`,
    `Subject Alternative Names:\n${cert.subjectAltNames.join('\n') || '(none)'}`,
    `Public key: ${cert.publicKey}`, `Signature algorithm: ${cert.signatureAlgorithm}`,
    `SHA-256 fingerprint (certificate DER):\n${cert.fingerprint}`,
    `Extensions:\n${cert.extensions.join('\n') || '(none)'}`,
    'Signatures, trust, hostname matches, and revocation have NOT been checked.',
  ].join('\n\n');
}
function invalidate() {
  revision += 1;
  $('output').value = '';
  $('copy').disabled = true;
  $('decode').disabled = false;
  tk.setStatus($('copy-status'), '');
}
$('input').addEventListener('input', () => {
  invalidate();
  tk.setStatus($('status'), 'Input changed. Decode again to update the report.');
});
$('decode').addEventListener('click', async () => {
  invalidate();
  const current = revision;
  $('decode').disabled = true;
  tk.setStatus($('status'), 'Decoding…');
  try {
    const certificates = await decodeCertificates($('input').value);
    if (current !== revision) return;
    const now = Date.now();
    $('output').value = certificates.map((cert, i) => report(cert, i, now)).join('\n\n\n');
    $('copy').disabled = false;
    tk.setStatus($('status'), `${certificates.length} certificate${certificates.length === 1 ? '' : 's'} decoded. Trust has not been verified.`);
  } catch (error) {
    if (current === revision) tk.setStatus($('status'), error.message, 'err');
  } finally {
    if (current === revision) $('decode').disabled = false;
  }
});
$('example').addEventListener('click', () => {
  if ($('input').value && !window.confirm('Replace the input with a self-signed example certificate?')) return;
  invalidate();
  $('input').value = example;
  $('decode').click();
});
$('clear').addEventListener('click', () => {
  invalidate();
  $('input').value = '';
  tk.setStatus($('status'), 'Input and report cleared.');
});
