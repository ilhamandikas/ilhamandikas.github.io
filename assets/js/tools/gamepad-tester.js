// Show a connected controller's axes and buttons live. Browsers reveal a pad
// only after a button is pressed, so the first sighting can arrive well after
// the page has loaded.
const { tk } = window;

const els = {
  status: document.querySelector('#gpd-status'),
  count: document.querySelector('#gpd-count'),
  last: document.querySelector('#gpd-last'),
  pads: document.querySelector('#gpd-pads'),
};

const STANDARD = [
  'A / Cross',
  'B / Circle',
  'X / Square',
  'Y / Triangle',
  'LB / L1',
  'RB / R1',
  'LT / L2',
  'RT / R2',
  'Back / Share',
  'Start / Options',
  'L3',
  'R3',
  'D-pad up',
  'D-pad down',
  'D-pad left',
  'D-pad right',
  'Home',
];

const AXIS_NAMES = ['Left X', 'Left Y', 'Right X', 'Right Y'];

let frame = 0;
let signature = '';
let pressed = new Set();

function supported() {
  return typeof navigator.getGamepads === 'function';
}

function padName(pad, index) {
  return (pad.id || `Gamepad ${index}`).replace(/\s*\([^)]*\)\s*/g, ' ').trim();
}

function label(pad, index) {
  return pad.mapping === 'standard' && STANDARD[index] ? STANDARD[index] : `Button ${index}`;
}

function value(pad, index) {
  const button = pad.buttons[index];
  if (!button) return 0;
  return typeof button.value === 'number' ? button.value : button.pressed ? 1 : 0;
}

function card(pad) {
  const box = document.createElement('div');
  box.className = 'gpd-pad';

  const head = document.createElement('h3');
  head.className = 'gpd-name';
  head.textContent = padName(pad, pad.index);
  const meta = document.createElement('p');
  meta.className = 'gpd-meta';
  meta.textContent = `${pad.axes.length} axes · ${pad.buttons.length} buttons · ${pad.mapping === 'standard' ? 'standard mapping' : 'non-standard mapping'}`;
  box.append(head, meta);

  const axes = document.createElement('div');
  axes.className = 'gpd-axes';
  pad.axes.forEach((axis, index) => {
    const row = document.createElement('div');
    row.className = 'gpd-axis';
    const name = document.createElement('span');
    name.className = 'gpd-axis-name';
    name.textContent = AXIS_NAMES[index] || `Axis ${index}`;
    const track = document.createElement('span');
    track.className = 'gpd-track';
    const dot = document.createElement('span');
    dot.className = 'gpd-dot';
    dot.style.left = `${((axis + 1) / 2) * 100}%`;
    track.append(dot);
    const reading = document.createElement('span');
    reading.className = 'gpd-axis-value';
    reading.textContent = axis.toFixed(2);
    row.append(name, track, reading);
    axes.append(row);
  });
  box.append(axes);

  const grid = document.createElement('div');
  grid.className = 'gpd-buttons';
  pad.buttons.forEach((button, index) => {
    const item = document.createElement('span');
    item.className = 'gpd-button';
    if (button.pressed) item.classList.add('gpd-button-on');
    const name = document.createElement('span');
    name.className = 'gpd-button-name';
    name.textContent = label(pad, index);
    const amount = document.createElement('span');
    amount.className = 'gpd-button-value';
    amount.textContent = value(pad, index).toFixed(2);
    item.append(name, amount);
    grid.append(item);
  });
  box.append(grid);

  return box;
}

function tick() {
  const pads = [...navigator.getGamepads()].filter(Boolean);
  const now = new Set();
  const next = pads
    .map((pad) => {
      pad.buttons.forEach((button, index) => {
        if (button.pressed) now.add(`${pad.index}:${index}`);
      });
      return `${pad.index}:${pad.axes.map((axis) => axis.toFixed(2)).join(',')}:${pad.buttons.map((button) => (button.pressed ? '1' : '0')).join('')}`;
    })
    .join('|');

  if (next !== signature) {
    signature = next;
    els.pads.replaceChildren(...pads.map((pad) => card(pad)));
    els.count.textContent = pads.length ? `${pads.length} controller${pads.length === 1 ? '' : 's'}` : '—';

    const fresh = [...now].find((key) => !pressed.has(key));
    if (fresh) {
      const [padIndex, buttonIndex] = fresh.split(':').map(Number);
      const pad = pads.find((item) => item.index === padIndex);
      els.last.textContent = pad ? label(pad, buttonIndex) : `Button ${buttonIndex}`;
    }
    if (!now.size) els.last.textContent = '—';
    pressed = now;

    if (pads.length) {
      const idle = pads.every((pad) => !pad.buttons.some((button) => button.pressed) && pad.axes.every((axis) => Math.abs(axis) < 0.02));
      tk.setStatus(els.status, idle ? 'Controller ready — press a button or move a stick.' : 'Controller is being read.', 'ok');
    }
  }

  frame = requestAnimationFrame(tick);
}

if (!supported()) {
  // A missing API is worth saying once, and it is not an error: nothing was
  // attempted and nothing can be attempted.
  tk.setStatus(els.status, 'This browser does not offer gamepads to the page.');
} else {
  window.addEventListener('gamepadconnected', (event) => {
    tk.setStatus(els.status, `${padName(event.gamepad, event.gamepad.index)} connected.`, 'ok');
  });
  window.addEventListener('gamepaddisconnected', () => {
    signature = '';
    pressed = new Set();
    els.last.textContent = '—';
    tk.setStatus(els.status, 'A controller was disconnected.');
  });
  tk.setStatus(els.status, 'No controller detected yet. Press a button on a connected pad.');
  tick();
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
}
