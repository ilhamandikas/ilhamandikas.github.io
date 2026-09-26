import { ID_CITIES, ID_DISTRICTS, ID_PROVINCES } from '../data/id-regions.js';

const { tk } = window;

const input = document.querySelector('#nik-input');
const status = document.querySelector('#nik-status');
const results = document.querySelector('#nik-results');

function row(label, value) {
  const dt = document.createElement('dt');
  const dd = document.createElement('dd');
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  dt.textContent = label;
  dd.textContent = value || '—';
  wrap.append(dt, dd);
  return wrap;
}

function dotted(code) {
  if (code.length === 2) return code;
  if (code.length === 4) return `${code.slice(0, 2)}.${code.slice(2)}`;
  if (code.length === 6) return `${code.slice(0, 2)}.${code.slice(2, 4)}.${code.slice(4)}`;
  return code;
}

function dateFromNik(dayCode, month, year2) {
  const day = dayCode > 40 ? dayCode - 40 : dayCode;
  const now = new Date();
  const currentYY = now.getFullYear() % 100;
  const year = Number(year2) <= currentYY ? 2000 + Number(year2) : 1900 + Number(year2);
  const date = new Date(year, Number(month) - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== Number(month) - 1 || date.getDate() !== day) return null;
  return { date, day, year };
}

function age(date) {
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const beforeBirthday = now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) years -= 1;
  return years;
}

function render() {
  const nik = input.value.replace(/\D/g, '').slice(0, 16);
  if (input.value !== nik) input.value = nik;
  results.replaceChildren();

  if (nik.length !== 16) {
    tk.setStatus(status, 'Enter exactly 16 digits of the NIK.', nik.length ? 'err' : '');
    return;
  }

  const provinceCode = nik.slice(0, 2);
  const cityCode = nik.slice(0, 4);
  const districtCode = nik.slice(0, 6);
  const encodedDay = Number(nik.slice(6, 8));
  const month = nik.slice(8, 10);
  const year2 = nik.slice(10, 12);
  const serial = nik.slice(12, 16);
  const born = dateFromNik(encodedDay, month, year2);
  const isFemale = encodedDay > 40;
  const gender = isFemale ? 'Female' : 'Male';
  const province = ID_PROVINCES[provinceCode] || 'Unknown province code';
  const city = ID_CITIES[cityCode] || 'Unknown regency/city code';
  const district = ID_DISTRICTS[districtCode] || 'Unknown district code';

  const errors = [];
  if (!ID_PROVINCES[provinceCode]) errors.push('province code not found');
  if (!ID_CITIES[cityCode]) errors.push('regency/city code not found');
  if (!ID_DISTRICTS[districtCode]) errors.push('district code not found');
  if (!born) errors.push('invalid birth date');
  tk.setStatus(
    status,
    errors.length ? `NIK parsed with warnings: ${errors.join(', ')}.` : 'NIK parsed successfully.',
    errors.length ? 'err' : 'ok',
  );

  results.append(
    row('Clean NIK', nik),
    row('Province code', provinceCode),
    row('Province name', province),
    row('Regency/city code', cityCode),
    row('Regency/city name', city),
    row('District code', districtCode),
    row('District name', district),
    row('Full region code', `${dotted(provinceCode)} / ${dotted(cityCode)} / ${dotted(districtCode)}`),
    row(
      'Gender',
      `${gender} — the birth day code ${nik.slice(6, 8)} is ${
        isFemale ? 'above 40, so 40 is subtracted to get the real day' : 'not above 40'
      }.`,
    ),
    row(
      'Birth date',
      born ? born.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Invalid',
    ),
    row('Age', born ? `${age(born.date)} years` : '—'),
    row('Serial number', serial),
  );
}

tk.live([input], render);
render();
