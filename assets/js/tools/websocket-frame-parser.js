// WebSocket frame parser: decode an RFC 6455 frame from its hex bytes.
const { tk } = window;

const els = {
  input: document.querySelector('#wsf-input'),
  out: document.querySelector('#wsf-out'),
  payload: document.querySelector('#wsf-payload'),
  status: document.querySelector('#wsf-status'),
};

const OPCODES = {
  0x0: 'Continuation',
  0x1: 'Text',
  0x2: 'Binary',
  0x8: 'Close',
  0x9: 'Ping',
  0xa: 'Pong',
};

function toBytes(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2) return null;
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) bytes.push(parseInt(clean.slice(i, i + 2), 16));
  return bytes;
}

function parseFrame(bytes) {
  if (bytes.length < 2) return { error: 'A frame needs at least two bytes.' };
  const first = bytes[0];
  const second = bytes[1];
  const fin = (first & 0x80) !== 0;
  const rsv = (first >> 4) & 0x7;
  const opcode = first & 0x0f;
  const masked = (second & 0x80) !== 0;
  let length = second & 0x7f;
  let offset = 2;
  if (length === 126) {
    if (bytes.length < offset + 2) return { error: 'The 16-bit length field is cut off.' };
    length = (bytes[offset] << 8) | bytes[offset + 1];
    offset += 2;
  } else if (length === 127) {
    if (bytes.length < offset + 8) return { error: 'The 64-bit length field is cut off.' };
    length = 0;
    for (let i = 0; i < 8; i += 1) length = length * 256 + bytes[offset + i];
    offset += 8;
  }
  let maskKey = null;
  if (masked) {
    if (bytes.length < offset + 4) return { error: 'The masking key is cut off.' };
    maskKey = bytes.slice(offset, offset + 4);
    offset += 4;
  }
  const raw = bytes.slice(offset, offset + length);
  if (raw.length < length) {
    return { error: `The frame declares ${length} payload bytes but only ${raw.length} are present.` };
  }
  const payload = maskKey ? raw.map((byte, i) => byte ^ maskKey[i % 4]) : raw;
  return { fin, rsv, opcode, masked, length, maskKey, payload };
}

function row(dt, dd) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const key = document.createElement('dt');
  const value = document.createElement('dd');
  key.textContent = dt;
  value.textContent = dd;
  wrap.append(key, value);
  return wrap;
}

function render() {
  const hex = els.input.value.trim();
  els.out.replaceChildren();
  els.payload.replaceChildren();
  if (!hex) {
    tk.setStatus(els.status, '');
    return;
  }
  const bytes = toBytes(hex);
  if (!bytes) {
    tk.setStatus(els.status, 'Hex needs an even number of digits.', 'err');
    return;
  }
  const frame = parseFrame(bytes);
  if (frame.error) {
    tk.setStatus(els.status, frame.error, 'err');
    return;
  }
  const text = frame.opcode === 0x1 ? new TextDecoder().decode(Uint8Array.from(frame.payload)) : null;
  els.out.append(
    row('FIN', frame.fin ? 'Yes (final fragment)' : 'No (more fragments follow)'),
    row('RSV1–3', String(frame.rsv)),
    row('Opcode', `0x${frame.opcode.toString(16)} · ${OPCODES[frame.opcode] || 'Reserved'}`),
    row('Masked', frame.masked ? 'Yes (client to server)' : 'No (server to client)'),
    row('Payload length', `${frame.length} byte${frame.length === 1 ? '' : 's'}`),
    row('Masking key', frame.maskKey ? frame.maskKey.map((b) => b.toString(16).padStart(2, '0')).join(' ') : '—'),
    row('Payload hex', frame.payload.map((b) => b.toString(16).padStart(2, '0')).join(' ') || '—'),
  );
  if (text !== null) {
    const pre = document.createElement('pre');
    pre.className = 'tool-code';
    pre.textContent = text;
    els.payload.appendChild(pre);
  }
  tk.setStatus(els.status, 'Decoded locally — nothing left your browser.', 'ok');
}

tk.live(els.input, render);
