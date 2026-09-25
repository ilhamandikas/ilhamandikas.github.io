// Remember what was typed into a tool — both the current state and a short list of
// previous entries — so a refresh, a trip to another page or an accidental
// overwrite does not lose it. Only after asking, and only in this browser.
//
// What is kept is the tool's own form fields, in localStorage. Nothing is uploaded
// and there is no account. That is the honest version of "your data never leaves
// your browser": it is true, and it is not the same as "it is private". Anything in
// localStorage can be read by anyone who can use this browser profile, and by any
// script that runs on this site later. A tool page can hold a private key, a
// password or a signed token, so the choice is put in front of the user instead of
// being made for them — and the warning says what the risk actually is.
//
// Fields that must never be written down are left out: password inputs, file
// inputs, and anything a tool has marked with data-no-memory.
//
// The two stores have different jobs, which is why they are written on different
// timers. The current state is saved 400ms after you stop typing, so a refresh does
// not lose the last sentence. A history entry is written 2s after you stop, because
// that is the point at which you have finished a thought rather than paused in the
// middle of one — recording on the fast timer would fill the list with every
// half-word you typed.
const CONSENT = 'ilham:memory-consent';
const PREFIX = 'ilham:memory:';
const HISTORY = 'ilham:history:';
const FIELDS = '.tool-body input, .tool-body textarea, .tool-body select';

// A cap on both, because localStorage is about 5MB for the whole origin and one
// pasted blob can be most of that. An entry larger than this is not recorded: a
// 2MB base64 string is not something anyone scrolls back through.
const MAX_ENTRIES = 12;
const MAX_ENTRY_BYTES = 8000;

