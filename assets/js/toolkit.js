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

  // Run fn once the page is really on screen. Browsers can build a page in the
  // background ahead of a click (see the speculation rules in <head>), and that
  // background run executes this script too. Anything that talks to the network
  // or grabs a device should wait for activation so a hover costs nothing.
  whenActive(fn) {
    if (!document.prerendering) {
      fn();
      return;
    }
    document.addEventListener('prerenderingchange', () => fn(), { once: true });
  },

  debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  },

  // Quote one argument the way a POSIX shell expects, so a value with spaces,
  // quotes or glob characters survives a copy-paste. Plain words are left bare
  // and a leading ~ stays outside the quotes so it still expands to $HOME.
  shq(value) {
    const text = String(value);
    if (text === '') return "''";
    if (/^[A-Za-z0-9_@%+=:,./~-]+$/.test(text)) return text;
    return `'${text.replace(/'/g, "'\\''")}'`;
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

  // Reduce user input to a bare host: no scheme, no path, no trailing dot.
  domain(value) {
    return String(value || '')
      .trim()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .split(/[/?#]/)[0]
      .replace(/\.$/, '')
      .toLowerCase();
  },

  // Loose hostname check — enough to catch typos before spending a request.
  looksLikeDomain(value) {
    return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(value);
  },

  // Drive the single sort button from partials/tools/sort.html. Each click cycles
  // off -> A → Z -> Z → A -> off, and a 'change' event lets tk.live/tk.transform
  // re-render. Returns a reader for the current direction.
  sortControl(id) {
    const button = document.getElementById(id);
    if (!button) return () => 'off';
    const cycle = [
      { value: 'off', text: 'off', name: 'off', action: 'Sort keys A → Z' },
      { value: 'asc', text: '↑', name: 'ascending, A to Z', action: 'Sort keys Z → A' },
      { value: 'desc', text: '↓', name: 'descending, Z to A', action: 'Turn sorting off' },
    ];
    const label = button.dataset.sortLabel || 'Sort keys';
    const textEl = button.querySelector('.tool-sort-text');
    let index = Math.max(0, cycle.findIndex((s) => s.value === (button.dataset.sort || 'off')));

    const paint = () => {
      const state = cycle[index];
      button.dataset.sort = state.value;
      button.setAttribute('aria-pressed', String(state.value !== 'off'));
      button.setAttribute('aria-label', `${label}: ${state.name}`);
      button.title = state.action;
      if (textEl) textEl.textContent = state.text;
    };

    button.addEventListener('click', () => {
      index = (index + 1) % cycle.length;
      paint();
      button.dispatchEvent(new Event('change'));
    });
    paint();
    return () => cycle[index].value;
  },

  // Deep-sort object keys, leaving array order untouched. direction: asc | desc.
  sortDeep(value, direction = 'asc') {
    if (direction !== 'asc' && direction !== 'desc') return value;
    if (Array.isArray(value)) return value.map((item) => tk.sortDeep(item, direction));
    if (value && typeof value === 'object') {
      const keys = Object.keys(value).sort();
      if (direction === 'desc') keys.reverse();
      const out = {};
      for (const key of keys) out[key] = tk.sortDeep(value[key], direction);
      return out;
    }
    return value;
  },

  // Render a parsed object or array as a collapsible tree. Everything goes in
  // through textContent, so keys and values are never treated as markup.
  tree(container, value, { openDepth = 2 } = {}) {
    if (!container) return;
    container.replaceChildren();
    if (value === undefined) return;

    const build = (key, node, depth) => {
      const isBranch = node !== null && typeof node === 'object';

      if (!isBranch) {
        const row = document.createElement('div');
        row.className = 'tree-leaf';
        if (key !== null) {
          const k = document.createElement('span');
          k.className = 'tree-key';
          k.textContent = `${key}:`;
          row.append(k, ' ');
        }
        const v = document.createElement('span');
        v.className = 'tree-value';
        v.textContent = typeof node === 'string' ? JSON.stringify(node) : String(node);
        row.appendChild(v);
        return row;
      }

      const entries = Array.isArray(node)
        ? node.map((item, i) => [i, item])
        : Object.entries(node);

      const details = document.createElement('details');
      details.open = depth < openDepth;

      const summary = document.createElement('summary');
      if (key !== null) {
        const k = document.createElement('span');
        k.className = 'tree-key';
        k.textContent = `${key}:`;
        summary.append(k, ' ');
      }
      const type = document.createElement('span');
      type.className = 'tree-type';
      type.textContent = Array.isArray(node) ? `[${entries.length}]` : `{${entries.length}}`;
      summary.appendChild(type);
      details.appendChild(summary);

      const inner = document.createElement('div');
      inner.className = 'tree-children';
      entries.forEach(([childKey, childValue]) => {
        inner.appendChild(build(childKey, childValue, depth + 1));
      });
      details.appendChild(inner);
      return details;
    };

    container.appendChild(build(null, value, 0));
  },

  // Open or close every <details> inside a tree.
  treeOpenAll(container, open) {
    if (!container) return;
    container.querySelectorAll('details').forEach((el) => (el.open = open));
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
