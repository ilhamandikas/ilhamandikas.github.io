const { tk } = window;

const input = document.querySelector('#gmp-input');
const label = document.querySelector('#gmp-label');
const format = document.querySelector('#gmp-format');
const output = document.querySelector('#gmp-output');
const status = document.querySelector('#gmp-status');

// The pairs Google Maps writes in a share link, in the order they are worth
// trying: the viewport centre first, then the place itself.
const PATTERNS = [
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /[?&](?:q|query|ll|center|destination|daddr|saddr|viewpoint)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
  /\/place\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /^(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)$/,
];

function coordinates(text) {
  for (const pattern of PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  }
  return null;
}

function round(value) {
  return Number(value.toFixed(6));
}

function dms(value, positive, negative) {
  const direction = value >= 0 ? positive : negative;
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minuteFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minuteFloat);
  const seconds = ((minuteFloat - minutes) * 60).toFixed(1);
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

function build(lat, lng, name, kind) {
  const latitude = round(lat);
  const longitude = round(lng);
  if (kind === 'dms') return `${dms(lat, 'N', 'S')}, ${dms(lng, 'E', 'W')}`;
  if (kind === 'json') return JSON.stringify({ label: name, latitude, longitude }, null, 2);
  if (kind === 'csv') return `label,latitude,longitude\n${tk.quoteCell(name)},${latitude},${longitude}`;
  if (kind === 'sql') {
    const escaped = String(name).replace(/'/g, "''");
    return `INSERT INTO places (label, latitude, longitude)\nVALUES ('${escaped}', ${latitude}, ${longitude});`;
  }
  if (kind === 'geojson') {
    return JSON.stringify(
      { type: 'Feature', properties: { label: name }, geometry: { type: 'Point', coordinates: [longitude, latitude] } },
      null,
      2,
    );
  }
  return `${latitude}, ${longitude}`;
}

function render() {
  const text = input.value.trim();
  if (!text) {
    output.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(text)) {
    output.textContent = '';
    tk.setStatus(status, 'A short link cannot be expanded here. Open it once and paste the full link.', 'err');
    return;
  }

  const point = coordinates(text);
  if (!point) {
    output.textContent = '';
    tk.setStatus(status, 'No coordinates found in that link.', 'err');
    return;
  }

  const name = label.value.trim() || 'Location';
  output.textContent = build(point.lat, point.lng, name, format.value);
  tk.setStatus(status, `${round(point.lat)}, ${round(point.lng)}`);
}

tk.live([input, label, format], render);
