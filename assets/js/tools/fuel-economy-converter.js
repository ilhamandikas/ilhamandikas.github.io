// Fuel economy converter: one figure in, the same figure in every common unit.
const { tk } = window;

const els = {
  value: document.querySelector('#fec-value'),
  unit: document.querySelector('#fec-unit'),
  out: document.querySelector('#fec-out'),
  status: document.querySelector('#fec-status'),
};

// Every unit is defined by how it turns into km/L, the pivot. The inverse
// functions are exact, not approximations, so a value and its round trip match.
const FACTORS = {
  kmpl: { label: 'km/L', toKmpl: (v) => v, fromKmpl: (v) => v },
  l100: { label: 'L/100 km', toKmpl: (v) => 100 / v, fromKmpl: (v) => 100 / v },
  mpgus: { label: 'MPG (US)', toKmpl: (v) => v / 2.352145833, fromKmpl: (v) => v * 2.352145833 },
  mpguk: { label: 'MPG (UK)', toKmpl: (v) => v / 2.824809, fromKmpl: (v) => v * 2.824809 },
};

const UNITS = Object.keys(FACTORS);

function format(value) {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 1000) / 1000;
  return String(rounded);
}

function row(key, text, active) {
  const tr = document.createElement('tr');
  if (active) tr.className = 'is-active';
  const th = document.createElement('th');
  th.scope = 'row';
  th.textContent = FACTORS[key].label;
  const td = document.createElement('td');
  td.textContent = text;
  tr.append(th, td);
  els.out.appendChild(tr);
}

function render() {
  const raw = els.value.value.trim();
  const value = Number(raw);
  const unit = els.unit.value;
  els.out.replaceChildren();

  const blank = (message, state) => {
    UNITS.forEach((key) => row(key, '—', key === unit));
    tk.setStatus(els.status, message, state);
  };

  if (raw === '' || !Number.isFinite(value)) {
    blank('', '');
    return;
  }
  if (value <= 0) {
    blank('Enter a value greater than zero.', 'err');
    return;
  }

  const kmpl = FACTORS[unit].toKmpl(value);
  if (!Number.isFinite(kmpl) || kmpl <= 0) {
    blank('That value is outside the range this converter can represent.', 'err');
    return;
  }

  UNITS.forEach((key) => row(key, format(FACTORS[key].fromKmpl(kmpl)), key === unit));
  tk.setStatus(els.status, 'Converted locally — nothing left your browser.', 'ok');
}

tk.live([els.value, els.unit], render);
