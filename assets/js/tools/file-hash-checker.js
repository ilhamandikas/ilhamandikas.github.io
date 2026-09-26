// File hash checker — compute MD5, SHA-1, SHA-256 and SHA-512 of a file and, if you
// paste the digest the publisher printed, say whether it matches.
//
// This is the whole point of the tool: "the download is fine" should be a fact, not
// a feeling. Everything is read in the page and nothing is uploaded, which also
// means there is no size limit imposed by a server — only by this browser's memory.
import { SHA, expectedHashes, md5, sha } from '../hash.js';

const { tk } = window;

const els = {
  file: document.querySelector('#fhc-file'),
  drop: document.querySelector('#fhc-drop'),
  expected: document.querySelector('#fhc-expected'),
  upper: document.querySelector('#fhc-upper'),
  status: document.querySelector('#fhc-status'),
  summary: document.querySelector('#fhc-summary'),
  results: document.querySelector('#fhc-results'),
  verdict: document.querySelector('#fhc-verdict'),
  name: document.querySelector('#fhc-name'),
};

const ALGOS = [
  { key: 'md5', label: 'MD5', id: 'fhc-md5', bits: 128 },
  { key: 'sha1', label: 'SHA-1', id: 'fhc-sha1', bits: 160 },
  { key: 'sha256', label: 'SHA-256', id: 'fhc-sha256', bits: 256 },
  { key: 'sha512', label: 'SHA-512', id: 'fhc-sha512', bits: 512 },
];

const checks = Object.fromEntries(ALGOS.map((algo) => [algo.key, document.querySelector(`#${algo.id}`)]));

let last = null; // { name, size, hashes }
let busy = false;

// WebCrypto has no incremental digest, so the file has to be in memory whole. On a
// phone that ceiling arrives quickly, and saying so beforehand beats a crash.
const BIG = 256 * 1024 * 1024;

function selected() {
  return ALGOS.filter((algo) => checks[algo.key].checked);
}

function hashRow(label, value, bits) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-field fhc-row';
  const tag = document.createElement('label');
  tag.textContent = `${label} · ${bits} bit`;
  const field = document.createElement('textarea');
  field.className = 'tool-input tool-code';
  field.rows = 2;
  field.readOnly = true;
  field.spellcheck = false;
  field.value = value;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  btn.textContent = 'Copy';
  btn.addEventListener('click', () => tk.copy(field.value));
  wrap.append(tag, field, btn);
  return wrap;
}

// The verdict is the answer the user came for, so it is separated from the hashes
// rather than left as one more row to read.
function verdictFor(hashes) {
  const wanted = expectedHashes(els.expected.value);
  if (wanted.length === 0) {
    if (els.expected.value.trim() !== '') {
      els.verdict.className = 'fhc-verdict';
      els.verdict.textContent = 'That does not look like a hash — a digest is a run of 32 or more hex characters.';
      return;
    }
    els.verdict.className = 'fhc-verdict';
    els.verdict.textContent = '';
    return;
  }

  const hit = hashes.find((entry) => wanted.includes(entry.value.toLowerCase()));
  if (hit) {
    els.verdict.className = 'fhc-verdict ok';
    els.verdict.textContent = `Match. The file's ${hit.label} is the one you pasted.`;
    return;
  }

  const comparable = hashes.filter((entry) => wanted.some((want) => want.length === entry.bits / 4));
  els.verdict.className = 'fhc-verdict err';
  if (comparable.length === 0) {
    els.verdict.textContent = 'No match — but the hash you pasted is a different length from every one computed here, so the two are not comparable. Tick the matching algorithm above.';
  } else {
    els.verdict.textContent = `No match. ${comparable.map((entry) => entry.label).join(' and ')} came out different, so this file is not the one that hash was published for.`;
  }
}

function show(hashes) {
  els.results.replaceChildren(...hashes.map((entry) => hashRow(entry.label, entry.value, entry.bits)));
  verdictFor(hashes);
}

