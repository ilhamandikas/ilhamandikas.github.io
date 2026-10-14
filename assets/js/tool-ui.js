// Shared, opt-in UI controllers. Styling belongs to the global stylesheets.
export function confirmDialog(dialog) {
  let resolvePending = null;
  function finish(accepted) {
    const resolve = resolvePending;
    resolvePending = null;
    if (dialog.open) dialog.close(accepted ? 'accept' : 'cancel');
    resolve?.(accepted);
  }
  dialog.querySelector('[data-dialog-cancel]').addEventListener('click', () => finish(false));
  dialog.querySelector('[data-dialog-accept]').addEventListener('click', () => finish(true));
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); finish(false); });
  dialog.addEventListener('keydown', (event) => event.stopPropagation());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) finish(false);
  });
  window.addEventListener('pagehide', () => finish(false));
  return () => new Promise((resolve) => {
    finish(false);
    resolvePending = resolve;
    dialog.returnValue = 'cancel';
    dialog.showModal();
    dialog.querySelector('[data-dialog-cancel]').focus({ preventScroll: true });
  });
}

export function fullscreen({ workspace, button, hint, options, onChange, onResize, onError }) {
  let active = false;
  let native = false;
  let previousFocus = null;
  let optionsWereOpen = true;
  let outsideElements = [];
  function setActive(value) {
    if (active === value) return;
    active = value;
    workspace.classList.toggle('tool-fullscreen', value);
    document.body.classList.toggle('tool-focus-open', value);
    button.textContent = value ? 'Exit full screen' : 'Full screen';
    button.setAttribute('aria-pressed', String(value));
    if (hint) hint.hidden = !value;
    if (value) {
      previousFocus = document.activeElement;
      if (options) { optionsWereOpen = options.open; options.open = false; }
      workspace.scrollTop = 0;
      // Native fullscreen and the fallback both keep surrounding controls inert.
      for (let node = workspace; node.parentElement; node = node.parentElement) {
        for (const sibling of node.parentElement.children) {
          if (sibling !== node && !sibling.hasAttribute('inert')) {
            sibling.setAttribute('inert', '');
            outsideElements.push(sibling);
          }
        }
        if (node.parentElement === document.body) break;
      }
      button.focus({ preventScroll: true });
    } else {
      if (options) options.open = optionsWereOpen;
      for (const element of outsideElements) element.removeAttribute('inert');
      outsideElements = [];
      previousFocus?.focus({ preventScroll: true });
      previousFocus = null;
    }
    onChange?.(value);
    onResize?.();
  }
  async function exit() {
    if (document.fullscreenElement === workspace) {
      try { await document.exitFullscreen(); }
      catch { onError?.('Could not exit full screen. Press Esc to leave browser fullscreen.'); return; }
    }
    native = false;
    setActive(false);
  }
  button.addEventListener('click', async () => {
    if (active) { await exit(); return; }
    setActive(true);
    if (!workspace.requestFullscreen) return;
    button.disabled = true;
    try { await workspace.requestFullscreen(); }
    catch { /* Keep the CSS-only, in-page fallback when fullscreen is denied. */ }
    finally { button.disabled = false; if (active) button.focus({ preventScroll: true }); }
  });
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === workspace) { native = true; setActive(true); }
    else if (native) { native = false; setActive(false); }
  });
  workspace.addEventListener('keydown', (event) => {
    if (!active) return;
    event.stopPropagation();
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    if (options?.open) { options.open = false; options.querySelector('summary').focus({ preventScroll: true }); }
    else void exit();
  });
  workspace.addEventListener('click', (event) => {
    if (active && options?.open && !event.target.closest('dialog') && !options.contains(event.target)) options.open = false;
  });
  const resize = () => { if (active) onResize?.(); };
  window.addEventListener('resize', resize);
  window.visualViewport?.addEventListener('resize', resize);
  window.addEventListener('pagehide', () => { native = false; setActive(false); });
  return { get active() { return active; }, exit };
}
