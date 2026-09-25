// Hash text — SHA family via WebCrypto, MD5 implemented from scratch.
const { tk } = window;

const input = document.querySelector('#hash-input');
const results = document.querySelector('#hash-results');
const upper = document.querySelector('#hash-upper');
const opts = {
  md5: document.querySelector('#hash-md5'),
  sha1: document.querySelector('#hash-sha1'),
  sha256: document.querySelector('#hash-sha256'),
  sha512: document.querySelector('#hash-sha512'),
};

// --- MD5 (RFC 1321) ---------------------------------------------------------
const MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0);

function md5(text) {
  const msg = new TextEncoder().encode(text);
  const bitLen = msg.length * 8;
  const withOne = msg.length + 1;
  const padLen = ((56 - (withOne % 64)) + 64) % 64;
  const total = withOne + padLen + 8;

  const buffer = new Uint8Array(total);
  buffer.set(msg);
  buffer[msg.length] = 0x80;
  const view = new DataView(buffer.buffer);
  view.setUint32(total - 8, bitLen >>> 0, true);
  view.setUint32(total - 4, Math.floor(bitLen / 4294967296), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const M = new Array(16);
  for (let chunk = 0; chunk < total; chunk += 64) {
    for (let j = 0; j < 16; j += 1) M[j] = view.getUint32(chunk + j * 4, true);

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      f = (f + a + MD5_K[i] + M[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + (((f << MD5_S[i]) | (f >>> (32 - MD5_S[i]))) >>> 0)) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const le = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
  return [...le(a0), ...le(b0), ...le(c0), ...le(d0)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// --- rendering --------------------------------------------------------------
async function sha(algorithm, text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function row(label, value) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-field';
  const id = `hash-out-${label.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  wrap.innerHTML = `
    <label for="${id}">${label}</label>
    <textarea id="${id}" class="tool-input" rows="2" readonly spellcheck="false">${value}</textarea>`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.style.marginTop = '8px';
  btn.textContent = 'Copy';
  btn.addEventListener('click', () => tk.copy(value));
  wrap.appendChild(btn);
  return wrap;
}

async function render() {
  const text = input.value;
  const jobs = [];
  if (opts.md5.checked) jobs.push(['MD5', Promise.resolve(md5(text))]);
  if (opts.sha1.checked) jobs.push(['SHA-1', sha('SHA-1', text)]);
  if (opts.sha256.checked) jobs.push(['SHA-256', sha('SHA-256', text)]);
  if (opts.sha512.checked) jobs.push(['SHA-512', sha('SHA-512', text)]);

  const settled = await Promise.all(jobs.map(async ([label, promise]) => [label, await promise]));

  results.replaceChildren();
  settled.forEach(([label, value]) => {
    const shown = upper.checked ? value.toUpperCase() : value;
    results.appendChild(row(label, shown));
  });
}

const debounced = tk.debounce(render, 120);
input.addEventListener('input', debounced);
Object.values(opts).forEach((el) => el.addEventListener('change', render));
upper.addEventListener('change', render);

render();