const slug = (/\/tools\/([^/]+)\//.exec(location.pathname) || [])[1] || '';
const key = () => `${PREFIX}${slug}`;
const historyKey = () => `${HISTORY}${slug}`;

// Private mode, a full disk and a disabled-storage setting all make localStorage
// throw. Every access is defended, and a failure means "no memory", not a crash.
function readStore(name) {
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
}

function writeStore(name, value) {
  try {
    if (value === null) localStorage.removeItem(name);
    else localStorage.setItem(name, value);
    return true;
  } catch {
    return false;
  }
}

function savable(el) {
  if (!el.id) return false; // with no stable name there is nothing to restore into
  if (el.dataset.noMemory !== undefined) return false;
  if (el.readOnly || el.disabled) return false;
  const type = (el.type || '').toLowerCase();
  return !['password', 'file', 'hidden', 'submit', 'button', 'reset', 'image'].includes(type);
}

const fields = () => [...document.querySelectorAll(FIELDS)].filter(savable);

function snapshot() {
  const data = {};
  for (const el of fields()) {
    data[el.id] = el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
  }
  return data;
}

function save() {
  const data = snapshot();
  if (Object.keys(data).length === 0) return;
  writeStore(key(), JSON.stringify(data));
}

function stored() {
  const raw = readStore(key());
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

// Writing a value in has to fire the same events a person typing would, or the tool
// would show the restored input next to output built from the empty one.
function apply(data) {
  let count = 0;
  for (const el of fields()) {
    if (!(el.id in data)) continue;
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = Boolean(data[el.id]);
    else el.value = data[el.id];
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    count += 1;
  }
  return count;
}

function restore() {
  const data = stored();
  return data ? apply(data) : 0;
}

function clearFields() {
  for (const el of fields()) {
    if (el.tagName === 'SELECT') {
      // A select has no defaultValue — assigning one writes the string
      // "undefined" into it, and the tool then looks up an option that does not
      // exist. The HTML reset rule is the option marked selected, else the first.
      const marked = [...el.options].findIndex((option) => option.defaultSelected);
      el.selectedIndex = marked === -1 ? 0 : marked;
    } else if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = el.defaultChecked;
    } else {
      el.value = el.defaultValue;
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/* ---------- previous entries ---------- */

// Anything that survived a version change, a half-written write or another script
// under the same prefix is discarded rather than trusted.
function readHistory() {
  const raw = readStore(historyKey());
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (entry) =>
        entry && typeof entry === 'object' && Number.isFinite(entry.at) && entry.data && typeof entry.data === 'object',
    );
  } catch {
    return [];
  }
}

function writeHistory(list) {
  if (list.length === 0) writeStore(historyKey(), null);
  else writeStore(historyKey(), JSON.stringify(list));
}

// Both sides come from snapshot(), which walks the DOM in the same order every
// time, so comparing the serialised forms is comparing the same shape.
const sameSnapshot = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function commit() {
  const data = snapshot();
  if (Object.keys(data).length === 0) return false;
  const text = JSON.stringify(data);
  if (text.length > MAX_ENTRY_BYTES) return false;
  const list = readHistory();
  // The newest entry is what the form currently holds, so re-recording it would
  // just push the same thing down the list and evict a real entry.
  if (list.length > 0 && sameSnapshot(list[0].data, data)) return false;
  list.unshift({ at: Date.now(), data });
  writeHistory(list.slice(0, MAX_ENTRIES));
  return true;
}

// The first few values that are not empty, which is what you recognise an entry by.
// Only fields someone actually typed into count: a number, a colour, a range or a
// select is a setting, and "{\"a\":1} · 2" is a worse label than the text alone.
const TEXTUAL = ['', 'text', 'search', 'url', 'email', 'tel'];
const describable = (el) =>
  el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && TEXTUAL.includes((el.type || '').toLowerCase()));

function labelFor(el) {
  const explicit = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
  if (explicit) return explicit.textContent.replace(/\s+/g, ' ').trim();
  const wrapped = el.closest('label');
  if (wrapped) {
    const clone = wrapped.cloneNode(true);
    clone.querySelectorAll('input, textarea, select, button').forEach((node) => node.remove());
    const text = clone.textContent.replace(/\s+/g, ' ').trim();
    if (text) return text;
  }
  return el.id.replace(/^[a-z0-9]+-/, '').replace(/[-_]+/g, ' ');
}

function describe(data) {
  const parts = [];
  for (const el of fields()) {
    if (!describable(el)) continue;
    if (!(el.id in data)) continue;
    const text = String(data[el.id]).replace(/\s+/g, ' ').trim();
    if (text === '') continue;
    parts.push(text);
    if (parts.length === 3) break;
  }
  if (parts.length > 0) return parts.join(' · ');

  for (const el of fields()) {
    if (!(el.id in data)) continue;
    const raw = data[el.id];
    const value = typeof raw === 'boolean' ? (raw ? 'on' : 'off') : String(raw).replace(/\s+/g, ' ').trim();
    if (value === '') continue;
    parts.push(`${labelFor(el)}: ${value}`);
    if (parts.length === 3) break;
  }
  return parts.join(' · ');
}

function ago(then) {
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(then).toLocaleDateString();
}

/* ---------- the bar and the list ---------- */

const bar = document.querySelector('#tool-memory');
const ask = document.querySelector('#tool-memory-ask');
const on = document.querySelector('#tool-memory-on');
const off = document.querySelector('#tool-memory-off');
const note = document.querySelector('#tool-memory-note');
const panel = document.querySelector('#tool-history');
const listEl = document.querySelector('#tool-history-list');

if (bar && slug) {
  const consent = () => readStore(CONSENT);
  let timer = null;
  let historyTimer = null;
  let suspended = false;

  // One entry point for both timers, so a tool that fires input and change for the
  // same keystroke cannot end up with two different schedules.
  const queue = () => {
    if (suspended || consent() !== 'yes') return;
    clearTimeout(timer);
    timer = setTimeout(save, 400);
    clearTimeout(historyTimer);
    historyTimer = setTimeout(() => {
      if (consent() === 'yes' && commit()) renderHistory();
    }, 2000);
  };

  const show = (state) => {
    bar.hidden = false;
    ask.hidden = state !== 'ask';
    on.hidden = state !== 'on';
    off.hidden = state !== 'off';
  };

  // Rows are built with createElement, never innerHTML: every character in them
  // came from a field the user typed into.
  function row(entry, index) {
    const item = document.createElement('li');
    item.className = 'tool-history-item';

    const when = document.createElement('span');
    when.className = 'tool-history-when';
    when.textContent = ago(entry.at);
    when.title = new Date(entry.at).toLocaleString();

    const preview = document.createElement('span');
    preview.className = 'tool-history-preview';
    const text = describe(entry.data);
    preview.textContent = text === '' ? 'no text in this entry' : text;
    preview.title = text;

    const put = document.createElement('button');
    put.type = 'button';
    put.className = 'tool-history-link';
    put.textContent = 'Restore';
    put.addEventListener('click', () => {
      const count = apply(entry.data);
      note.textContent = `Put ${count} field${count === 1 ? '' : 's'} from that entry back into the form.`;
    });

    const drop = document.createElement('button');
    drop.type = 'button';
    drop.className = 'tool-history-link';
    drop.textContent = 'Remove';
    drop.addEventListener('click', () => {
      // Read it back before splicing: another tab may have written to the same key.
      const current = readHistory();
      current.splice(index, 1);
      writeHistory(current);
      renderHistory();
    });

    item.append(when, preview, put, drop);
    return item;
  }

  function emptyRow() {
    const item = document.createElement('li');
    item.className = 'tool-history-item empty';
    const mark = document.createElement('span');
    mark.className = 'tool-history-when';
    mark.textContent = 'empty';
    const preview = document.createElement('span');
    preview.className = 'tool-history-preview';
    preview.textContent = 'Belum ada history. Setelah kamu mengisi tool ini, entry sebelumnya akan muncul di sini.';
    item.append(mark, preview);
    return item;
  }

  function renderHistory() {
    if (!panel || !listEl) return;
    const list = readHistory();
    listEl.replaceChildren(...list.map((entry, index) => row(entry, index)));
    panel.hidden = list.length === 0;
  }

  function forgetEverything() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const name = localStorage.key(i);
        if (name && (name.startsWith(PREFIX) || name.startsWith(HISTORY))) keys.push(name);
      }
    } catch {
      /* ignore */
    }
    for (const name of keys) writeStore(name, null);
    writeStore(CONSENT, null);
  }

  // Started in three places — the first yes, "start saving" again, and a reload that
  // already had consent — so it lives here rather than being repeated.
  function start() {
    bar.dataset.memory = 'on';
    document.addEventListener('input', queue);
    document.addEventListener('change', queue);
    // A tab closed mid-sentence would otherwise lose the last few hundred
    // milliseconds of typing that the debounce is still holding.
    window.addEventListener('pagehide', () => {
      if (suspended || consent() !== 'yes') return;
      save();
      if (commit()) renderHistory();
    });
  }

  document.querySelector('#tool-memory-yes').addEventListener('click', () => {
    writeStore(CONSENT, 'yes');
    save();
    commit();
    show('on');
    start();
    renderHistory();
    note.textContent = 'Saved. It will be here when you come back to this device.';
  });

  document.querySelector('#tool-memory-no').addEventListener('click', () => {
    writeStore(CONSENT, 'no');
    writeStore(key(), null);
    writeStore(historyKey(), null);
    show('off');
    renderHistory();
    note.textContent = 'Nothing is saved. This page will forget your work when you leave it.';
  });

  document.querySelector('#tool-memory-forget').addEventListener('click', () => {
    suspended = true;
    writeStore(key(), null);
    writeStore(historyKey(), null);
    clearFields();
    clearTimeout(timer);
    clearTimeout(historyTimer);
    suspended = false;
    renderHistory();
    note.textContent = 'Cleared this tool’s saved fields and history.';
  });

  document.querySelector('#tool-memory-enable').addEventListener('click', () => {
    writeStore(CONSENT, 'yes');
    save();
    commit();
    show('on');
    start();
    renderHistory();
    note.textContent = 'Saving again on this device.';
  });

  document.querySelector('#tool-memory-forget-all').addEventListener('click', () => {
    suspended = true;
    forgetEverything();
    clearFields();
    clearTimeout(timer);
    clearTimeout(historyTimer);
    suspended = false;
    show('off');
    renderHistory();
    note.textContent = 'Forgot saved data for every tool on this device.';
  });

  const clearHistory = document.querySelector('#tool-history-clear');
  if (clearHistory) {
    clearHistory.addEventListener('click', () => {
      writeHistory([]);
      renderHistory();
      note.textContent = 'History cleared. The current entry is untouched.';
    });
  }

  if (consent() === 'yes') {
    const restored = restore();
    show('on');
    note.textContent =
      restored > 0
        ? `Restored ${restored} saved field${restored === 1 ? '' : 's'} from this device.`
        : 'Saved on this device.';
    start();
    renderHistory();
  } else if (consent() === 'no') {
    show('off');
  } else {
    show('ask');
  }
}
