import { categories, redactLog } from './log-redactor-model.js';

const { tk } = window;
const $ = (id) => document.getElementById(`lr-${id}`);
const patterns = Object.keys(categories).filter((key) => key !== 'custom');
function invalidate() {
  $('output').value = '';
  $('counts').replaceChildren();
  $('copy').disabled = true;
  $('download').disabled = true;
  tk.setStatus($('copy-status'), '');
}
function changed() {
  invalidate();
  tk.setStatus($('status'), 'Input or patterns changed. Redact again before copying.');
}
for (const name of ['input', 'custom', ...patterns]) $(name).addEventListener('input', changed);
for (const name of patterns) $(name).addEventListener('change', changed);
$('run').addEventListener('click', () => {
  invalidate();
  if (!$('input').value.trim()) {
    tk.setStatus($('status'), 'Paste a log to redact. The input will remain unchanged.');
    return;
  }
  try {
    const options = Object.fromEntries(patterns.map((key) => [key, $(key).checked]));
    const result = redactLog($('input').value, options, $('custom').value);
    $('output').value = result.text;
    for (const [key, count] of Object.entries(result.counts)) {
      if (!count) continue;
      const li = document.createElement('li');
      li.textContent = `${categories[key]}: ${count}`;
      $('counts').append(li);
    }
    const summary = result.regions ? `${result.regions} region${result.regions === 1 ? '' : 's'} redacted.` : 'No selected patterns matched. This does not mean the log contains no secrets.';
    tk.setStatus($('status'), `${summary}${result.conservativeTail ? ' An incomplete or multiline sensitive value caused the remaining log to be hidden.' : ''} Review the preview before sharing.`);
    $('copy').disabled = !result.text;
    $('download').disabled = !result.text;
  } catch (error) {
    tk.setStatus($('status'), error.message, 'err');
  }
});
$('clear').addEventListener('click', () => {
  $('input').value = '';
  $('custom').value = '';
  invalidate();
  tk.setStatus($('status'), 'Input, exact-text entries, and preview cleared.');
});
$('example').addEventListener('click', () => {
  if ($('input').value || $('custom').value) {
    tk.setStatus($('status'), 'Clear the current input and exact-text entries before loading the example.');
    return;
  }
  $('input').value = [
    '2026-10-14T12:00:00Z request_id=example-001',
    'Authorization: Bearer example-token-do-not-use',
    'Cookie: session=example-cookie',
    'DB_PASSWORD=example-password',
    'Database connection: postgres://example-user:example-pass@example.com:5432/example',
    'Contact user@example.com from 192.0.2.10 and [2001:db8::1]',
    'Host internal.example.com returned status=502',
  ].join('\n');
  $('custom').value = 'internal.example.com';
  $('run').click();
});
