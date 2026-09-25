// chmod calculator — octal <-> rwx, kept in sync both ways.
const { tk } = window;

const octalInput = document.querySelector('#chmod-octal');
const checks = tk.$$('#chmod-grid input[type="checkbox"]');
const results = document.querySelector('#chmod-results');
const status = document.querySelector('#chmod-status');

const WHOS = ['u', 'g', 'o'];
const LETTER = { 4: 'r', 2: 'w', 1: 'x' };

function render(digits) {
  const symbolic = WHOS
    .map((who, index) => {
      const digit = digits[index];
      return [4, 2, 1].map((bit) => (digit & bit ? LETTER[bit] : '-')).join('');
    })
    .join('');

  const rows = [
    ['Symbolic', symbolic],
    ['Octal', digits.join('')],
    ['Special (setuid/setgid/sticky)', symbolic[2] === 's' || symbolic[5] === 's' || symbolic[8] === 't' ? 'yes' : 'no'],
    ['Command', `chmod ${digits.join('')} <file>`],
  ];
  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
      return row;
    }),
  );
}

function fromOctal() {
  const raw = octalInput.value.trim();
  if (!/^[0-7]{3,4}$/.test(raw)) {
    tk.setStatus(status, 'Enter 3 or 4 octal digits (0–7)', 'err');
    results.replaceChildren();
    return;
  }
  const digits = raw.slice(-3).split('').map(Number);
  checks.forEach((box) => {
    const index = WHOS.indexOf(box.dataset.who);
    box.checked = (digits[index] & Number(box.dataset.bit)) !== 0;
  });
  render(digits);
  tk.setStatus(status, '');
}

function fromChecks() {
  const digits = WHOS.map((who) => {
    const box = checks.filter((c) => c.dataset.who === who);
    return box.reduce((sum, c) => sum + (c.checked ? Number(c.dataset.bit) : 0), 0);
  });
  octalInput.value = digits.join('');
  render(digits);
  tk.setStatus(status, '');
}

octalInput.addEventListener('input', fromOctal);
checks.forEach((box) => box.addEventListener('change', fromChecks));
fromOctal();
