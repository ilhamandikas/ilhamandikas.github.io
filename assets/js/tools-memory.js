// Remember what was typed into a tool, so a refresh or a trip to another page
// does not wipe it — but only after asking, and only on this device.
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
const CONSENT = 'ilham:memory-consent';
const PREFIX = 'ilham:memory:';
const FIELDS = '.tool-body input, .tool-body textarea, .tool-body select';

const slug = (/\/tools\/([^/]+)\//.exec(location.pathname) || [])[1] || '';
const key = () => `${PREFIX}${slug}`;

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

// Restoring has to fire the same events a person typing would, or the tool would
// show the old input next to output built from the empty one.
function restore() {
  const data = stored();
  if (!data) return 0;
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

/* ---------- the bar ---------- */

const bar = document.querySelector('#tool-memory');
const ask = document.querySelector('#tool-memory-ask');
const on = document.querySelector('#tool-memory-on');
const off = document.querySelector('#tool-memory-off');
const note = document.querySelector('#tool-memory-note');

if (bar && slug) {
  const consent = () => readStore(CONSENT);
  let timer = null;

  const queue = () => {
    clearTimeout(timer);
    timer = setTimeout(save, 400);
  };

  const show = (state) => {
    bar.hidden = false;
    ask.hidden = state !== 'ask';
    on.hidden = state !== 'on';
    off.hidden = state !== 'off';
  };

  const forgetEverything = () => {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const name = localStorage.key(i);
        if (name && name.startsWith(PREFIX)) keys.push(name);
      }
    } catch {
      /* ignore */
    }
    for (const name of keys) writeStore(name, null);
    writeStore(CONSENT, null);
  };

  document.querySelector('#tool-memory-yes').addEventListener('click', () => {
    writeStore(CONSENT, 'yes');
    save();
    show('on');
    note.textContent = 'Saved on this device. It will be here when you come back.';
  });

  document.querySelector('#tool-memory-no').addEventListener('click', () => {
    writeStore(CONSENT, 'no');
    writeStore(key(), null);
    show('off');
    note.textContent = 'Nothing is saved. This page forgets your work when you leave it.';
  });

  document.querySelector('#tool-memory-forget').addEventListener('click', () => {
    writeStore(key(), null);
    clearFields();
    note.textContent = 'Forgotten — this tool has nothing stored, and the form was cleared.';
  });

  document.querySelector('#tool-memory-enable').addEventListener('click', () => {
    writeStore(CONSENT, 'yes');
    save();
    show('on');
    note.textContent = 'Saving again on this device.';
  });

  document.querySelector('#tool-memory-forget-all').addEventListener('click', () => {
    forgetEverything();
    clearFields();
    show('off');
    note.textContent = 'Everything is forgotten, and this browser will not ask again until you start saving.';
  });

  if (consent() === 'yes') {
    const restored = restore();
    show('on');
    note.textContent =
      restored > 0
        ? `Picked up where you left off — ${restored} field${restored === 1 ? '' : 's'} restored from this device.`
        : 'Saved on this device.';
    bar.dataset.memory = 'on';
    document.addEventListener('input', queue);
    document.addEventListener('change', queue);
    // A tab closed mid-sentence would otherwise lose the last few hundred
    // milliseconds of typing that the debounce is still holding.
    window.addEventListener('pagehide', save);
  } else if (consent() === 'no') {
    show('off');
  } else {
    show('ask');
  }
}
