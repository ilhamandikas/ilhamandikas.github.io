// Memory match: flip cards and pair the symbols. Everything runs in the page.
const { tk } = window;

const SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🍒', '🍑', '🥝', '🍍', '🥥', '🍌', '🍐', '🥑', '🌽', '🥕', '🍄', '🌶️'];
const LEVELS = {
  easy: { cols: 4, rows: 4 },
  medium: { cols: 6, rows: 4 },
  hard: { cols: 6, rows: 6 },
};

const els = {
  level: document.querySelector('#mm-level'),
  newBtn: document.querySelector('#mm-new'),
  board: document.querySelector('#mm-board'),
  moves: document.querySelector('#mm-moves'),
  time: document.querySelector('#mm-time'),
  status: document.querySelector('#mm-status'),
};

let cards = [];
let flipped = [];
let matched = 0;
let moves = 0;
let lock = false;
let started = 0;
let timer = null;

const shuffle = (list) => {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

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
  const { cols, rows } = LEVELS[els.level.value] || LEVELS.easy;
  const pairs = (cols * rows) / 2;
  const picked = SYMBOLS.slice(0, pairs);
  cards = shuffle([...picked, ...picked].map((symbol) => ({ symbol, matched: false })));
  flipped = [];
  matched = 0;
  moves = 0;
  lock = false;
  started = 0;
  stopTimer();
  els.board.style.setProperty('--mm-cols', String(cols));
  els.moves.textContent = '0';
  els.time.textContent = '0s';
  tk.setStatus(els.status, '');
  render();
}

function render() {
  els.board.replaceChildren();
  cards.forEach((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mm-card';
    button.dataset.index = String(index);
    const up = card.matched || flipped.includes(index);
    if (up) button.classList.add('is-up');
    if (card.matched) button.classList.add('is-matched');
    button.textContent = up ? card.symbol : '';
    button.setAttribute('aria-label', up ? card.symbol : 'Hidden card');
    els.board.appendChild(button);
  });
}

function checkWin() {
  if (matched !== cards.length) return;
  stopTimer();
  tk.setStatus(els.status, `Solved in ${moves} moves and ${elapsed()}s.`, 'ok');
}

function flip(index) {
  if (lock || flipped.includes(index) || cards[index].matched) return;
  if (!started) {
    started = Date.now();
    timer = setInterval(tick, 1000);
  }
  flipped.push(index);
  render();
  if (flipped.length < 2) return;
  moves += 1;
  els.moves.textContent = String(moves);
  const [a, b] = flipped;
  if (cards[a].symbol === cards[b].symbol) {
    cards[a].matched = true;
    cards[b].matched = true;
    matched += 2;
    flipped = [];
    render();
    checkWin();
  } else {
    lock = true;
    setTimeout(() => {
      flipped = [];
      lock = false;
      render();
    }, 700);
  }
}

els.board.addEventListener('click', (event) => {
  const button = event.target.closest('.mm-card');
  if (!button) return;
  flip(Number(button.dataset.index));
});

els.newBtn.addEventListener('click', newGame);
els.level.addEventListener('change', newGame);

newGame();
