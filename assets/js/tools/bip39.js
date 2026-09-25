// Generate and validate BIP39 mnemonic phrases.
import { generateMnemonic, validateMnemonic, mnemonicToEntropy, mnemonicToSeedSync, english } from '../vendor/bip39.js';
const { tk } = window;

const strength = document.querySelector('#bip-strength');
const mnemonic = document.querySelector('#bip-mnemonic');
const entropy = document.querySelector('#bip-entropy');
const seed = document.querySelector('#bip-seed');
const status = document.querySelector('#bip-status');
const check = document.querySelector('#bip-check');
const checkStatus = document.querySelector('#bip-check-status');

const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

document.querySelector('#bip-generate').addEventListener('click', () => {
  try {
    const phrase = generateMnemonic(english, Number(strength.value));
    mnemonic.value = phrase;
    entropy.value = toHex(mnemonicToEntropy(phrase, english));
    seed.value = toHex(mnemonicToSeedSync(phrase, ''));
    tk.setStatus(status, `${phrase.split(' ').length} words`, 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
});

function validate() {
  const phrase = check.value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (phrase === '') { tk.setStatus(checkStatus, ''); return; }
  const words = phrase.split(' ');
  const ok = [12, 15, 18, 21, 24].includes(words.length) && validateMnemonic(phrase, english);
  tk.setStatus(checkStatus, ok ? 'Valid mnemonic' : 'Not a valid mnemonic', ok ? 'ok' : 'err');
}

tk.live(check, validate);
