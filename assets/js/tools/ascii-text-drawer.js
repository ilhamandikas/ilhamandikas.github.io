// Draw text as ASCII art.
const { tk } = window;

// figlet is only needed once there is text to draw, so it is fetched on the
// first render instead of on page load.
let figletPromise = null;
const loadFiglet = () => {
  figletPromise = figletPromise || import(window.__toolVendors.figlet).then((module) => module.default);
  return figletPromise;
};

const text = document.querySelector('#atd-text');
const font = document.querySelector('#atd-font');
const width = document.querySelector('#atd-width');
const output = document.querySelector('#atd-output');
const status = document.querySelector('#atd-status');

async function render() {
  const value = text.value;
  if (value.trim() === '') { output.textContent = ''; tk.setStatus(status, ''); return; }
  try {
    const figlet = await loadFiglet();
    output.textContent = figlet.textSync(value, {
      font: font.value,
      width: Math.max(20, Math.min(200, Number(width.value) || 80)),
    });
    tk.setStatus(status, 'Ready', 'ok');
  } catch (error) {
    output.textContent = '';
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live([text, font, width], render);
