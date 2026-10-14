import { buildTar } from './tar-command-model.js';

const { tk } = window;
const $ = (id) => document.getElementById(`tar-${id}`);
const names = ['mode', 'archive', 'sourceDirectory', 'extractDirectory', 'compression', 'members', 'excludes', 'strip', 'keepOld', 'verbose'];
function render() {
  const mode = $('mode').value;
  $('create-fields').hidden = mode !== 'create';
  $('compression-field').hidden = mode !== 'create';
  $('extract-fields').hidden = mode !== 'extract';
  $('sourceDirectory-field').hidden = mode !== 'create';
  $('extractDirectory-field').hidden = mode !== 'extract';
  $('output').value = '';
  $('preview').value = '';
  $('preview-panel').hidden = true;
  $('copy').disabled = true;
  $('copy-preview').disabled = true;
  $('warnings').replaceChildren();
  $('explanations').replaceChildren();
  tk.setStatus($('copy-status'), '');
  try {
    const settings = Object.fromEntries(names.map((name) => [name, $(name).type === 'checkbox' ? $(name).checked : $(name).value]));
    settings.directory = mode === 'create' ? settings.sourceDirectory : settings.extractDirectory;
    const result = buildTar(settings);
    const command = (argv) => ['tar', ...argv.map((value) => tk.shq(value))].join(' ');
    $('output').value = command(result.argv);
    $('copy').disabled = false;
    if (result.previewArgv) {
      $('preview').value = command(result.previewArgv);
      $('preview-panel').hidden = false;
      $('copy-preview').disabled = false;
    }
    for (const key of ['warnings', 'explanations']) {
      for (const text of result[key]) {
        const li = document.createElement('li');
        li.textContent = text;
        $(key).append(li);
      }
    }
    tk.setStatus($('status'), 'Command ready for review. Nothing has been run.');
  } catch (error) {
    tk.setStatus($('status'), error.message, 'err');
  }
}
tk.live(names.map($), render);
