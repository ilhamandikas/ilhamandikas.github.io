// Parse and format phone numbers.
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from '../vendor/phone.js';
const { tk } = window;

const input = document.querySelector('#pp-input');
const country = document.querySelector('#pp-country');
const results = document.querySelector('#pp-results');
const status = document.querySelector('#pp-status');

const regionNames = (() => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }); } catch { return null; }
})();

const options = getCountries()
  .map((code) => ({ code, label: `${regionNames ? regionNames.of(code) || code : code} (+${getCountryCallingCode(code)})` }))
  .sort((a, b) => a.label.localeCompare(b.label));

country.replaceChildren(
  ...options.map(({ code, label }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    if (code === 'US') option.selected = true;
    return option;
  }),
);

function render() {
  results.replaceChildren();
  const raw = input.value.trim();
  if (raw === '') { tk.setStatus(status, ''); return; }
  try {
    const phone = parsePhoneNumberFromString(raw, country.value);
    if (!phone) throw new Error('Could not recognise this number');
    const rows = [
      ['Valid', phone.isValid() ? 'yes' : 'no'],
      ['Possible', phone.isPossible() ? 'yes' : 'no'],
      ['Country', `${regionNames ? regionNames.of(phone.country) || phone.country : phone.country} (${phone.country})`],
      ['Calling code', `+${phone.countryCallingCode}`],
      ['National number', phone.nationalNumber],
      ['E.164', phone.number],
      ['International', phone.formatInternational()],
      ['National', phone.formatNational()],
      ['RFC 3966', phone.getURI()],
      ['Type', phone.getType() || 'unknown'],
    ];
    results.replaceChildren(
      ...rows.map(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'tool-result-row';
        row.innerHTML = `<dt>${key}</dt><dd>${String(value)}</dd>`;
        return row;
      }),
    );
    tk.setStatus(status, phone.isValid() ? 'Valid number' : 'Number recognised but not valid', phone.isValid() ? 'ok' : 'err');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live([input, country], render);
