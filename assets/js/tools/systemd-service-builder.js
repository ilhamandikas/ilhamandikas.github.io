import { buildService } from './systemd-service-model.js';

const { tk } = window;
const $ = (id) => document.getElementById(`sd-${id}`);
const names = ['name', 'description', 'executable', 'directory', 'user', 'group', 'args', 'envFile', 'restart', 'restartSec', 'stopSec', 'envOptional', 'network', 'harden'];
const controls = names.map($);

function render() {
  $('output').value = '';
  $('commands').value = '';
  for (const name of ['copy', 'download', 'copy-commands']) $(name).disabled = true;
  tk.setStatus($('copy-status'), '');
  try {
    const settings = Object.fromEntries(names.map((name) => [name, $(name).type === 'checkbox' ? $(name).checked : $(name).value]));
    const result = buildService(settings);
    $('output').value = result.unit;
    $('commands').value = result.commands;
    $('download').dataset.filename = result.filename;
    for (const name of ['copy', 'download', 'copy-commands']) $(name).disabled = false;
    tk.setStatus($('status'), `${result.filename} ready for review. No server checks have been performed.`);
  } catch (error) {
    tk.setStatus($('status'), error.message, 'err');
  }
}
$('reset').addEventListener('click', () => {
  if (!window.confirm('Replace all fields with the example settings?')) return;
  for (const control of controls) {
    if (control.type === 'checkbox') control.checked = control.defaultChecked;
    else if (control.tagName === 'SELECT') control.selectedIndex = 0;
    else control.value = control.defaultValue;
  }
  render();
});
tk.live(controls, render);
