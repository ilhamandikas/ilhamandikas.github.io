// Image metadata — read what a photo carries besides the picture.
//
// Everything is parsed from the bytes in the page: the JPEG marker segments, the
// PNG chunk list, the GIF extensions and the WebP RIFF chunks, and then the TIFF
// block that JPEG, PNG and WebP all use to carry EXIF. No library and no upload,
// which matters here more than usual — the whole point of the tool is that a file
// is not always only a picture, and handing it to a server to find out would be a
// strange way to make that point.
const { tk } = window;

const fileInput = document.querySelector('#img-file');
const drop = document.querySelector('#img-drop');
const status = document.querySelector('#img-status');
const results = document.querySelector('#img-results');
const preview = document.querySelector('#img-preview');
const summary = document.querySelector('#img-summary');
const jsonOut = document.querySelector('#img-json');

let current = null;

/* ---------- EXIF tag names ---------- */

const IFD0 = {
  0x010e: 'Image description', 0x010f: 'Camera make', 0x0110: 'Camera model', 0x0112: 'Orientation',
  0x011a: 'X resolution', 0x011b: 'Y resolution', 0x0128: 'Resolution unit', 0x0131: 'Software',
  0x0132: 'File changed', 0x013b: 'Artist', 0x013e: 'White point', 0x013f: 'Primary chromaticities',
  0x0211: 'YCbCr coefficients', 0x0213: 'YCbCr position', 0x0214: 'Reference black/white',
  0x8298: 'Copyright', 0x8769: 'Exif sub-block', 0x8825: 'GPS block', 0xa005: 'Interoperability block',
  0xc4a5: 'Print image matching',
};

const EXIF = {
  0x829a: 'Exposure time', 0x829d: 'Aperture', 0x8822: 'Exposure program', 0x8824: 'Spectral sensitivity',
  0x8827: 'ISO speed', 0x8828: 'OECF', 0x8830: 'Sensitivity type', 0x8831: 'Standard output sensitivity',
  0x8832: 'Recommended exposure index', 0x8833: 'ISO speed (raw)', 0x9000: 'Exif version',
  0x9003: 'Taken', 0x9004: 'Digitised', 0x9010: 'Offset time', 0x9011: 'Offset time (original)',
  0x9012: 'Offset time (digitised)', 0x9101: 'Components', 0x9102: 'Compression (bits per pixel)',
  0x9201: 'Shutter speed', 0x9202: 'Aperture value', 0x9203: 'Brightness', 0x9204: 'Exposure bias',
  0x9205: 'Max aperture', 0x9206: 'Subject distance', 0x9207: 'Metering mode', 0x9208: 'Light source',
  0x9209: 'Flash', 0x920a: 'Focal length', 0x9214: 'Subject area', 0x927c: 'Maker note',
  0x9286: 'User comment', 0x9290: 'Sub-second time', 0x9291: 'Sub-second time (original)',
  0x9292: 'Sub-second time (digitised)', 0xa000: 'FlashPix version', 0xa001: 'Colour space',
  0xa002: 'Width', 0xa003: 'Height', 0xa004: 'Related sound file', 0xa20e: 'Focal plane X',
  0xa20f: 'Focal plane Y', 0xa210: 'Focal plane unit', 0xa214: 'Subject location',
  0xa215: 'Exposure index', 0xa217: 'Sensing method', 0xa300: 'File source', 0xa301: 'Scene type',
  0xa302: 'Colour filter array', 0xa401: 'Custom rendering', 0xa402: 'Exposure mode',
  0xa403: 'White balance', 0xa404: 'Digital zoom', 0xa405: 'Focal length in 35 mm',
  0xa406: 'Scene capture type', 0xa407: 'Gain control', 0xa408: 'Contrast', 0xa409: 'Saturation',
  0xa40a: 'Sharpness', 0xa40b: 'Device setting', 0xa40c: 'Subject distance range',
  0xa420: 'Image id', 0xa430: 'Camera owner', 0xa431: 'Body serial number', 0xa432: 'Lens',
  0xa433: 'Lens make', 0xa434: 'Lens model', 0xa435: 'Lens serial number', 0xa460: 'Composite image',
};

