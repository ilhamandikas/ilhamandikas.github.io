// Only presentation preferences are saved; search terms never enter storage.
export function initSearchMascot(openSearch) {
  const root = document.querySelector('#search-mascot');
  if (!root) return;
  const main = root.querySelector('.search-mascot-main');
  const hide = root.querySelector('.search-mascot-hide');
  const label = root.querySelector('.search-mascot-label');
  const key = 'ilham-search-companion-v1';
  let side = 'right';
  let level = 1;
  let tucked = false;
  let drag = null;
  let suppressClick = false;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      side = saved.side === 'left' ? 'left' : 'right';
      if (Number.isFinite(saved.level)) level = Math.max(0, Math.min(1, saved.level));
      tucked = saved.tucked === true;
    }
  } catch { /* Storage may be unavailable. The companion still works. */ }

  const width = () => tucked ? 44 : 96;
  const maxY = () => Math.max(8, window.innerHeight - 140);
  const clampX = (x) => Math.max(8, Math.min(Math.max(8, window.innerWidth - width() - 8), x));
  const clampY = (y) => Math.max(8, Math.min(maxY(), y));
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify({ side, level, tucked })); } catch { /* Optional preference. */ }
  };
  function place() {
    root.dataset.side = side;
    root.classList.toggle('is-tucked', tucked);
    root.style.left = `${clampX(side === 'left' ? 8 : window.innerWidth - width() - 8)}px`;
    root.style.top = `${8 + level * (maxY() - 8)}px`;
    main.setAttribute('aria-label', tucked ? 'Show search companion' : 'Search tools, guides, and posts');
    if (tucked) main.removeAttribute('aria-haspopup');
    else main.setAttribute('aria-haspopup', 'dialog');
    label.textContent = tucked ? 'Show' : 'Search';
    hide.hidden = tucked;
    root.querySelector('.search-mascot-tip').textContent = tucked
      ? 'Click to show the search companion.'
      : 'Click to search. Drag to move, or use arrow keys when focused.';
  }
  place();
  root.hidden = false;

  main.addEventListener('click', (event) => {
    if (suppressClick && event.detail !== 0) {
      suppressClick = false;
      return;
    }
    if (tucked) {
      tucked = false;
      place();
      save();
    } else openSearch();
  });
  hide.addEventListener('click', () => {
    tucked = true;
    place();
    save();
    main.focus();
  });
  main.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary || tucked) return;
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: parseFloat(root.style.left), top: parseFloat(root.style.top), moved: false };
    main.setPointerCapture(event.pointerId);
  });
  main.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    root.classList.add('is-dragging');
    root.style.left = `${clampX(drag.left + dx)}px`;
    root.style.top = `${clampY(drag.top + dy)}px`;
  });
  function finish(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved;
    if (drag.moved) {
      side = parseFloat(root.style.left) + width() / 2 < window.innerWidth / 2 ? 'left' : 'right';
      level = (parseFloat(root.style.top) - 8) / Math.max(1, maxY() - 8);
    }
    drag = null;
    root.classList.remove('is-dragging');
    place();
    save();
  }
  main.addEventListener('pointerup', finish);
  main.addEventListener('pointercancel', finish);
  main.addEventListener('lostpointercapture', finish);
  main.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') side = 'left';
    if (event.key === 'ArrowRight') side = 'right';
    if (event.key === 'ArrowUp') level = Math.max(0, level - 0.1);
    if (event.key === 'ArrowDown') level = Math.min(1, level + 0.1);
    place();
    save();
  });
  window.addEventListener('resize', () => {
    drag = null;
    root.classList.remove('is-dragging');
    place();
  });
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('is-paused', document.hidden);
  });
}
