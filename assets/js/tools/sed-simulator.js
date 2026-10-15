import { simulateSed } from './sed-grep-simulator.js';
import { installTextSimulation } from './text-simulation-ui.js';

const $ = (id) => document.getElementById(`sed-${id}`);
const names = ['mode', 'pattern', 'replacement', 'global', 'ignore', 'extended', 'quiet'];
function syncMode() {
  for (const id of ['replacement-field', 'global-field', 'quiet-field']) $(id).hidden = $('mode').value !== 'sub';
}
$('mode').addEventListener('change', syncMode);
syncMode();
installTextSimulation({
  prefix: 'sed', controls: names.map($), simulate: simulateSed,
  readSettings: () => Object.fromEntries(names.map((name) => [name, $(name).type === 'checkbox' ? $(name).checked : $(name).value])),
});
