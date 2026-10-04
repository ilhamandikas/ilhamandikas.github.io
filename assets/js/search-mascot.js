// Only presentation preferences are saved; search terms never enter storage.
export function initSearchMascot(openSearch) {
  const root = document.querySelector('#search-mascot');
  if (!root) return;
  const main = root.querySelector('.search-mascot-main');
  const bubble = root.querySelector('.search-mascot-bubble');
  const hint = root.querySelector('.search-mascot-hint');
  const art = root.querySelector('.search-mascot-art');
  const pupils = [...root.querySelectorAll('.search-mascot-pupil')];
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const key = 'ilham-search-companion-v1';
  let side = 'right';
  let level = 1;
  let tucked = false;
  let drag = null;
  let suppressClick = false;
  let hovered = false;
  let gaze = null;
  let gazeFrame = 0;
  let wobbleFrame = 0;
  let wobbleTime = 0;
  let angle = 0;
  let angularVelocity = 0;
  let targetAngle = 0;
  let dragSpeed = 0;
  let lastMotion = 0;
  let dizzyTimer = 0;
  let dockTimer = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      side = saved.side === 'left' ? 'left' : 'right';
      if (Number.isFinite(saved.level)) level = Math.max(0, Math.min(1, saved.level));
      tucked = saved.tucked === true;
    }
  } catch { /* Storage may be unavailable. The companion still works. */ }

  const width = () => tucked ? 44 : 96;
  const maxY = () => Math.max(8, window.innerHeight - 130);
  const clampX = (x) => Math.max(8, Math.min(Math.max(8, window.innerWidth - width() - 8), x));
  const clampY = (y) => Math.max(8, Math.min(maxY(), y));
  const save = () => {
    try { localStorage.setItem(key, JSON.stringify({ side, level, tucked })); } catch { /* Optional preference. */ }
  };
  function say() {
    bubble.textContent = drag?.hideSide ? 'Release to hide!' : root.classList.contains('is-dizzy')
      ? "Whoa... I'm dizzy!" : hovered || document.activeElement === main
        ? 'Click me!' : 'Want to search something?';
  }
  function place() {
    root.dataset.side = side;
    root.classList.toggle('is-tucked', tucked);
    root.style.left = `${clampX(side === 'left' ? 8 : window.innerWidth - width() - 8)}px`;
    root.style.top = `${8 + level * (maxY() - 8)}px`;
    root.classList.toggle('bubble-below', parseFloat(root.style.top) < 80);
    main.setAttribute('aria-label', tucked ? 'Show search companion' : 'Search tools, guides, and posts');
    if (tucked) main.removeAttribute('aria-haspopup');
    else main.setAttribute('aria-haspopup', 'dialog');
    hint.textContent = tucked ? 'Click to show the search companion.'
      : 'Click to search. Drag outward past either screen edge to hide. Use arrow keys to move, or H to hide when focused.';
    say();
    scheduleGaze();
  }

  // A damped spring runs only during movement and its short settling tail.
  function kickWobble() {
    if (motion?.matches || document.hidden || wobbleFrame) return;
    art.style.animation = 'none';
    wobbleTime = 0;
    wobbleFrame = window.requestAnimationFrame(wobble);
  }
  function wobble(now) {
    wobbleFrame = 0;
    const dt = wobbleTime ? Math.min(0.032, (now - wobbleTime) / 1000) : 1 / 60;
    wobbleTime = now;
    const moving = drag && now - lastMotion < 100;
    const frequency = 9 + (moving ? Math.min(2, dragSpeed) * 7 : Math.min(2, dragSpeed) * 4);
    const target = moving ? targetAngle : 0;
    angularVelocity += ((target - angle) * frequency * frequency - angularVelocity * frequency * 0.65) * dt;
    angle = Math.max(-32, Math.min(32, angle + angularVelocity * dt));
    art.style.transform = `rotate(${angle}deg)`;
    if (Math.abs(angle - target) > 0.08 || Math.abs(angularVelocity) > 0.3 || moving) {
      wobbleFrame = window.requestAnimationFrame(wobble);
    } else resetWobble();
  }
  function resetWobble() {
    window.cancelAnimationFrame(wobbleFrame);
    wobbleFrame = 0;
    angle = angularVelocity = targetAngle = dragSpeed = 0;
    art.style.removeProperty('transform');
    art.style.removeProperty('animation');
  }
  function getDizzy() {
    root.classList.add('is-dizzy');
    clearTimeout(dizzyTimer);
    dizzyTimer = setTimeout(() => {
      root.classList.remove('is-dizzy');
      say();
    }, 2400);
    say();
  }

  // Coalesce pointer events; no gaze loop runs while the cursor is still.
  function scheduleGaze() {
    if (!gaze || gazeFrame || document.hidden || motion?.matches) return;
    gazeFrame = window.requestAnimationFrame(() => {
      gazeFrame = 0;
      const box = art.getBoundingClientRect();
      if (!box.width || !box.height) return;
      for (const pupil of pupils) {
        const cx = Number(pupil.getAttribute('cx'));
        const cy = Number(pupil.getAttribute('cy'));
        const dx = gaze.x - (box.left + cx * box.width / 80);
        const dy = gaze.y - (box.top + cy * box.height / 100);
        const distance = Math.hypot(dx, dy);
        const strength = Math.min(1, distance / 60);
        const angle = Math.atan2(dy, dx);
        pupil.setAttribute('transform', `translate(${Math.cos(angle) * 4 * strength} ${Math.sin(angle) * 5 * strength})`);
      }
    });
  }
  document.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    gaze = { x: event.clientX, y: event.clientY };
    scheduleGaze();
  }, { passive: true });
  motion?.addEventListener('change', () => {
    if (motion.matches) {
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      pupils.forEach((pupil) => pupil.removeAttribute('transform'));
      resetWobble();
    } else scheduleGaze();
  });
  main.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    say();
  });
  main.addEventListener('pointerleave', () => { hovered = false; say(); });
  main.addEventListener('focus', say);
  main.addEventListener('blur', say);
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
  function stopDocking(freeze = false) {
    const box = freeze ? root.getBoundingClientRect() : null;
    clearTimeout(dockTimer);
    root.classList.remove('is-docking');
    if (box) {
      root.style.left = `${box.left}px`;
      root.style.top = `${box.top}px`;
    }
  }
  root.addEventListener('transitionend', (event) => {
    if (event.target === root && event.propertyName === 'left') stopDocking();
  });
  main.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !event.isPrimary || tucked) return;
    if (root.classList.contains('is-docking')) stopDocking(true);
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY,
      left: parseFloat(root.style.left), top: parseFloat(root.style.top), moved: false, hideSide: null,
      lastX: event.clientX, lastY: event.clientY, lastTime: window.performance.now(), heading: null, turns: 0 };
    main.setPointerCapture(event.pointerId);
  });
  main.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    const now = window.performance.now();
    const elapsed = Math.max(8, now - drag.lastTime);
    const stepX = event.clientX - drag.lastX;
    const stepY = event.clientY - drag.lastY;
    const distance = Math.hypot(stepX, stepY);
    dragSpeed = Math.min(3, distance / elapsed);
    targetAngle = Math.max(-24, Math.min(24, -stepX / elapsed * 12));
    angularVelocity += Math.max(-70, Math.min(70, -stepX / elapsed * 20));
    lastMotion = now;
    kickWobble();
    if (distance >= 4) {
      const heading = Math.atan2(stepY, stepX);
      if (elapsed > 450) { drag.heading = null; drag.turns = 0; }
      if (drag.heading !== null) {
        const turn = Math.atan2(Math.sin(heading - drag.heading), Math.cos(heading - drag.heading));
        drag.turns += turn;
        if (Math.abs(drag.turns) > Math.PI * 1.65) {
          getDizzy();
          drag.turns = 0;
        }
      }
      drag.heading = heading;
    }
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    const left = drag.left + dx;
    // Keep the hit area inside the viewport while measuring the unclamped drag.
    drag.hideSide = left < -24 || (dx < -6 && event.clientX <= 4) ? 'left'
      : left + width() > window.innerWidth + 24 || (dx > 6 && event.clientX >= window.innerWidth - 4) ? 'right' : null;
    root.classList.add('is-dragging');
    root.classList.toggle('will-hide', Boolean(drag.hideSide));
    root.style.left = `${clampX(left)}px`;
    root.dataset.side = clampX(left) + width() / 2 < window.innerWidth / 2 ? 'left' : 'right';
    root.style.top = `${clampY(drag.top + dy)}px`;
    root.classList.toggle('bubble-below', parseFloat(root.style.top) < 80);
    say();
    scheduleGaze();
  });
  function finish(event) {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = drag.moved;
    if (drag.moved) {
      side = parseFloat(root.style.left) + width() / 2 < window.innerWidth / 2 ? 'left' : 'right';
      level = (parseFloat(root.style.top) - 8) / Math.max(1, maxY() - 8);
      if (event.type === 'pointerup' && drag.hideSide) {
        side = drag.hideSide;
        tucked = true;
      }
    }
    const shouldDock = drag.moved && !tucked && event.type === 'pointerup';
    drag = null;
    root.classList.remove('is-dragging', 'will-hide');
    if (shouldDock) {
      root.classList.add('is-docking');
      // Commit the drag position before transitioning to its nearest edge.
      root.getBoundingClientRect();
      clearTimeout(dockTimer);
      dockTimer = setTimeout(() => stopDocking(), 480);
    }
    targetAngle = 0;
    if (tucked || event.type !== 'pointerup') resetWobble();
    else kickWobble();
    place();
    save();
  }
  main.addEventListener('pointerup', finish);
  main.addEventListener('pointercancel', finish);
  main.addEventListener('lostpointercapture', finish);
  main.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      tucked = !tucked;
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'ArrowLeft') side = 'left';
      if (event.key === 'ArrowRight') side = 'right';
      if (event.key === 'ArrowUp') level = Math.max(0, level - 0.1);
      if (event.key === 'ArrowDown') level = Math.min(1, level + 0.1);
    } else return;
    place();
    save();
  });
  window.addEventListener('resize', () => {
    stopDocking();
    drag = null;
    root.classList.remove('is-dragging', 'will-hide');
    resetWobble();
    place();
  });
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('is-paused', document.hidden);
    if (document.hidden) {
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
      resetWobble();
      stopDocking();
    } else scheduleGaze();
  });
  window.addEventListener('pagehide', () => {
    clearTimeout(dizzyTimer);
    stopDocking();
    root.classList.remove('is-dizzy');
    window.cancelAnimationFrame(gazeFrame);
    gazeFrame = 0;
    resetWobble();
  });
}
