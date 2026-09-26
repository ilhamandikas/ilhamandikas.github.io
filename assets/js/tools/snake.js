// Snake: eat, grow, don't hit the wall or yourself. DOM grid, no canvas.
const { tk } = window;

const COLS = 20;
const ROWS = 20;
const BEST_KEY = 'ilham:best:snake';

const els = {
  board: document.querySelector('#snake-board'),
  score: document.querySelector('#snake-score'),
  best: document.querySelector('#snake-best'),
  newBtn: document.querySelector('#snake-new'),
  pauseBtn: document.querySelector('#snake-pause'),
  status: document.querySelector('#snake-status'),
};

let snake = [];
let dir = { r: 0, c: 1 };
let nextDir = { r: 0, c: 1 };
let food = { r: 0, c: 0 };
let score = 0;
let best = Number(localStorage.getItem(BEST_KEY) || 0);
let timer = null;
let running = false;
let dead = false;
const cells = [];

function buildBoard() {
  els.board.style.setProperty('--snake-cols', String(COLS));
  els.board.replaceChildren();
  cells.length = 0;
  for (let r = 0; r < ROWS; r += 1) {
    cells[r] = [];
    for (let c = 0; c < COLS; c += 1) {
      const cell = document.createElement('div');
      cell.className = 'snake-cell';
      els.board.appendChild(cell);
      cells[r][c] = cell;
    }
  }
}

function spawnFood() {
  const free = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (!snake.some((s) => s.r === r && s.c === c)) free.push({ r, c });
    }
  }
  food = free[Math.floor(Math.random() * free.length)] || { r: 0, c: 0 };
}

const speed = () => Math.max(60, 150 - score * 3);

function render() {
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      cells[r][c].className = 'snake-cell';
    }
  }
  cells[food.r][food.c].classList.add('is-food');
  snake.forEach((segment, index) => {
    const cell = cells[segment.r][segment.c];
    cell.classList.add('is-snake');
    if (index === 0) cell.classList.add('is-head');
  });
  els.score.textContent = String(score);
  els.best.textContent = String(best);
}

function end() {
  dead = true;
  running = false;
  if (timer) clearTimeout(timer);
  timer = null;
  if (score > best) {
    best = score;
    localStorage.setItem(BEST_KEY, String(best));
  }
  tk.setStatus(els.status, `Game over — score ${score}, best ${best}.`, 'err');
  render();
}

function step() {
  dir = nextDir;
  const head = { r: snake[0].r + dir.r, c: snake[0].c + dir.c };
  if (head.r < 0 || head.r >= ROWS || head.c < 0 || head.c >= COLS) {
    end();
    return;
  }
  const willGrow = head.r === food.r && head.c === food.c;
  const body = willGrow ? snake : snake.slice(0, -1);
  if (body.some((s) => s.r === head.r && s.c === head.c)) {
    end();
    return;
  }
  snake.unshift(head);
  if (willGrow) {
    score += 1;
    spawnFood();
  } else {
    snake.pop();
  }
  render();
}

function loop() {
  if (!running) return;
  step();
  if (!dead && running) timer = setTimeout(loop, speed());
}

function start() {
  if (running || dead) return;
  running = true;
  tk.setStatus(els.status, '');
  els.pauseBtn.textContent = 'Pause';
  timer = setTimeout(loop, speed());
}

function pause() {
  if (dead) return;
  running = !running;
  els.pauseBtn.textContent = running ? 'Pause' : 'Resume';
  if (running) {
    tk.setStatus(els.status, '');
    timer = setTimeout(loop, speed());
  } else {
    if (timer) clearTimeout(timer);
    timer = null;
    tk.setStatus(els.status, 'Paused');
  }
}

function turn(r, c) {
  if (r === -dir.r && c === -dir.c) return;
  nextDir = { r, c };
  start();
}

const KEYS = {
  ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1],
};

document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const move = KEYS[key];
  if (move) {
    event.preventDefault();
    turn(move[0], move[1]);
  } else if (key === ' ') {
    event.preventDefault();
    pause();
  }
});

function newGame() {
  snake = [{ r: 10, c: 10 }, { r: 10, c: 9 }, { r: 10, c: 8 }];
  dir = { r: 0, c: 1 };
  nextDir = { r: 0, c: 1 };
  score = 0;
  dead = false;
  running = false;
  if (timer) clearTimeout(timer);
  timer = null;
  spawnFood();
  els.pauseBtn.textContent = 'Pause';
  tk.setStatus(els.status, '');
  render();
}

els.board.parentElement.querySelectorAll('[data-snake-dir]').forEach((button) => {
  button.addEventListener('click', () => {
    const [r, c] = button.dataset.snakeDir.split(',').map(Number);
    turn(r, c);
  });
});

els.newBtn.addEventListener('click', newGame);
els.pauseBtn.addEventListener('click', pause);

buildBoard();
newGame();
