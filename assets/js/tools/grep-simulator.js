import { simulateGrep } from './sed-grep-simulator.js';
import { installTextSimulation } from './text-simulation-ui.js';

const $ = (id) => document.getElementById(`grp-${id}`);
const names = ['pattern', 'style', 'context', 'ignore', 'numbers', 'word', 'invert', 'count', 'only'];
installTextSimulation({
  prefix: 'grp', controls: names.map($), simulate: simulateGrep,
  readSettings: () => Object.fromEntries(names.map((name) => [name, $(name).type === 'checkbox' ? $(name).checked : $(name).value])),
});
