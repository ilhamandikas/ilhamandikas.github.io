const { tk } = window;

const path = document.querySelector('#fnd-path');
const name = document.querySelector('#fnd-name');
const type = document.querySelector('#fnd-type');
const depth = document.querySelector('#fnd-depth');
const size = document.querySelector('#fnd-size');
const perm = document.querySelector('#fnd-perm');
const age = document.querySelector('#fnd-age');
const ageUnit = document.querySelector('#fnd-age-unit');
const exclude = document.querySelector('#fnd-exclude');
const action = document.querySelector('#fnd-action');
const exec = document.querySelector('#fnd-exec');
const execField = document.querySelector('#fnd-exec-field');
const empty = document.querySelector('#fnd-empty');
const ignoreCase = document.querySelector('#fnd-ignore-case');
const out = document.querySelector('#fnd-out');
const status = document.querySelector('#fnd-status');

function syncAction() {
  const needsCommand = action.value === 'exec' || action.value === 'exec-batch';
  execField.hidden = !needsCommand;
}

function build() {
  const start = path.value.trim() || '.';
  const nameValue = name.value.trim();
  const depthValue = depth.value.trim();
  const sizeValue = size.value.trim();
  const permValue = perm.value.trim();
  const ageValue = age.value.trim();
  const excludeValue = exclude.value.trim();
  const execValue = exec.value.trim();

  const parts = ['find', tk.shq(start)];
  if (depthValue) parts.push('-maxdepth', depthValue);
  if (excludeValue) {
    excludeValue
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((dir) => parts.push('-not', '-path', tk.shq(`*/${dir}/*`)));
  }
  if (nameValue) parts.push(ignoreCase.checked ? '-iname' : '-name', tk.shq(nameValue));
  if (type.value) parts.push('-type', type.value);
  if (sizeValue) parts.push('-size', sizeValue);
  if (ageValue) parts.push(ageUnit.value === 'mmin' ? '-mmin' : '-mtime', ageValue);
  if (permValue) parts.push('-perm', tk.shq(permValue));
  if (empty.checked) parts.push('-empty');

  if (action.value === 'print0') {
    parts.push('-print0');
  } else if (action.value === 'delete') {
    parts.push('-delete');
  } else if (action.value === 'exec' || action.value === 'exec-batch') {
    if (!execValue) {
      out.textContent = '';
      tk.setStatus(status, 'Enter the command to run for each match.', 'err');
      return;
    }
    parts.push('-exec', execValue, '{}', action.value === 'exec' ? '\\;' : '+');
  }

  out.textContent = parts.join(' ');
  tk.setStatus(status, '');
}

action.addEventListener('change', syncAction);
syncAction();
tk.live([path, name, type, depth, size, perm, age, ageUnit, exclude, action, exec, empty, ignoreCase], build);
