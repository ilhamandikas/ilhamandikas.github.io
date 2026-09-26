// Tetris: stack tetrominoes and clear lines. DOM grid, no canvas.
const { tk } = window;

const COLS = 10;
const ROWS = 20;
const SHAPES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
};
const TYPES = Object.keys(SHAPES);
const SCORE = [0, 100, 300, 500, 800];

const els = {
  board: document.querySelector('#tetris-board'),
  next: document.querySelector('#tetris-next'),
  hold: document.querySelector('#tetris-hold'),
  score: document.querySelector('#tetris-score'),
  lines: document.querySelector('#tetris-lines'),
  level: document.querySelector('#tetris-level'),
  status: document.querySelector('#tetris-status'),
  newBtn: document.querySelector('#tetris-new'),
  pauseBtn: document.querySelector('#tetris-pause'),
};

let board = [];
let piece = null;
let bag = [];
let nextType = null;
let holdType = null;
let canHold = true;
let score = 0;
let lines = 0;
let level = 1;
let timer = null;
let over = false;
let paused = false;
const cells = [];

const clone = (matrix) => matrix.map((row) => [...row]);

function buildBoard() {
  els.board.style.setProperty('--tetris-cols', String(COLS));
  els.board.replaceChildren();
  cells.length = 0;
  for (let r = 0; r < ROWS; r += 1) {
    cells[r] = [];
    for (let c = 0; c < COLS; c += 1) {
      const cell = document.createElement('div');
      cell.className = 'tetris-cell';
      els.board.appendChild(cell);
      cells[r][c] = cell;
    }
  }
}

function drawType() {
  if (!bag.length) {
    bag = [...TYPES];
    for (let i = bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  return bag.pop();
}

function rotate(matrix) {
  const size = matrix.length;
  const out = Array.from({ length: size }, () => Array(size).fill(0));
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) out[c][size - 1 - r] = matrix[r][c];
  }
  return out;
}

function collides(matrix, r, c) {
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix[i].length; j += 1) {
      if (!matrix[i][j]) continue;
      const nr = r + i;
      const nc = c + j;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
      if (nr >= 0 && board[nr][nc]) return true;
    }
  }
  return false;
}

function speed() {
  return Math.max(80, 800 - (level - 1) * 70);
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!over && !paused) timer = setTimeout(tick, speed());
}

function spawn() {
  piece = { type: nextType, matrix: clone(SHAPES[nextType]), r: 0, c: Math.floor((COLS - SHAPES[nextType][0].length) / 2) };
  nextType = drawType();
  canHold = true;
  if (collides(piece.matrix, piece.r, piece.c)) {
    over = true;
    if (timer) clearTimeout(timer);
    timer = null;
    tk.setStatus(els.status, `Game over — score ${score}, ${lines} lines.`, 'err');
  }
  render();
}

function lock() {
  piece.matrix.forEach((row, i) => {
    row.forEach((value, j) => {
      if (value && piece.r + i >= 0) board[piece.r + i][piece.c + j] = piece.type;
    });
  });
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r -= 1) {
    if (board[r].every(Boolean)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      r += 1;
    }
  }
  if (cleared) {
    score += SCORE[cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
  }
  spawn();
}

function tick() {
  if (over || paused) return;
  if (!collides(piece.matrix, piece.r + 1, piece.c)) {
    piece.r += 1;
    render();
  } else {
    lock();
  }
  schedule();
}

function move(dc) {
  if (over || paused || !piece) return;
  if (!collides(piece.matrix, piece.r, piece.c + dc)) {
    piece.c += dc;
    render();
  }
}

function softDrop() {
  if (over || paused || !piece) return;
  if (!collides(piece.matrix, piece.r + 1, piece.c)) {
    piece.r += 1;
    score += 1;
    render();
  } else {
    lock();
    schedule();
  }
}

function hardDrop() {
  if (over || paused || !piece) return;
  let dropped = 0;
  while (!collides(piece.matrix, piece.r + 1, piece.c)) {
    piece.r += 1;
    dropped += 1;
  }
  score += dropped * 2;
  lock();
  schedule();
}

function rotatePiece() {
  if (over || paused || !piece) return;
  const rotated = rotate(piece.matrix);
  for (const kick of [0, -1, 1, -2, 2]) {
    if (!collides(rotated, piece.r, piece.c + kick)) {
      piece.matrix = rotated;
      piece.c += kick;
      render();
      return;
    }
  }
}

function hold() {
  if (over || paused || !canHold || !piece) return;
  const current = piece.type;
  if (holdType) {
    const swap = holdType;
    holdType = current;
    piece = { type: swap, matrix: clone(SHAPES[swap]), r: 0, c: Math.floor((COLS - SHAPES[swap][0].length) / 2) };
    if (collides(piece.matrix, piece.r, piece.c)) {
      over = true;
      tk.setStatus(els.status, 'Game over.', 'err');
    }
  } else {
    holdType = current;
    spawn();
  }
  canHold = false;
  render();
}

function preview(container, type) {
  container.replaceChildren();
  if (!type) return;
  const matrix = SHAPES[type];
  const size = matrix.length;
  container.style.setProperty('--mini-cols', String(size));
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const cell = document.createElement('div');
      cell.className = 'tetris-mini';
      if (matrix[r][c]) cell.classList.add('is-filled', `is-${type}`);
      container.appendChild(cell);
    }
  }
}

function render() {
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      cells[r][c].className = 'tetris-cell';
      if (board[r][c]) cells[r][c].classList.add('is-filled', `is-${board[r][c]}`);
    }
  }
  if (piece && !over) {
    let ghostRow = piece.r;
    while (!collides(piece.matrix, ghostRow + 1, piece.c)) ghostRow += 1;
    piece.matrix.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value && ghostRow + i >= 0 && ghostRow + i < ROWS) {
          cells[ghostRow + i][piece.c + j].classList.add('is-ghost');
        }
      });
    });
    piece.matrix.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value && piece.r + i >= 0) {
          cells[piece.r + i][piece.c + j].className = `tetris-cell is-filled is-${piece.type}`;
        }
      });
    });
  }
  els.score.textContent = String(score);
  els.lines.textContent = String(lines);
  els.level.textContent = String(level);
  preview(els.next, nextType);
  preview(els.hold, holdType);
}

function pause() {
  if (over) return;
  paused = !paused;
  els.pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  if (paused) {
    if (timer) clearTimeout(timer);
    timer = null;
    tk.setStatus(els.status, 'Paused');
  } else {
    tk.setStatus(els.status, '');
    schedule();
  }
}

const KEYS = {
  ArrowLeft: () => move(-1),
  ArrowRight: () => move(1),
  ArrowDown: softDrop,
  ArrowUp: rotatePiece,
  z: rotatePiece,
  ' ': hardDrop,
  c: hold,
  p: pause,
};

document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const action = KEYS[key];
  if (!action) return;
  event.preventDefault();
  action();
});

function newGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  bag = [];
  holdType = null;
  score = 0;
  lines = 0;
  level = 1;
  over = false;
  paused = false;
  els.pauseBtn.textContent = 'Pause';
  nextType = drawType();
  spawn();
  tk.setStatus(els.status, '');
  schedule();
}

els.newBtn.addEventListener('click', newGame);
els.pauseBtn.addEventListener('click', pause);

buildBoard();
newGame();
