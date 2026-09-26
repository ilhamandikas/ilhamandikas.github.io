// Minesweeper: clear the grid without hitting a mine. First click is always safe.
const { tk } = window;

const LEVELS = {
  easy: { cols: 9, rows: 9, mines: 10 },
  medium: { cols: 12, rows: 12, mines: 22 },
  hard: { cols: 16, rows: 16, mines: 40 },
};

const els = {
  level: document.querySelector('#ms-level'),
  newBtn: document.querySelector('#ms-new'),
  board: document.querySelector('#ms-board'),
  mines: document.querySelector('#ms-mines'),
  time: document.querySelector('#ms-time'),
  status: document.querySelector('#ms-status'),
};

let cols = 9;
let rows = 9;
let mineCount = 10;
let grid = [];
let placed = false;
let revealedCount = 0;
let flags = 0;
let over = false;
let started = 0;
let timer = null;

const at = (r, c) => (r >= 0 && r < rows && c >= 0 && c < cols ? grid[r][c] : null);

function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const cell = at(r + dr, c + dc);
      if (cell) out.push(cell);
    }
  }
  return out;
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
}

function elapsed() {
  return started ? Math.floor((Date.now() - started) / 1000) : 0;
}

function tick() {
  els.time.textContent = `${elapsed()}s`;
}

function newGame() {
  const level = LEVELS[els.level.value] || LEVELS.easy;
  cols = level.cols;
  rows = level.rows;
  mineCount = level.mines;
  grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c, mine: false, revealed: false, flagged: false, count: 0 })));
  placed = false;
  revealedCount = 0;
  flags = 0;
  over = false;
  started = 0;
  stopTimer();
  els.board.style.setProperty('--ms-cols', String(cols));
  els.mines.textContent = String(mineCount);
  els.time.textContent = '0s';
  tk.setStatus(els.status, '');
  render();
}

function placeMines(safeR, safeC) {
  const forbidden = new Set();
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) forbidden.add(`${safeR + dr},${safeC + dc}`);
  }
  const spots = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) if (!forbidden.has(`${r},${c}`)) spots.push([r, c]);
  }
  for (let i = spots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }
  spots.slice(0, mineCount).forEach(([r, c]) => { grid[r][c].mine = true; });
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      grid[r][c].count = neighbors(r, c).filter((cell) => cell.mine).length;
    }
  }
  placed = true;
}

function startClock() {
  if (started) return;
  started = Date.now();
  timer = setInterval(tick, 1000);
}

function revealFlood(startR, startC) {
  const stack = [[startR, startC]];
  while (stack.length) {
    const [r, c] = stack.pop();
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    revealedCount += 1;
    if (cell.count === 0 && !cell.mine) {
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          const next = at(r + dr, c + dc);
          if (next && !next.revealed && !next.flagged && !next.mine) stack.push([next.r, next.c]);
        }
      }
    }
  }
}

function lose(hit) {
  over = true;
  stopTimer();
  grid.forEach((row) => row.forEach((cell) => { if (cell.mine) cell.revealed = true; }));
  hit.hit = true;
  tk.setStatus(els.status, `Boom — that was a mine. ${revealedCount} cells cleared in ${elapsed()}s.`, 'err');
  render();
}

function checkWin() {
  if (revealedCount !== rows * cols - mineCount) return;
  over = true;
  stopTimer();
  tk.setStatus(els.status, `Cleared in ${elapsed()}s with ${flags} flag${flags === 1 ? '' : 's'}.`, 'ok');
  render();
}

function reveal(r, c) {
  if (over) return;
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged) return;
  startClock();
  if (!placed) placeMines(r, c);
  if (cell.mine) {
    lose(cell);
    return;
  }
  revealFlood(r, c);
  render();
  checkWin();
}

function flag(r, c) {
  if (over) return;
  const cell = grid[r][c];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  flags += cell.flagged ? 1 : -1;
  els.mines.textContent = String(mineCount - flags);
  render();
}

function render() {
  els.board.replaceChildren();
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = grid[r][c];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ms-cell';
      button.dataset.r = String(r);
      button.dataset.c = String(c);
      if (cell.revealed) button.classList.add('is-revealed');
      if (cell.flagged && !cell.revealed) button.classList.add('is-flagged');
      if (cell.mine && cell.revealed) button.classList.add('is-mine');
      if (cell.hit) button.classList.add('is-hit');
      if (cell.revealed && !cell.mine && cell.count) {
        button.classList.add(`ms-n${cell.count}`);
        button.textContent = String(cell.count);
      } else if (cell.flagged && !cell.revealed) {
        button.textContent = '⚑';
      } else if (cell.mine && cell.revealed) {
        button.textContent = '✸';
      }
      els.board.appendChild(button);
    }
  }
}

els.board.addEventListener('click', (event) => {
  const button = event.target.closest('.ms-cell');
  if (!button) return;
  reveal(Number(button.dataset.r), Number(button.dataset.c));
});

els.board.addEventListener('contextmenu', (event) => {
  const button = event.target.closest('.ms-cell');
  if (!button) return;
  event.preventDefault();
  flag(Number(button.dataset.r), Number(button.dataset.c));
});

els.newBtn.addEventListener('click', newGame);
els.level.addEventListener('change', newGame);

newGame();