const GPS = {
  0x0000: 'Version', 0x0001: 'Latitude ref', 0x0002: 'Latitude', 0x0003: 'Longitude ref',
  0x0004: 'Longitude', 0x0005: 'Altitude ref', 0x0006: 'Altitude', 0x0007: 'Time (UTC)',
  0x0008: 'Satellites', 0x0009: 'Status', 0x000a: 'Mode', 0x000b: 'Measure mode',
  0x000c: 'Speed', 0x000d: 'Speed ref', 0x000e: 'Track', 0x000f: 'Track ref',
  0x0010: 'Direction ref', 0x0011: 'Direction', 0x0012: 'Map datum', 0x0013: 'Destination ref',
  0x0014: 'Destination', 0x0015: 'Bearing ref', 0x0016: 'Bearing', 0x0017: 'Distance ref',
  0x0018: 'Distance', 0x001d: 'Date', 0x001f: 'Time (full)',
};

const ORIENTATION = {
  1: 'Normal', 2: 'Mirrored left to right', 3: 'Rotated 180°', 4: 'Mirrored top to bottom',
  5: 'Mirrored, then rotated 90° clockwise', 6: 'Rotated 90° clockwise',
  7: 'Mirrored, then rotated 90° anticlockwise', 8: 'Rotated 90° anticlockwise',
};

const FLASH = (value) => {
  const names = { 0: 'Did not fire', 1: 'Fired', 5: 'Fired, no return detected', 7: 'Fired, return detected', 9: 'Fired, forced', 13: 'Fired, forced, no return', 15: 'Fired, forced, return detected', 16: 'Did not fire, forced', 24: 'Did not fire, auto', 25: 'Fired, auto', 29: 'Fired, auto, no return', 31: 'Fired, auto, return detected', 32: 'No flash function' };
  return names[value] || `Code ${value}`;
};

const SENSING = { 1: 'Undefined', 2: 'One-chip colour area', 3: 'Two-chip colour area', 4: 'Three-chip colour area', 5: 'Colour sequential area', 7: 'Trilinear', 8: 'Colour sequential linear' };
const METERING = { 0: 'Unknown', 1: 'Average', 2: 'Centre-weighted average', 3: 'Spot', 4: 'Multi-spot', 5: 'Pattern', 6: 'Partial', 255: 'Other' };
const EXPOSURE_PROGRAM = { 0: 'Not defined', 1: 'Manual', 2: 'Program', 3: 'Aperture priority', 4: 'Shutter priority', 5: 'Creative', 6: 'Action', 7: 'Portrait', 8: 'Landscape' };
const LIGHT_SOURCE = { 0: 'Unknown', 1: 'Daylight', 2: 'Fluorescent', 3: 'Tungsten', 4: 'Flash', 9: 'Fine weather', 10: 'Cloudy', 11: 'Shade', 12: 'Daylight fluorescent', 13: 'Day white fluorescent', 14: 'Cool white fluorescent', 15: 'White fluorescent', 17: 'Standard light A', 18: 'Standard light B', 19: 'Standard light C', 20: 'D55', 21: 'D65', 22: 'D75', 23: 'D50', 24: 'ISO studio tungsten', 255: 'Other' };
const COLOUR_SPACE = { 1: 'sRGB', 2: 'Adobe RGB', 0xffff: 'Uncalibrated' };
const WHITE_BALANCE = { 0: 'Auto', 1: 'Manual' };
const SCENE = { 0: 'Standard', 1: 'Landscape', 2: 'Portrait', 3: 'Night' };
const RESOLUTION_UNIT = { 1: 'No unit', 2: 'inches', 3: 'centimetres' };

/* ---------- the TIFF block, which is where EXIF lives ---------- */

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };

