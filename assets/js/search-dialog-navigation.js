// Keep native links: arrows move focus, Enter follows the focused result.
export function initSearchDialogNavigation(dialog, { close }) {
  const input = dialog.querySelector('input[type="search"]');
  const results = dialog.querySelector('.global-search-results');
  const links = () => [...results.querySelectorAll('a[href]')];
  dialog.addEventListener('keydown', (event) => {
    if (dialog.hidden || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === 'Tab') {
      const controls = [input, ...dialog.querySelectorAll('button:not([disabled]), .global-search-results a[href]')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    const items = links();
    const index = items.indexOf(document.activeElement);
    if (document.activeElement !== input && index < 0) return;
    if (event.key === 'Enter' && document.activeElement === input && items.length) {
      event.preventDefault();
      items[0].click();
      return;
    }
    if (!items.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && index === 0) {
      input.focus();
      return;
    }
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : index < 0 ? items.length - 1 : index - 1;
    items[next].focus({ preventScroll: true });
    items[next].scrollIntoView?.({ block: 'nearest' });
  });
}
