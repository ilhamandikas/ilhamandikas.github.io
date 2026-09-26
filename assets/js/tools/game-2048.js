// 2048: slide and merge tiles. Board and best score stay in the page.
const { tk } = window;

const SIZE = 4;
const BEST_KEY = 'ilham:best:game-2048';

const els = {
  board: document.querySelector('#g2048-board'),
  score: document.querySelector('#g2048-score'),
  best: document.querySelector('#g2048-best'),
  status: document.querySelector('#g2048-status'),
  newBtn: document.querySelector('#g2048-new'),
  undoBtn: document.querySelector('#g2048-undo'),
};

let board = [];
let score = 0;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
let undoState = null;
let won = false;
let over = false;

const emptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

function addRandom() {
  const spots = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) if (!board[r][c]) spots.push([r, c]);
  }
  if (!spots.length) return;
  const [r, c] = spots[Math.floor(Math.random() * spots.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function lineFor(dir, i) {
  const line = [];
  for (let j = 0; j < SIZE; j += 1) {
    if (dir === 'left') line.push(board[i][j]);
    else if (dir === 'right') line.push(board[i][SIZE - 1 - j]);
    else if (dir === 'up') line.push(board[j][i]);
    else line.push(board[SIZE - 1 - j][i]);
  }
  return line;
}

function writeLine(dir, i, line) {
  for (let j = 0; j < SIZE; j += 1) {
    if (dir === 'left') board[i][j] = line[j];
    else if (dir === 'right') board[i][SIZE - 1 - j] = line[j];
    else if (dir === 'up') board[j][i] = line[j];
    else board[SIZE - 1 - j][i] = line[j];
  }
}

function slide(line) {
  const nums = line.filter((n) => n);
  const out = [];
  let gained = 0;
  for (let i = 0; i < nums.length; i += 1) {
    if (nums[i] === nums[i + 1]) {
      const value = nums[i] * 2;
      out.push(value);
      gained += value;
      i += 1;
    } else out.push(nums[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { line: out, gained };
}

function canMove() {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (!board[r][c]) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function move(dir) {
  if (over) return;
  const snapshot = { board: board.map((row) => [...row]), score };
  let moved = false;
  let gained = 0;
  for (let i = 0; i < SIZE; i += 1) {
    const before = lineFor(dir, i);
    const result = slide(before);
    if (result.line.some((value, j) => value !== before[j])) moved = true;
    writeLine(dir, i, result.line);
    gained += result.gained;
  }
  if (!moved) return;
  undoState = snapshot;
  score += gained;
  addRandom();
  if (!won && board.some((row) => row.some((value) => value >= 2048))) {
    won = true;
    tk.setStatus(els.status, 'You reached 2048 — keep going!', 'ok');
  }
  if (!canMove()) {
    over = true;
    tk.setStatus(els.status, `No moves left. Score ${score}.`, 'err');
  } else if (!won) {
    tk.setStatus(els.status, '');
  }
  if (score > best) {
    best = score;
    localStorage.setItem(BEST_KEY, String(best));
  }
  render();
}

function render() {
  els.board.replaceChildren();
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const value = board[r][c];
      const cell = document.createElement('div');
      cell.className = `g2048-cell${value ? ` g2048-${Math.min(value, 2048)}` : ''}`;
      cell.textContent = value || '';
      els.board.appendChild(cell);
    }
  }
  els.score.textContent = String(score);
  els.best.textContent = String(best);
  els.undoBtn.disabled = !undoState;
}

function newGame() {
  board = emptyBoard();
  score = 0;
  undoState = null;
  won = false;
  over = false;
  addRandom();
  addRandom();
  tk.setStatus(els.status, '');
  render();
}

function undo() {
  if (!undoState) return;
  board = undoState.board;
  score = undoState.score;
  undoState = null;
  over = false;
  tk.setStatus(els.status, '');
  render();
}

const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down', h: 'left', l: 'right', k: 'up', j: 'down',
};

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const dir = KEYS[event.key] || KEYS[event.key.toLowerCase()];
  if (!dir) return;
  event.preventDefault();
  move(dir);
});

let touch = null;
els.board.addEventListener('touchstart', (event) => {
  const t = event.changedTouches[0];
  touch = { x: t.clientX, y: t.clientY };
}, { passive: true });
els.board.addEventListener('touchend', (event) => {
  if (!touch) return;
  const t = event.changedTouches[0];
  const dx = t.clientX - touch.x;
  const dy = t.clientY - touch.y;
  touch = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
  else move(dy > 0 ? 'down' : 'up');
}, { passive: true });

els.newBtn.addEventListener('click', newGame);
els.undoBtn.addEventListener('click', undo);

newGame();