function tiffReader(view, start) {
  const order = view.getUint16(start, false);
  if (order !== 0x4949 && order !== 0x4d4d) throw new Error('no TIFF header');
  const little = order === 0x4949;
  if (view.getUint16(start + 2, little) !== 0x002a) throw new Error('no TIFF header');

  const u16 = (at) => view.getUint16(at, little);
  const u32 = (at) => view.getUint32(at, little);
  const i32 = (at) => view.getInt32(at, little);

  function value(at, type, count) {
    const size = (TYPE_SIZE[type] || 1) * count;
    // Four bytes or fewer live inside the entry's own value field, which always
    // starts at the first byte of those four — the byte order only decides how to
    // read it, not where it sits. Getting this backwards shifts every short string
    // and every small integer by two bytes.
    const base = size <= 4 ? at : start + u32(at);
    const items = [];
    for (let i = 0; i < count; i += 1) {
      const p = base + i * (TYPE_SIZE[type] || 1);
      switch (type) {
        case 1: case 7: items.push(view.getUint8(p)); break;
        case 2: items.push(String.fromCharCode(view.getUint8(p))); break;
        case 3: items.push(u16(p)); break;
        case 4: items.push(u32(p)); break;
        case 5: items.push([u32(p), u32(p + 4)]); break;
        case 6: items.push(view.getInt8(p)); break;
        case 8: items.push(view.getInt16(p, little)); break;
        case 9: items.push(i32(p)); break;
        case 10: items.push([i32(p), i32(p + 4)]); break;
        case 11: items.push(view.getFloat32(p, little)); break;
        case 12: items.push(view.getFloat64(p, little)); break;
        default: items.push(view.getUint8(p));
      }
    }
    if (type === 2) return items.join('').replace(/\0+$/, '');
    return items;
  }

  function ifd(offset, names) {
    if (offset <= 0 || offset + 2 > view.byteLength - start) return { entries: [], next: 0 };
    const at = start + offset;
    const count = u16(at);
    const entries = [];
    for (let i = 0; i < count; i += 1) {
      const entry = at + 2 + i * 12;
      if (entry + 12 > view.byteLength) break;
      const tag = u16(entry);
      const type = u16(entry + 2);
      const many = u32(entry + 4);
      // A corrupt or hostile file can claim a huge count; reading it would walk
      // off the end of the buffer, so it is capped by what could possibly fit.
      if (many > 4096) continue;
      let items;
      try {
        items = value(entry + 8, type, many);
      } catch {
        continue;
      }
      entries.push({ tag, type, count: many, items, name: names[tag] || `Unknown tag 0x${tag.toString(16).padStart(4, '0')}` });
    }
    return { entries, next: offset + 2 + count * 12 + 4 <= view.byteLength - start ? u32(at + 2 + count * 12) : 0 };
  }

  return { little, ifd, u32, start };
}

const ratio = (pair) => (Array.isArray(pair) && pair[1] !== 0 ? pair[0] / pair[1] : null);

