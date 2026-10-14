function duration(ms) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

export function createConsole({ els, preparedInput }) {
  const { tk } = window;
  let lines = [];
  function clear() {
    lines = [];
    els.output.replaceChildren();
    els.output.textContent = '(no output)';
  }
  function append(kind, text) {
    if (lines.length >= 500) return;
    if (!lines.length) els.output.replaceChildren();
    lines.push(`${kind}: ${text}`);
    const row = document.createElement('div');
    row.className = `tool-console-line tool-console-${['warn', 'error', 'result'].includes(kind) ? kind : 'log'}`;
    const tag = document.createElement('span');
    tag.className = 'tool-console-tag';
    tag.textContent = kind;
    const body = document.createElement('span');
    body.textContent = text;
    row.append(tag, body);
    els.output.append(row);
    els.output.scrollTop = els.output.scrollHeight;
    if (lines.length === 500) tk.setStatus(els.status, 'Output limited to 500 rows. Stop or run again to reset.', '');
  }
  function metrics(timing, data = null, stopped = false) {
    if (!timing) return;
    const now = performance.now();
    const preparation = data?.preparation ?? timing.preparation ?? now - timing.requested;
    const execution = data ? data.execution : timing.started === null ? null : now - timing.started;
    const parts = [`Preparation: ${duration(preparation)}`];
    if (execution !== null && execution !== undefined) {
      const label = stopped ? 'Elapsed execution until Stop' : preparedInput ? 'Execution' : 'Main code';
      parts.push(`${label}: ${duration(execution)}`);
    }
    if (Number.isFinite(data?.memory)) parts.push(`WASM linear memory: ${(data.memory / 1048576).toFixed(2)} MiB`);
    els.metrics.textContent = parts.join(' · ');
  }
  els.clearOutput.addEventListener('click', clear);
  els.copyOutput.addEventListener('click', () => tk.copy(lines.join('\n'), els.status));
  clear();
  return { clear, append, metrics };
}
