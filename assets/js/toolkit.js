// Shared helpers for the /tools/ pages. Loaded once per tool page as a module.
// Exposed on window.tk so small per-tool scripts stay tiny and dependency-free.

const tk = {
  $: (sel, root = document) => root.querySelector(sel),
  $$: (sel, root = document) => Array.from(root.querySelectorAll(sel)),

  // localStorage wrapper that survives private mode / disabled storage.
  store(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },

  debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  // Live-update an output element whenever any of the inputs change.
  live(inputs, render) {
    const els = (Array.isArray(inputs) ? inputs : [inputs]).filter(Boolean);
    const run = () => render();
    els.forEach((el) => {
      el.addEventListener('input', run);
      el.addEventListener('change', run);
    });
    run();
    return run;
  },

  // The common "read input -> transform -> write output" pattern, with error
  // handling. fn() may throw; its message is shown in the status element.
  transform({ watch, output, status, fn, ok = '', delay = 120 }) {
    const els = (Array.isArray(watch) ? watch : [watch]).filter(Boolean);
    const run = () => {
      try {
        const value = fn();
        if (output) output.value = value == null ? '' : value;
        if (status) {
          const hasValue = value != null && String(value).length > 0;
          tk.setStatus(status, ok && hasValue ? ok : '', ok && hasValue ? 'ok' : '');
        }
      } catch (error) {
        if (output) output.value = '';
        if (status) tk.setStatus(status, error.message || 'Invalid input', 'err');
      }
    };
    const handler = delay ? tk.debounce(run, delay) : run;
    els.forEach((el) => {
      el.addEventListener('input', handler);
      el.addEventListener('change', run);
    });
    run();
    return run;
  },

  async copy(text, statusEl, label = 'Copied to clipboard') {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    if (statusEl) tk.flash(statusEl, label, 'ok');
  },

  flash(el, message, kind = '') {
    if (!el) return;
    el.textContent = message;
    el.className = `tool-status${kind ? ' ' + kind : ''}`;
    clearTimeout(el._tkTimer);
    el._tkTimer = setTimeout(() => {
      el.textContent = '';
      el.className = 'tool-status';
    }, 2200);
  },

  setStatus(el, message, kind = '') {
    if (!el) return;
    el.textContent = message;
    el.className = `tool-status${kind ? ' ' + kind : ''}`;
  },

  download(filename, content, mime = 'text/plain') {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  // UTF-8 safe Base64 (btoa alone breaks on non-Latin1 input).
  b64encode(text, { urlSafe = false } = {}) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    let out = btoa(bin);
    if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return out;
  },
  b64decode(value, { urlSafe = false } = {}) {
    let v = value.trim();
    if (urlSafe) {
      v = v.replace(/-/g, '+').replace(/_/g, '/');
      while (v.length % 4) v += '=';
    }
    const bin = atob(v);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  },
};

window.tk = tk;

// Copy / download buttons work declaratively via data attributes.
document.addEventListener('click', (event) => {
  const copyBtn = event.target.closest('[data-copy]');
  if (copyBtn) {
    event.preventDefault();
    const sel = copyBtn.getAttribute('data-copy');
    const src = sel ? tk.$(sel) : null;
    const text = src ? ('value' in src ? src.value : src.textContent) : copyBtn.getAttribute('data-copy-text') || '';
    const status = copyBtn.getAttribute('data-status') ? tk.$(copyBtn.getAttribute('data-status')) : null;
    tk.copy(text, status, copyBtn.getAttribute('data-copy-label') || 'Copied to clipboard');
    return;
  }

  const dlBtn = event.target.closest('[data-download]');
  if (dlBtn) {
    event.preventDefault();
    const sel = dlBtn.getAttribute('data-download');
    const src = sel ? tk.$(sel) : null;
    const text = src ? ('value' in src ? src.value : src.textContent) : '';
    tk.download(dlBtn.getAttribute('data-filename') || 'download.txt', text, dlBtn.getAttribute('data-mime') || 'text/plain');
  }
});

export default tk;
