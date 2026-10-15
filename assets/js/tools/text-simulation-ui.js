export function installTextSimulation({ prefix, controls, readSettings, simulate }) {
  const { tk } = window;
  const get = (id) => document.getElementById(`${prefix}-sim-${id}`);
  const invalidate = () => {
    get('output').value = '';
    get('copy').disabled = true;
    tk.setStatus(get('copy-status'), '');
    tk.setStatus(get('status'), 'Settings or sample changed. Simulate again to update the result.');
  };
  for (const control of [...controls, get('input')]) {
    control.addEventListener('input', invalidate);
    control.addEventListener('change', invalidate);
  }
  get('run').addEventListener('click', () => {
    invalidate();
    try {
      const result = simulate({ ...readSettings(), text: get('input').value });
      get('output').value = result.output;
      get('copy').disabled = !result.output;
      tk.setStatus(get('status'), `${result.summary}${result.output ? '' : ' Output is empty.'}`);
    } catch (error) {
      tk.setStatus(get('status'), error.message, 'err');
    }
  });
  get('clear').addEventListener('click', () => {
    get('input').value = '';
    invalidate();
    tk.setStatus(get('status'), 'Sample and simulation result cleared. Builder settings are unchanged.');
  });
}