// Tag-specific formatting, because "1/250" reads better than "0.004" and "f/2.8"
// better than "2.8".
function present(entry) {
  const { name, items, type } = entry;
  const one = items[0];
  const first = Array.isArray(one) ? ratio(one) : one;

  switch (name) {
    case 'Exposure time': {
      const seconds = ratio(one);
      if (seconds === null) break;
      return seconds >= 1 ? `${Number(seconds.toFixed(2))} s` : `1/${Math.round(1 / seconds)} s`;
    }
    case 'Aperture':
    case 'Aperture value':
    case 'Max aperture':
      return first === null ? null : `f/${first.toFixed(1)}`;
    case 'Focal length':
      return first === null ? null : `${Number(first.toFixed(2))} mm`;
    case 'Focal length in 35 mm':
      return `${one} mm`;
    case 'Exposure bias': {
      const value = ratio(one);
      return value === null ? null : `${value > 0 ? '+' : ''}${Number(value.toFixed(2))} EV`;
    }
    case 'Shutter speed': {
      const value = ratio(one);
      return value === null ? null : `2^${Number(value.toFixed(2))}`;
    }
    case 'Subject distance':
      return first === null ? null : `${Number(first.toFixed(2))} m`;
    case 'Orientation':
      return ORIENTATION[one] || `Code ${one}`;
    case 'Flash':
      return FLASH(one);
    case 'Sensing method':
      return SENSING[one] || `Code ${one}`;
    case 'Metering mode':
      return METERING[one] || `Code ${one}`;
    case 'Exposure program':
      return EXPOSURE_PROGRAM[one] || `Code ${one}`;
    case 'Light source':
      return LIGHT_SOURCE[one] || `Code ${one}`;
    case 'Colour space':
      return COLOUR_SPACE[one] || `Code ${one}`;
    case 'White balance':
      return WHITE_BALANCE[one] || `Code ${one}`;
    case 'Scene capture type':
      return SCENE[one] || `Code ${one}`;
    case 'Resolution unit':
    case 'Focal plane unit':
      return RESOLUTION_UNIT[one] || `Code ${one}`;
    case 'Exif version':
    case 'FlashPix version':
      return items.map((code) => String.fromCharCode(code)).join('');
    case 'Maker note':
      return `${items.length} bytes, kept private by the camera maker`;
    case 'User comment': {
      // The first 8 bytes name the encoding; anything else is guesswork.
      const head = items.slice(0, 8).map((code) => String.fromCharCode(code)).join('').replace(/\0/g, '');
      const body = items.slice(8);
      const text = body.map((code) => String.fromCharCode(code)).join('').replace(/\0+$/, '').trim();
      return text === '' ? `${items.length} bytes` : `${text}${head && head !== 'ASCII' ? ` (${head})` : ''}`;
    }
    case 'Latitude':
    case 'Longitude': {
      const [d, m, s] = items.map(ratio);
      if (d === null || m === null || s === null) break;
      return `${d}° ${m}′ ${Number(s.toFixed(3))}″`;
    }
    case 'Altitude':
      return first === null ? null : `${Number(first.toFixed(1))} m`;
    case 'Time (UTC)':
    case 'Time (full)': {
      const [h, m, s] = items.map(ratio);
      if (h === null || m === null || s === null) break;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.round(s)).padStart(2, '0')} UTC`;
    }
    case 'Lens':
      return items.map((item) => (ratio(item) === null ? item : Number(ratio(item).toFixed(1)))).join(' – ');
    default:
      break;
  }

  if (type === 5 || type === 10) return items.map((item) => (ratio(item) === null ? '?' : Number(ratio(item).toFixed(4)))).join(', ');
  if (Array.isArray(items)) return items.length === 1 ? String(items[0]) : items.join(', ');
  return String(items);
}

// The two coordinates are stored in separate tags with separate refs, so the sign
// only exists once they are read together.
function coordinates(entries) {
  const get = (name) => entries.find((entry) => entry.name === name);
  const lat = get('Latitude');
  const lon = get('Longitude');
  if (!lat || !lon) return null;
  // A missing or zero denominator is a real possibility in a hand-edited file, and
  // dividing by it gives NaN — which then travels all the way into a map URL.
  const degrees = (entry) => {
    const parts = entry.items.map(ratio);
    if (parts.length < 3 || parts.some((part) => part === null || !Number.isFinite(part))) return null;
    const [d, m, s] = parts;
    return d + m / 60 + s / 3600;
  };
  const latDegrees = degrees(lat);
  const lonDegrees = degrees(lon);
  if (latDegrees === null || lonDegrees === null) return null;
  const latRef = get('Latitude ref');
  const lonRef = get('Longitude ref');
  const south = Boolean(latRef) && String(latRef.items[0]).toUpperCase() === 'S';
  const west = Boolean(lonRef) && String(lonRef.items[0]).toUpperCase() === 'W';
  return { lat: south ? -latDegrees : latDegrees, lon: west ? -lonDegrees : lonDegrees };
}

/* ---------- per-format readers ---------- */

function readJpeg(view) {
  const sections = [];
  let at = 2;
  while (at + 4 < view.byteLength) {
    if (view.getUint8(at) !== 0xff) break;
    const marker = view.getUint8(at + 1);
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      at += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break; // image data starts here
    const length = view.getUint16(at + 2, false);
    if (length < 2) break;
    const body = at + 4;
    const size = length - 2;

    if (marker === 0xe0 && size >= 5 && String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + body, 4)) === 'JFIF') {
      sections.push({ title: 'JFIF', rows: [['Version', `${view.getUint8(body + 5)}.${view.getUint8(body + 6)}`]] });
    }
    if (marker === 0xe1 && size >= 6) {
      const head = String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + body, 6));
      if (head === 'Exif\0\0') sections.push(...readExif(view, body + 6));
      else if (head.startsWith('http')) sections.push({ title: 'XMP', rows: [['Note', 'an XMP packet is present but not decoded here']] });
    }
    if (marker === 0xe2 && size >= 12 && String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + body + 0, 11)) === 'ICC_PROFILE') {
      sections.push({ title: 'Colour profile', rows: [['ICC profile', `${size} bytes of embedded colour data`]] });
    }
    if (marker === 0xfe) {
      const text = new TextDecoder().decode(new Uint8Array(view.buffer, view.byteOffset + body, size));
      sections.push({ title: 'Comment', rows: [['Comment', text]] });
    }
    if (marker === 0xed) {
      sections.push({ title: 'Photoshop', rows: [['Photoshop block', `${size} bytes`]] });
    }
    at = body + size;
  }
  return sections;
}

function readExif(view, at) {
  const reader = tiffReader(view, at);
  const sections = [];
  const seen = new Set();

  const walk = (offset, names, title) => {
    if (seen.has(offset) || offset <= 0) return [];
    seen.add(offset);
    const { entries, next } = reader.ifd(offset, names);
    const rows = [];
    let exifAt = 0;
    let gpsAt = 0;
    for (const entry of entries) {
      if (entry.name === 'Exif sub-block') exifAt = entry.items[0];
      else if (entry.name === 'GPS block') gpsAt = entry.items[0];
      else if (entry.name === 'Interoperability block') continue;
      else rows.push([entry.name, present(entry)]);
    }
    if (rows.length > 0) {
      // The finished pair rides along on the section, because by the time the
      // renderer sees `rows` the tag numbers are gone and all that is left is text.
      sections.push({ title, rows, raw: entries.filter((entry) => entry.name.startsWith('Unknown')), coords: coordinates(entries) });
    }
    if (exifAt) walk(exifAt, EXIF, 'Exposure and camera');
    if (gpsAt) walk(gpsAt, GPS, 'Location');
    return { next, entries };
  };

  // The header's first four bytes after the magic are the offset of IFD0, and every
  // offset inside a TIFF block is relative to the block, not to the file. `u32` is
  // the raw view reader, so the base has to be added by hand here.
  const first = walk(reader.u32(reader.start + 4), IFD0, 'Image');
  if (first.next) {
    const thumb = reader.ifd(first.next, IFD0);
    if (thumb.entries.length > 0) {
      sections.push({
        title: 'Thumbnail',
        rows: thumb.entries.filter((entry) => !entry.name.startsWith('Unknown')).map((entry) => [entry.name, present(entry)]),
      });
    }
  }
  return sections;
}

function readPng(view) {
  const sections = [];
  const rows = [];
  let at = 8;
  const text = [];
  while (at + 8 <= view.byteLength) {
    const length = view.getUint32(at, false);
    const type = String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + at + 4, 4));
    const body = at + 8;
    if (length > view.byteLength - body) break;

    if (type === 'IHDR') {
      const colour = { 0: 'greyscale', 2: 'truecolour', 3: 'indexed', 4: 'greyscale + alpha', 6: 'truecolour + alpha' };
      rows.push(
        ['Width', `${view.getUint32(body, false)} px`],
        ['Height', `${view.getUint32(body + 4, false)} px`],
        ['Bit depth', String(view.getUint8(body + 8))],
        ['Colour type', colour[view.getUint8(body + 9)] || `Code ${view.getUint8(body + 9)}`],
        ['Interlaced', view.getUint8(body + 12) === 0 ? 'No' : 'Adam7'],
      );
    }
    if (type === 'pHYs') {
      const x = view.getUint32(body, false);
      const y = view.getUint32(body + 4, false);
      const unit = view.getUint8(body + 8);
      rows.push(['Pixel size', unit === 1 ? `${Math.round(x * 0.0254)} × ${Math.round(y * 0.0254)} dots per inch` : `${x} × ${y} pixels per unit`]);
    }
    if (type === 'gAMA') rows.push(['Gamma', String(view.getUint32(body, false) / 100000)]);
    if (type === 'sRGB') rows.push(['Colour space', 'sRGB declared']);
    if (type === 'iCCP') text.push(['ICC profile', 'an embedded colour profile is present']);
    if (type === 'tIME') {
      const pad = (n) => String(n).padStart(2, '0');
      rows.push(['Last modified', `${view.getUint16(body, false)}-${pad(view.getUint8(body + 2))}-${pad(view.getUint8(body + 3))} ${pad(view.getUint8(body + 4))}:${pad(view.getUint8(body + 5))}:${pad(view.getUint8(body + 6))} UTC`]);
    }
    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
      const bytes = new Uint8Array(view.buffer, view.byteOffset + body, length);
      const zero = bytes.indexOf(0);
      const keyword = new TextDecoder().decode(bytes.slice(0, zero === -1 ? 0 : zero));
      if (type === 'tEXt') {
        text.push([keyword, new TextDecoder('latin1').decode(bytes.slice(zero + 1))]);
      } else if (type === 'zTXt') {
        text.push([keyword, 'compressed, not decoded here']);
      } else {
        // iTXt: keyword \0 compressionFlag compressionMethod language \0 translated \0 text
        const flag = bytes[zero + 1];
        const rest = bytes.slice(zero + 3);
        const langEnd = rest.indexOf(0);
        const afterLang = rest.slice(langEnd + 1);
        const translatedEnd = afterLang.indexOf(0);
        const value = afterLang.slice(translatedEnd + 1);
        text.push([keyword, flag === 1 ? 'compressed, not decoded here' : new TextDecoder().decode(value)]);
      }
    }
    if (type === 'eXIf') {
      try {
        sections.push(...readExif(view, body));
      } catch {
        text.push(['EXIF', 'a block is present but could not be read']);
      }
    }
    at = body + length + 4;
  }
  const out = [];
  if (rows.length > 0) out.push({ title: 'PNG image', rows });
  if (text.length > 0) out.push({ title: 'Text chunks', rows: text });
  return out;
}

function readGif(view) {
  const rows = [['Version', String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + 3, 3))]];
  rows.push(['Width', `${view.getUint16(6, true)} px`], ['Height', `${view.getUint16(8, true)} px`]);
  const text = [];
  let at = 13;
  while (at < view.byteLength) {
    const block = view.getUint8(at);
    if (block === 0x3b) break;
    if (block === 0x21) {
      const label = view.getUint8(at + 1);
      if (label === 0xfe) {
        let cursor = at + 2;
        let comment = '';
        while (cursor < view.byteLength && view.getUint8(cursor) !== 0) {
          const size = view.getUint8(cursor);
          comment += new TextDecoder('latin1').decode(new Uint8Array(view.buffer, view.byteOffset + cursor + 1, size));
          cursor += size + 1;
        }
        text.push(['Comment', comment]);
        at = cursor + 1;
        continue;
      }
      if (label === 0xff) {
        const name = new TextDecoder('latin1').decode(new Uint8Array(view.buffer, view.byteOffset + at + 3, 11));
        text.push(['Application block', name]);
        at += 14;
        continue;
      }
    }
    if (block === 0x2c) {
      at += 10;
      continue;
    }
    break;
  }
  const out = [{ title: 'GIF', rows }];
  if (text.length > 0) out.push({ title: 'Extensions', rows: text });
  return out;
}

function readWebp(view) {
  const out = [];
  let at = 12;
  const rows = [];
  const text = [];
  while (at + 8 <= view.byteLength) {
    const type = String.fromCharCode(...new Uint8Array(view.buffer, view.byteOffset + at, 4));
    const size = view.getUint32(at + 4, true);
    const body = at + 8;
    if (size > view.byteLength - body) break;
    if (type === 'VP8X') {
      const width = 1 + (view.getUint8(body + 4) | (view.getUint8(body + 5) << 8) | (view.getUint8(body + 6) << 16));
      const height = 1 + (view.getUint8(body + 7) | (view.getUint8(body + 8) << 8) | (view.getUint8(body + 9) << 16));
      rows.push(['Width', `${width} px`], ['Height', `${height} px`]);
    }
    if (type === 'VP8 ') {
      rows.push(['Width', `${view.getUint16(body + 6, true) & 0x3fff} px`], ['Height', `${view.getUint16(body + 8, true) & 0x3fff} px`]);
    }
    if (type === 'VP8L') {
      const bits = view.getUint32(body + 1, true);
      rows.push(['Width', `${(bits & 0x3fff) + 1} px`], ['Height', `${((bits >> 14) & 0x3fff) + 1} px`]);
    }
    if (type === 'EXIF') {
      try {
        out.push(...readExif(view, body));
      } catch {
        text.push(['EXIF', 'a block is present but could not be read']);
      }
    }
    if (type === 'XMP ') text.push(['XMP', `${size} bytes of editing history`]);
    if (type === 'ICCP') text.push(['ICC profile', `${size} bytes of embedded colour data`]);
    at = body + size + (size % 2);
  }
  if (rows.length > 0) out.unshift({ title: 'WebP image', rows });
  if (text.length > 0) out.push({ title: 'Extra blocks', rows: text });
  return out;
}

/* ---------- rendering ---------- */

function render(sections, file) {
  const groups = [];
  const head = [['Name', file.name], ['Size', `${file.size.toLocaleString()} bytes`], ['Type', file.type || 'not reported by the browser']];
  if (file.lastModified) head.push(['Changed on disk', new Date(file.lastModified).toLocaleString()]);
  groups.push({ title: 'File', rows: head }, ...sections);

  const nodes = groups.map((group) => {
    const box = document.createElement('div');
    box.className = 'img-group';
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    box.append(heading);
    const list = document.createElement('dl');
    for (const [name, value] of group.rows) {
      if (value === null || value === undefined || value === '') continue;
      const dt = document.createElement('dt');
      dt.textContent = name;
      const dd = document.createElement('dd');
      dd.textContent = String(value);
      list.append(dt, dd);
    }
    box.append(list);
    return box;
  });

  const coords = sections.map((section) => section.coords).find(Boolean) || null;

  // A location is the field people are most surprised to find in a photo, so it
  // gets said out loud and linked rather than left as two rows in a table.
  if (coords) {
    const warning = document.createElement('p');
    warning.className = 'img-warning';
    const link = document.createElement('a');
    link.href = `https://www.google.com/maps?q=${coords.lat},${coords.lon}&z=15`;
    link.rel = 'noopener';
    link.target = '_blank';
    link.textContent = `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`;
    warning.append('This file says where it was taken: ', link, '. The link opens Google Maps.');
    nodes.unshift(warning);
  }

  results.replaceChildren(...nodes);
  current = { groups };
  jsonOut.value = JSON.stringify(
    Object.fromEntries(groups.map((group) => [group.title, Object.fromEntries(group.rows.filter(([, value]) => value !== null && value !== undefined && value !== ''))])),
    null,
    2,
  );
}