async function run() {
  const file = els.file.files?.[0];
  if (!file) {
    tk.setStatus(els.status, 'Choose a file to hash.', '');
    return;
  }
  if (busy) return;
  busy = true;

  const algos = selected();
  els.name.textContent = `${file.name} · ${file.size.toLocaleString()} bytes`;
  els.summary.textContent = '';

  if (algos.length === 0) {
    tk.setStatus(els.status, 'Tick at least one algorithm.', 'err');
    els.results.replaceChildren();
    busy = false;
    return;
  }

  tk.setStatus(
    els.status,
    file.size > BIG
      ? `Reading ${file.name}… it is over ${Math.round(BIG / 1024 / 1024)} MB, and hashing needs the whole file in memory — on a phone this may fail.`
      : `Reading ${file.name}…`,
    '',
  );
  els.results.replaceChildren();
  els.verdict.textContent = '';

  let bytes;
  try {
    // Two turns of the event loop, so the "reading" message is painted before the
    // main thread disappears into MD5 on a large file.
    await new Promise((resolve) => setTimeout(resolve, 0));
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    tk.setStatus(els.status, `This browser could not read the file: ${error.message}. A very large file can exhaust memory.`, 'err');
    busy = false;
    return;
  }

  const started = performance.now();
  try {
    const hashes = await Promise.all(
      algos.map(async (algo) => {
        const value = algo.key === 'md5' ? md5(bytes) : await sha(SHA[algo.key], bytes);
        return { key: algo.key, label: algo.label, bits: algo.bits, value: els.upper.checked ? value.toUpperCase() : value };
      }),
    );
    last = { name: file.name, size: file.size, hashes };
    show(hashes);
    const ms = Math.round(performance.now() - started);
    els.summary.textContent = `${bytes.length.toLocaleString()} bytes hashed in ${ms} ms`;
    tk.setStatus(els.status, 'Done.', 'ok');
  } catch (error) {
    tk.setStatus(els.status, `Hashing failed: ${error.message}`, 'err');
  } finally {
    busy = false;
  }
}

/* ---------- wiring ---------- */

els.file.addEventListener('change', run);
for (const algo of ALGOS) checks[algo.key].addEventListener('change', run);
els.upper.addEventListener('change', () => {
  if (last) show(last.hashes.map((entry) => ({ ...entry, value: entry.value === entry.value.toLowerCase() ? entry.value.toUpperCase() : entry.value.toLowerCase() })));
});
// Re-pasting the expected digest must not re-read the file — the hashes are already
// known, only the comparison changed.
els.expected.addEventListener('input', () => {
  if (last) verdictFor(last.hashes);
});

for (const type of ['dragenter', 'dragover']) {
  els.drop.addEventListener(type, (event) => {
    event.preventDefault();
    els.drop.classList.add('over');
  });
}
for (const type of ['dragleave', 'drop']) {
  els.drop.addEventListener(type, () => els.drop.classList.remove('over'));
}
els.drop.addEventListener('drop', (event) => {
  event.preventDefault();
  const dropped = event.dataTransfer?.files;
  if (dropped && dropped.length > 0) {
    els.file.files = dropped;
    run();
  }
});

document.querySelector('#fhc-copy-all').addEventListener('click', async () => {
  if (!last) return;
  const text = last.hashes.map((entry) => `${entry.label.toLowerCase().replace('-', '')}  ${entry.value}  ${last.name}`).join('\n');
  await navigator.clipboard?.writeText(text);
  tk.flash(els.status, 'All hashes copied', 'ok');
});

document.querySelector('#fhc-download').addEventListener('click', () => {
  if (!last) return;
  const text = last.hashes.map((entry) => `${entry.label.toLowerCase().replace('-', '')}  ${entry.value}  ${last.name}`).join('\n');
  tk.download(`${last.name}.hashes.txt`, `${text}\n`);
});

if (els.file.files?.length) run();
