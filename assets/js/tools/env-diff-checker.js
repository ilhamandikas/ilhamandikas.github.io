import { parseEnv, compareEnv } from './env-diff-parser.js';

const { tk } = window;
const $ = (id) => document.getElementById(`ed-${id}`);
let rows = null;

function invalidate() {
  rows = null;
  $('results').replaceChildren();
  $('table').hidden = true;
  $('copy').disabled = true;
  $('report').value = '';
  $('reveal').checked = false;
  tk.setStatus($('copy-status'), '');
  tk.setStatus($('status'), 'Inputs changed. Compare again to update the results.');
}

function render() {
  if (!rows) return;
  const counts = { 'Only left': 0, 'Only right': 0, Changed: 0, Same: 0 };
  for (const row of rows) counts[row.kind] += 1;
  tk.setStatus($('status'), rows.length ? `${counts['Only left']} only left · ${counts['Only right']} only right · ${counts.Changed} changed · ${counts.Same} unchanged` : 'No keys found in either input.');
  $('results').replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    if (row.kind === 'Same' && !$('same').checked) continue;
    const tr = document.createElement('tr');
    const show = (value) => value === undefined ? '(missing)' : value === '' ? '(empty)' : $('reveal').checked ? JSON.stringify(value) : '••••••';
    for (const value of [row.key, row.kind, show(row.left), show(row.right)]) {
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(td);
    }
    fragment.append(tr);
  }
  $('results').append(fragment);
  $('table').hidden = !$('results').children.length;
  // Never include values in the clipboard report, even when revealed on screen.
  $('report').value = rows.map((row) => `${row.kind}\t${row.key}`).join('\n');
  $('copy').disabled = !rows.length;
}

$('run').addEventListener('click', () => {
  invalidate();
  try {
    rows = compareEnv(parseEnv($('left').value, 'Left'), parseEnv($('right').value, 'Right'));
    render();
  } catch (error) {
    tk.setStatus($('status'), error.message, 'err');
  }
});
for (const name of ['left', 'right']) $(name).addEventListener('input', invalidate);
for (const name of ['same', 'reveal']) $(name).addEventListener('change', render);
$('clear').addEventListener('click', () => {
  $('left').value = '';
  $('right').value = '';
  $('same').checked = false;
  invalidate();
  tk.setStatus($('status'), 'Inputs and results cleared.');
});
$('example').addEventListener('click', () => {
  if (($('left').value || $('right').value) && !window.confirm('Replace both inputs with the example?')) return;
  $('left').value = '# Staging example\nAPP_ENV=staging\nPORT=3000\nDEBUG=true\nAPI_TOKEN=\n';
  $('right').value = '# Production example\nAPP_ENV=production\nPORT=3000\nCACHE_ENABLED=true\nAPI_TOKEN="example-only"\n';
  $('run').click();
});
