// The draft stays editable even before stdin is requested. Sending is enabled
// only while the worker is waiting, so early typing never disappears or runs code.
export function createTerminal({ els, onSend }) {
  const focus = () => els.input.focus({ preventScroll: els.workspace.classList.contains('tool-fullscreen') });
  function reset({ clear = false } = {}) {
    els.inputForm.hidden = false;
    els.send.disabled = true;
    els.eof.disabled = true;
    els.inputLabel.textContent = 'Terminal input';
    els.workspace.removeAttribute('data-waiting');
    if (clear) els.input.value = '';
    els.input.placeholder = 'Type a line; send when the program asks';
    els.terminalHint.textContent = els.inputMode?.value === 'prepared'
      ? 'Prepared input is enabled. Select Interactive input in Options for live stdin.'
      : 'You can type ahead. Enter or Send submits a line when the program asks; EOF (Ctrl + D) ends input.';
  }
  function wait(data) {
    if (els.workspace.classList.contains('tool-fullscreen')) els.options.open = false;
    els.inputLabel.textContent = data.label || 'Terminal input';
    if (!els.input.value) els.input.value = data.value || '';
    els.send.disabled = false;
    els.eof.disabled = false;
    els.workspace.setAttribute('data-waiting', '');
    els.terminalHint.textContent = 'Waiting for input. Enter or Send submits this line; EOF (Ctrl + D) ends input.';
    focus();
  }
  function send(value) {
    if (els.send.disabled || !onSend(value)) return;
    reset({ clear: true });
    focus();
  }
  els.inputForm.addEventListener('submit', (event) => { event.preventDefault(); send(els.input.value); });
  els.eof.addEventListener('click', () => send(null));
  els.input.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'd') { event.preventDefault(); send(null); }
  });
  els.output.addEventListener('click', () => {
    if (!window.getSelection()?.toString()) focus();
  });
  reset();
  return { reset, wait };
}
