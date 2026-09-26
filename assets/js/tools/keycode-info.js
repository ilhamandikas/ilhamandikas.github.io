// Show the details of the next key you press.
const { tk } = window;

const area = document.querySelector('#kc-area');
const results = document.querySelector('#kc-results');
const status = document.querySelector('#kc-status');

area.addEventListener('keydown', (event) => {
  event.preventDefault();
  const rows = [
    ['key', event.key === ' ' ? 'Space' : event.key],
    ['code', event.code],
    ['keyCode', event.keyCode],
    ['which', event.which],
    ['location', event.location],
    ['Modifiers', [event.ctrlKey && 'Ctrl', event.altKey && 'Alt', event.shiftKey && 'Shift', event.metaKey && 'Meta'].filter(Boolean).join(' + ') || 'none'],
  ];
  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${String(value)}</dd>`;
      return row;
    }),
  );
  area.value = event.key === ' ' ? 'Space' : event.key;
  tk.setStatus(status, 'Captured', 'ok');
});

area.addEventListener('focus', () => tk.setStatus(status, 'Waiting for a key…'));
