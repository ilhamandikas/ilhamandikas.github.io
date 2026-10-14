import { buildRsync } from './rsync-command-model.js';

const { tk } = window;
const $ = (id) => document.getElementById(`rs-${id}`);
const names = ['mode', 'source', 'destination', 'contents', 'host', 'user', 'port', 'identity', 'excludes', 'bandwidth', 'dryRun', 'compress', 'checksum', 'delete', 'ackDelete'];
function render() {
  const mode = $('mode').value;
  $('ssh-fields').hidden = mode === 'local';
  $('source-label').textContent = mode === 'download' ? 'Remote source directory' : 'Local source directory';
  $('destination-label').textContent = mode === 'upload' ? 'Remote destination directory' : 'Local destination directory';
  $('delete-confirm').hidden = !$('delete').checked || $('dryRun').checked;
  $('slash-help').textContent = $('contents').checked ? 'Contents mode: /data/app/ → /backup/ places app contents directly in /backup/.' : 'Directory mode: /data/app → /backup/ places the app directory under /backup/app/.';
  $('output').value = '';
  $('preview').value = '';
  for (const key of ['copy', 'copy-preview']) $(key).disabled = true;
  for (const key of ['warnings', 'explanations']) $(key).replaceChildren();
  tk.setStatus($('copy-status'), '');
  try {
    const settings = Object.fromEntries(names.map((name) => [name, $(name).type === 'checkbox' ? $(name).checked : $(name).value]));
    const result = buildRsync(settings);
    const command = (argv) => ['rsync', ...argv.map((value) => tk.shq(value))].join(' ');
    if (result.argv) { $('output').value = command(result.argv); $('copy').disabled = false; }
    $('preview').value = command(result.previewArgv);
    $('copy-preview').disabled = false;
    for (const key of ['warnings', 'explanations']) {
      for (const text of result[key]) {
        const li = document.createElement('li');
        li.textContent = text;
        $(key).append(li);
      }
    }
    tk.setStatus($('status'), result.needsDeleteConfirmation ? 'Review the dry-run and confirm destination deletion to unlock the real command.' : 'Command ready for review. Nothing has been run.');
  } catch (error) {
    tk.setStatus($('status'), error.message, 'err');
  }
}
// Any settings change invalidates the previous deletion acknowledgement.
for (const name of names.filter((name) => name !== 'ackDelete')) {
  for (const event of ['input', 'change']) $(name).addEventListener(event, () => { $('ackDelete').checked = false; });
}
tk.live(names.map($), render);
