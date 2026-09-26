// IBAN validation using the ISO 13616 mod-97 check.
const { tk } = window;

const LENGTHS = {
  AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BE: 16, BA: 20, BR: 29, BG: 22, CR: 22,
  HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28, EE: 20, FO: 18, FI: 18, FR: 27, GE: 22,
  DE: 22, GI: 23, GR: 27, GL: 18, GT: 28, HU: 28, IS: 26, IE: 22, IL: 23, IT: 27,
  JO: 30, KZ: 20, XK: 20, KW: 30, LV: 21, LB: 28, LI: 21, LT: 20, LU: 20, MT: 31,
  MR: 27, MU: 30, MD: 24, MC: 27, ME: 22, NL: 18, MK: 19, NO: 15, PK: 24, PS: 29,
  PL: 28, PT: 25, QA: 29, RO: 24, LC: 32, SM: 27, SA: 24, RS: 22, SK: 24, SI: 19,
  ES: 24, SE: 24, CH: 21, TN: 24, TR: 26, AE: 23, GB: 22, VA: 22, VG: 24,
};

const input = document.querySelector('#iban-input');
const results = document.querySelector('#iban-results');
const status = document.querySelector('#iban-status');

function mod97(value) {
  let remainder = 0;
  for (const ch of value) remainder = (remainder * 10 + Number(ch)) % 97;
  return remainder;
}

function check(raw) {
  const iban = raw.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) throw new Error('Not a valid IBAN shape');
  const country = iban.slice(0, 2);
  const expected = LENGTHS[country];
  if (!expected) throw new Error(`Unknown country code "${country}"`);
  if (iban.length !== expected) throw new Error(`Expected ${expected} characters for ${country}, got ${iban.length}`);

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  if (mod97(numeric) !== 1) throw new Error('Checksum failed — the IBAN is not valid');

  return {
    iban,
    country,
    checkDigits: iban.slice(2, 4),
    bban: iban.slice(4),
    formatted: iban.replace(/(.{4})/g, '$1 ').trim(),
  };
}

function render() {
  results.replaceChildren();
  const raw = input.value.trim();
  if (raw === '') { tk.setStatus(status, ''); return; }
  try {
    const info = check(raw);
    const rows = [
      ['Country', info.country],
      ['Check digits', info.checkDigits],
      ['BBAN', info.bban],
      ['Length', info.iban.length],
      ['Formatted', info.formatted],
    ];
    results.replaceChildren(
      ...rows.map(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'tool-result-row';
        row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
        return row;
      }),
    );
    tk.setStatus(status, 'Valid IBAN', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live(input, render);