async function inspect(file) {
  if (!file) return;
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const head = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
  const ascii = String.fromCharCode(...head);

  let sections = [];
  let format = '';
  try {
    if (ascii.startsWith('\xff\xd8')) {
      format = 'JPEG';
      sections = readJpeg(view);
    } else if (ascii.startsWith('\x89PNG')) {
      format = 'PNG';
      sections = readPng(view);
    } else if (ascii.startsWith('GIF8')) {
      format = 'GIF';
      sections = readGif(view);
    } else if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') {
      format = 'WebP';
      sections = readWebp(view);
    } else {
      format = '';
    }
  } catch (error) {
    tk.setStatus(status, `This file could not be read: ${error.message}`, 'err');
    results.replaceChildren();
    return;
  }

  if (format === '') {
    tk.setStatus(status, 'This does not look like a JPEG, PNG, GIF or WebP. Those are the four this page can read.', 'err');
    results.replaceChildren();
    jsonOut.value = '';
    return;
  }

  const found = sections.filter((section) => section.rows.length > 0);
  const exifGroups = found.filter((section) => ['Image', 'Exposure and camera', 'Location', 'Thumbnail'].includes(section.title));
  render(found, file);

  preview.replaceChildren();
  const image = document.createElement('img');
  image.src = URL.createObjectURL(file);
  image.alt = `Preview of ${file.name}`;
  preview.append(image);
  image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });

  summary.textContent = `${format} · ${found.length} block${found.length === 1 ? '' : 's'} of metadata`;
  tk.setStatus(
    status,
    exifGroups.length === 0
      ? 'Read, but there is no EXIF in this file. That is normal for an image that was edited, screenshotted or exported for the web — it does not mean the file carries nothing.'
      : 'Read. Everything below came out of the file itself.',
    exifGroups.length === 0 ? '' : 'ok',
  );
}

/* ---------- wiring ---------- */

fileInput.addEventListener('change', () => inspect(fileInput.files[0]));

// Drag and drop, because dropping a photo on the box is how anyone would try it
// first. The default has to be cancelled or the browser navigates to the file.
for (const type of ['dragenter', 'dragover']) {
  drop.addEventListener(type, (event) => {
    event.preventDefault();
    drop.classList.add('over');
  });
}
for (const type of ['dragleave', 'drop']) {
  drop.addEventListener(type, () => drop.classList.remove('over'));
}
drop.addEventListener('drop', (event) => {
  event.preventDefault();
  inspect(event.dataTransfer?.files?.[0]);
});

document.querySelector('#img-copy').addEventListener('click', async () => {
  await navigator.clipboard?.writeText(jsonOut.value);
  tk.flash(status, 'JSON copied', 'ok');
});
document.querySelector('#img-download').addEventListener('click', () => {
  tk.download(`${(current && 'metadata') || 'metadata'}.json`, jsonOut.value, 'application/json');
});
